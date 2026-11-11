import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { useToast } from '../components/Toast';
import { useFiltrosCatalogo } from '../features/catalogo/useEquipamentos';

// Stores do Zustand são globais: cada teste começa do estado inicial.
beforeEach(() => {
  useToast.setState({ mensagem: null, chave: 0 });
  useFiltrosCatalogo.setState({ busca: '', filtro: 'todos' });
});

afterEach(() => {
  cleanup();
});
