import React, { useState } from 'react';
import { CodeHubLayout } from './../../components/layout/CodeHubLayout';
import { Button } from './../../components/ui/button';
import { Input } from './../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './../../components/ui/card';
import { useAuth } from './../../hooks/useAuth';

export const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save settings to localStorage or backend
    localStorage.setItem('claudeApiKey', claudeApiKey);
    localStorage.setItem('ollamaUrl', ollamaUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <CodeHubLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="grid gap-6 max-w-2xl">
          {/* API Keys Section */}
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Configure your API keys for AI services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Claude API Key</label>
                <Input
                  type="password"
                  value={claudeApiKey}
                  onChange={(e) => setClaudeApiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Get your key from https://console.anthropic.com
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ollama URL</label>
                <Input
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Default: http://localhost:11434
                </p>
              </div>

              {saved && (
                <p className="text-sm text-green-600">Settings saved successfully!</p>
              )}

              <Button onClick={handleSave} className="w-full">
                Save Settings
              </Button>
            </CardContent>
          </Card>

          {/* Account Section */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              <Button onClick={handleSignOut} variant="destructive" className="w-full">
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <select className="w-full px-3 py-2 border rounded-md bg-background">
                  <option>Auto</option>
                  <option>Light</option>
                  <option>Dark</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select className="w-full px-3 py-2 border rounded-md bg-background">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>Portuguese</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CodeHubLayout>
  );
};
