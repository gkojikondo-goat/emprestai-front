import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { loadEnv } from './config/env';
import './index.css';
import { createSupabase } from './lib/supabase';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Elemento #root não encontrado em index.html');
}

function render() {
  try {
    const env = loadEnv();
    return <App supabase={createSupabase(env)} apiUrl={env.apiUrl} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return (
      <p role="alert" className="m-6 whitespace-pre-line">
        {message}
      </p>
    );
  }
}

createRoot(root).render(<StrictMode>{render()}</StrictMode>);
