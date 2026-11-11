import { useEffect } from 'react';
import { create } from 'zustand';

/** Spec 003 regra 6 / layout 5.6: um toast global por vez. */
type EstadoToast = { mensagem: string | null; chave: number; mostrar: (m: string) => void; fechar: () => void };

export const useToast = create<EstadoToast>((set) => ({
  mensagem: null,
  chave: 0,
  mostrar: (mensagem) => set((s) => ({ mensagem, chave: s.chave + 1 })),
  fechar: () => set({ mensagem: null }),
}));

export const DURACAO_TOAST_MS = 2600;

export function Toast() {
  const { mensagem, chave, fechar } = useToast();
  useEffect(() => {
    if (!mensagem) return;
    const t = setTimeout(fechar, DURACAO_TOAST_MS);
    return () => clearTimeout(t);
  }, [mensagem, chave, fechar]);
  if (!mensagem) return null;
  return (
    <div
      role="status"
      key={chave}
      className="fixed bottom-[28px] left-1/2 z-50 -translate-x-1/2 animate-[fadeUp_.2s_ease_both] rounded-full border border-accent-700 bg-accent-900 px-5 py-3 text-[13.5px] text-accent-200"
    >
      {mensagem}
    </div>
  );
}
