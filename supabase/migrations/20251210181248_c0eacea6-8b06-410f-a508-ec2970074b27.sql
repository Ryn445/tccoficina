-- Adicionar novos campos na tabela clientes
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS cpf text,
ADD COLUMN IF NOT EXISTS data_nascimento text,
ADD COLUMN IF NOT EXISTS placa_veiculo text,
ADD COLUMN IF NOT EXISTS ano_veiculo text;

-- Adicionar novos campos na tabela funcionarios
ALTER TABLE public.funcionarios 
ADD COLUMN IF NOT EXISTS cpf text,
ADD COLUMN IF NOT EXISTS data_nascimento text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS endereco text;

-- Adicionar campo responsavel_id na tabela servicos (referência a funcionarios)
ALTER TABLE public.servicos 
ADD COLUMN IF NOT EXISTS responsavel_id uuid REFERENCES public.funcionarios(id);

-- Criar tabela de movimentação de estoque
CREATE TABLE IF NOT EXISTS public.movimentacoes_estoque (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  tipo text NOT NULL, -- 'entrada' ou 'saida'
  quantidade integer NOT NULL,
  motivo text,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na tabela de movimentações
ALTER TABLE public.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

-- Política pública para movimentações
CREATE POLICY "Permitir acesso público a movimentacoes_estoque" 
ON public.movimentacoes_estoque 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);