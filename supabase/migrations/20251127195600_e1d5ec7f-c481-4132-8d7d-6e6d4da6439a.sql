-- Tabela de Clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  veiculo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Funcionários
CREATE TABLE public.funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cargo TEXT NOT NULL,
  telefone TEXT NOT NULL,
  salario TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Produtos
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  preco TEXT NOT NULL,
  estoque INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Serviços
CREATE TABLE public.servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data TEXT NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  cliente_nome TEXT NOT NULL,
  status TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  km_veiculo TEXT,
  descricao TEXT,
  total TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Transações Financeiras
CREATE TABLE public.transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data TEXT NOT NULL,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor TEXT NOT NULL,
  categoria TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (permitir leitura e escrita para todos)
-- NOTA: Em produção, você deve implementar autenticação e políticas mais restritivas

-- Clientes
CREATE POLICY "Permitir acesso público a clientes" ON public.clientes
  FOR ALL USING (true) WITH CHECK (true);

-- Funcionários
CREATE POLICY "Permitir acesso público a funcionarios" ON public.funcionarios
  FOR ALL USING (true) WITH CHECK (true);

-- Produtos
CREATE POLICY "Permitir acesso público a produtos" ON public.produtos
  FOR ALL USING (true) WITH CHECK (true);

-- Serviços
CREATE POLICY "Permitir acesso público a servicos" ON public.servicos
  FOR ALL USING (true) WITH CHECK (true);

-- Transações
CREATE POLICY "Permitir acesso público a transacoes" ON public.transacoes
  FOR ALL USING (true) WITH CHECK (true);