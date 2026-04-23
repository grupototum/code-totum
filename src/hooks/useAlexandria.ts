import { useState, useCallback } from 'react';

export interface RagDocument {
  id: string;
  title: string;
  content: string;
  type: 'docs' | 'code' | 'all';
  created_at: string;
}

interface RetrieveOptions {
  type?: 'docs' | 'code' | 'all';
  limit?: number;
}

const SERVER_URL = '';

export function useAlexandria() {
  const [documents, setDocuments] = useState<RagDocument[]>([]);
  const [activeContext, setActiveContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const retrieveContext = useCallback(async (query: string, options: RetrieveOptions = {}) => {
    if (!isEnabled) return [];
    setIsLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/alexandria/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, ...options }),
      });
      const data = await response.json();
      const docs: RagDocument[] = data.documents || [];
      setDocuments(docs);
      setActiveContext(data.context || '');
      return docs;
    } catch (err) {
      console.error('Alexandria error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled]);

  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => !prev);
    if (!isEnabled) {
      setDocuments([]);
      setActiveContext('');
    }
  }, [isEnabled]);

  return {
    documents,
    activeContext,
    isLoading,
    isEnabled,
    retrieveContext,
    toggleEnabled,
    setActiveContext,
  };
}
