import React, { createContext, useContext, useState } from 'react';

interface ServerContextValue {
  ollamaUrl: string;
  ragUrl: string;
  setOllamaUrl: (url: string) => void;
  setRagUrl: (url: string) => void;
}

const OLLAMA_KEY = 'fitiq.server.ollama';
const RAG_KEY    = 'fitiq.server.rag';

const ServerContext = createContext<ServerContextValue | null>(null);

export function ServerProvider({ children }: { children: React.ReactNode }) {
  const [ollamaUrl, setOllamaUrlState] = useState(
    () => localStorage.getItem(OLLAMA_KEY) || 'http://localhost:11434'
  );
  const [ragUrl, setRagUrlState] = useState(
    () => localStorage.getItem(RAG_KEY) || 'http://localhost:8000'
  );

  function setOllamaUrl(url: string) {
    const clean = url.replace(/\/$/, '');
    localStorage.setItem(OLLAMA_KEY, clean);
    setOllamaUrlState(clean);
  }

  function setRagUrl(url: string) {
    const clean = url.replace(/\/$/, '');
    localStorage.setItem(RAG_KEY, clean);
    setRagUrlState(clean);
  }

  return (
    <ServerContext.Provider value={{ ollamaUrl, ragUrl, setOllamaUrl, setRagUrl }}>
      {children}
    </ServerContext.Provider>
  );
}

export function useServer(): ServerContextValue {
  const ctx = useContext(ServerContext);
  if (!ctx) throw new Error('useServer must be used within ServerProvider');
  return ctx;
}
