-- Qota Finance - Migrations para Fornecedores e Informações da Empresa

-- ============================================
-- TABELA: fornecedores (Suppliers)
-- ============================================
CREATE TABLE IF NOT EXISTS fornecedores (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  url TEXT,
  usuario_email TEXT,
  senha TEXT,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fornecedores_nome ON fornecedores(nome);

-- ============================================
-- TABELA: company_info (Informações da Empresa)
-- ============================================
CREATE TABLE IF NOT EXISTS company_info (
  id SERIAL PRIMARY KEY,
  nome_empresa TEXT NOT NULL,
  ein TEXT,
  endereco TEXT,
  telefone TEXT,
  email_corporativo TEXT,
  nome_daniel TEXT,
  endereco_envio_prep TEXT,
  nome_cartao_mercury TEXT,
  numero_cartao_mercury TEXT,
  data_vencimento_cartao TEXT,
  cvc_cartao TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABELA: sistemas_externos (External Systems - Senhas)
-- ============================================
CREATE TABLE IF NOT EXISTS sistemas_externos (
  id SERIAL PRIMARY KEY,
  nome_sistema TEXT NOT NULL,
  url TEXT,
  usuario_email TEXT,
  senha TEXT,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sistemas_externos_nome ON sistemas_externos(nome_sistema);

-- ============================================
-- TRIGGER: update_updated_at
-- ============================================
CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON fornecedores
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_info_updated_at BEFORE UPDATE ON company_info
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sistemas_externos_updated_at BEFORE UPDATE ON sistemas_externos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED: Inserir informações iniciais da empresa
-- ============================================
INSERT INTO company_info (
  nome_empresa,
  ein,
  endereco,
  email_corporativo,
  nome_daniel
) VALUES (
  'QOTA STORE',
  '38-4369191',
  '9669 AVELLINO AVENUE UNIT 6417 - A OFFICE 454 ORLANDO, FL 32819',
  'qotastore07@gmail.com',
  'Daniel Vasconcelos Sarlas'
) ON CONFLICT DO NOTHING;
