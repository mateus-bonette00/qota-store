-- Qota Finance - Migrations para Senhas e Senhas de Fornecedores

-- ============================================
-- TABELA: senhas (Senhas de Sistemas Internos)
-- ============================================
CREATE TABLE IF NOT EXISTS senhas (
  id SERIAL PRIMARY KEY,
  nome_sistema TEXT NOT NULL,
  url TEXT,
  usuario_email TEXT,
  senha TEXT,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_senhas_nome_sistema ON senhas(nome_sistema);

-- ============================================
-- TABELA: senhas_fornecedores (Senhas de Fornecedores)
-- ============================================
CREATE TABLE IF NOT EXISTS senhas_fornecedores (
  id SERIAL PRIMARY KEY,
  nome_fornecedor TEXT NOT NULL,
  url TEXT,
  usuario_email TEXT,
  senha TEXT,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_senhas_fornecedores_nome ON senhas_fornecedores(nome_fornecedor);

-- ============================================
-- TRIGGER: update_updated_at
-- ============================================
CREATE TRIGGER update_senhas_updated_at BEFORE UPDATE ON senhas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_senhas_fornecedores_updated_at BEFORE UPDATE ON senhas_fornecedores
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
