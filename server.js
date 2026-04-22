import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: '.env.local' });

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3005;

const OPENCODE_URL = process.env.OPENCODE_SERVER_URL || 'http://localhost:8090';
const OPENCODE_WS  = OPENCODE_URL.replace('http', 'ws');

// ── Sessões em memória ──────────────────────────────────────────
const sessions = new Map();

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// ── Health ──────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  let opencodeStatus = 'offline';
  try {
    const r = await fetch(`${OPENCODE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (r.ok) opencodeStatus = 'online';
  } catch {}
  res.json({ status: 'ok', opencode: opencodeStatus, sessions: sessions.size });
});

// ── Claude proxy ─────────────────────────────────────────────────
app.post('/api/claude', async (req, res) => {
  try {
    const { messages, model = 'claude-3-5-sonnet-20241022', max_tokens = 4096, stream = false } = req.body;
    const apiKey = process.env.VITE_CLAUDE_API_KEY;
    if (!apiKey) return res.status(400).json({ error: 'API key not configured' });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model, max_tokens, messages, stream }),
    });

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      response.body.pipeTo(new WritableStream({
        write(chunk) { res.write(chunk); },
        close() { res.end(); },
      }));
    } else {
      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);
      res.json(data);
    }
  } catch (error) {
    console.error('Claude error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── OpenCode proxy ───────────────────────────────────────────────
app.get('/api/opencode/status', async (req, res) => {
  try {
    const r = await fetch(`${OPENCODE_URL}/status`, { signal: AbortSignal.timeout(5000) });
    res.json(await r.json());
  } catch (err) {
    res.status(503).json({ error: 'OpenCode server offline', detail: err.message });
  }
});

app.get('/api/opencode/models', async (req, res) => {
  try {
    const r = await fetch(`${OPENCODE_URL}/models`, { signal: AbortSignal.timeout(5000) });
    res.json(await r.json());
  } catch {
    res.json({ models: [
      { id: 'claude-opus-4-5',            name: 'Claude Opus 4.5',   provider: 'anthropic' },
      { id: 'claude-sonnet-4-5',          name: 'Claude Sonnet 4.5', provider: 'anthropic' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
      { id: 'gpt-4o',                     name: 'GPT-4o',            provider: 'openai'    },
      { id: 'gpt-4o-mini',               name: 'GPT-4o Mini',       provider: 'openai'    },
      { id: 'mistral',                    name: 'Mistral (Ollama)',   provider: 'ollama'    },
    ]});
  }
});

app.post('/api/opencode/execute', async (req, res) => {
  try {
    const r = await fetch(`${OPENCODE_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(60000),
    });
    res.status(r.status).json(await r.json());
  } catch (err) {
    res.status(503).json({ error: 'OpenCode offline', detail: err.message });
  }
});

app.post('/api/opencode/files', async (req, res) => {
  try {
    const r = await fetch(`${OPENCODE_URL}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    res.status(r.status).json(await r.json());
  } catch (err) {
    res.status(503).json({ error: 'OpenCode offline', detail: err.message });
  }
});

// ── Sessões ──────────────────────────────────────────────────────
app.post('/api/sessions', (req, res) => {
  const { projectPath, model = 'claude-3-5-sonnet-20241022' } = req.body;
  const id = uuidv4();
  const session = { id, projectPath, model, createdAt: new Date().toISOString(), messages: [] };
  sessions.set(id, session);
  res.json(session);
});

app.get('/api/sessions/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

app.delete('/api/sessions/:id', (req, res) => {
  sessions.delete(req.params.id);
  res.json({ ok: true });
});

// ── Alexandria RAG ───────────────────────────────────────────────
app.post('/api/alexandria/context', async (req, res) => {
  const { query, type = 'all', limit = 5 } = req.body;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.json({ documents: [], context: '' });
  }

  try {
    const filter = type !== 'all' ? `&type=eq.${type}` : '';
    const url = `${supabaseUrl}/rest/v1/rag_documents?select=id,title,content,type,created_at&limit=${limit}${filter}`;
    const r = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    const documents = r.ok ? await r.json() : [];
    const context = Array.isArray(documents)
      ? documents.map(d => `## ${d.title}\n${d.content}`).join('\n\n---\n\n')
      : '';
    res.json({ documents: Array.isArray(documents) ? documents : [], context });
  } catch (err) {
    res.json({ documents: [], context: '', error: err.message });
  }
});

// ── WebSocket — proxy OpenCode + fallback Claude ─────────────────
const wss = new WebSocketServer({ server, path: '/api/opencode/stream' });

wss.on('connection', (clientWs) => {
  console.log('[WS] Client connected');
  let opencodeWs = null;
  let opencodeOnline = false;

  try {
    opencodeWs = new WebSocket(`${OPENCODE_WS}/stream`);
    opencodeWs.on('open', () => {
      opencodeOnline = true;
      clientWs.send(JSON.stringify({ type: 'connected', provider: 'opencode' }));
    });
    opencodeWs.on('message', (data) => {
      if (clientWs.readyState === WebSocket.OPEN) clientWs.send(data.toString());
    });
    opencodeWs.on('error', () => {
      opencodeOnline = false;
      clientWs.send(JSON.stringify({ type: 'connected', provider: 'claude-fallback' }));
    });
    opencodeWs.on('close', () => { opencodeOnline = false; });
  } catch {
    clientWs.send(JSON.stringify({ type: 'connected', provider: 'claude-fallback' }));
  }

  clientWs.on('message', async (rawData) => {
    try {
      const msg = JSON.parse(rawData.toString());
      if (opencodeOnline && opencodeWs?.readyState === WebSocket.OPEN) {
        opencodeWs.send(rawData.toString());
      } else {
        await handleClaudeFallback(clientWs, msg);
      }
    } catch (err) {
      clientWs.send(JSON.stringify({ type: 'error', content: err.message }));
    }
  });

  clientWs.on('close', () => {
    opencodeWs?.close();
    console.log('[WS] Client disconnected');
  });
});

async function handleClaudeFallback(ws, msg) {
  const apiKey = process.env.VITE_CLAUDE_API_KEY;
  if (!apiKey) {
    ws.send(JSON.stringify({ type: 'error', content: 'Claude API key not configured' }));
    return;
  }

  const { messages = [], model = 'claude-3-5-sonnet-20241022', context = '' } = msg;
  const systemPrompt = `Você é Totum Agent, um assistente de código especializado em React, TypeScript, Node.js e IA. Responda em português brasileiro. Seja objetivo e técnico.${context ? `\n\n## Contexto Alexandria:\n${context}` : ''}`;

  ws.send(JSON.stringify({ type: 'thinking' }));

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model, max_tokens: 4096, stream: true, system: systemPrompt, messages }),
    });

    ws.send(JSON.stringify({ type: 'start' }));

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            ws.send(JSON.stringify({ type: 'delta', content: parsed.delta.text }));
          }
        } catch {}
      }
    }
    ws.send(JSON.stringify({ type: 'done' }));
  } catch (err) {
    ws.send(JSON.stringify({ type: 'error', content: err.message }));
  }
}

server.listen(PORT, () => {
  console.log(`✅ Totum Agent Server → http://localhost:${PORT}`);
  console.log(`   OpenCode target  → ${OPENCODE_URL}`);
});
