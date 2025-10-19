-- Qota Finance Database Schema
DROP TABLE IF EXISTS amazon_settlements CASCADE;
DROP TABLE IF EXISTS amazon_saldos CASCADE;
DROP TABLE IF EXISTS amazon_receitas CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS receitas CASCADE;
DROP TABLE IF EXISTS investimentos CASCADE;
DROP TABLE IF EXISTS gastos CASCADE;

CREATE TABLE gastos (
  id SERIAL PRIMARY KEY,
  data DATE NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT,
  valor_brl NUMERIC(12,2) NOT NULL DEFAULT 0,
  valor_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  metodo TEXT,
  conta TEXT,
  quem TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_gastos_data ON gastos(data);
CREATE INDEX idx_gastos_categoria ON gastos(categoria);

CREATE TABLE investimentos (
  id SERIAL PRIMARY KEY,
  data DATE NOT NULL,
  valor_brl NUMERIC(12,2) NOT NULL DEFAULT 0,
  valor_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  metodo TEXT,
  conta TEXT,
  quem TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_investimentos_data ON investimentos(data);

CREATE TABLE receitas (
  id SERIAL PRIMARY KEY,
  data DATE NOT NULL,
  origem TEXT NOT NULL DEFAULT 'FBA',
  descricao TEXT,
  valor_brl NUMERIC(12,2) NOT NULL DEFAULT 0,
  valor_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  metodo TEXT,
  conta TEXT,
  quem TEXT,
  bruto NUMERIC(12,2) NOT NULL DEFAULT 0,
  cogs NUMERIC(12,2) NOT NULL DEFAULT 0,
  taxas_amz NUMERIC(12,2) NOT NULL DEFAULT 0,
  ads NUMERIC(12,2) NOT NULL DEFAULT 0,
  frete NUMERIC(12,2) NOT NULL DEFAULT 0,
  descontos NUMERIC(12,2) NOT NULL DEFAULT 0,
  lucro NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_receitas_data ON receitas(data);
CREATE INDEX idx_receitas_origem ON receitas(origem);

CREATE TABLE produtos (
  id SERIAL PRIMARY KEY,
  data_add DATE NOT NULL,
  nome TEXT NOT NULL,
  sku TEXT,
  upc TEXT,
  asin TEXT,
  estoque INTEGER NOT NULL DEFAULT 0,
  custo_base NUMERIC(12,2) NOT NULL DEFAULT 0,
  freight NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  quantidade INTEGER NOT NULL DEFAULT 0,
  prep NUMERIC(12,2) NOT NULL DEFAULT 2,
  sold_for NUMERIC(12,2) NOT NULL DEFAULT 0,
  amazon_fees NUMERIC(12,2) NOT NULL DEFAULT 0,
  link_amazon TEXT,
  link_fornecedor TEXT,
  data_amz DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_produtos_sku ON produtos(sku);
CREATE INDEX idx_produtos_asin ON produtos(asin);

CREATE TABLE amazon_receitas (
  id SERIAL PRIMARY KEY,
  data DATE NOT NULL,
  produto_id INTEGER REFERENCES produtos(id) ON DELETE SET NULL,
  quantidade INTEGER NOT NULL DEFAULT 0,
  valor_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  quem TEXT,
  obs TEXT,
  produto TEXT,
  sku TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_amazon_receitas_data ON amazon_receitas(data);
CREATE INDEX idx_amazon_receitas_produto_id ON amazon_receitas(produto_id);

CREATE TABLE amazon_saldos (
  id SERIAL PRIMARY KEY,
  data DATE NOT NULL,
  disponivel NUMERIC(12,2) NOT NULL DEFAULT 0,
  pendente NUMERIC(12,2) NOT NULL DEFAULT 0,
  moeda TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_amazon_saldos_data ON amazon_saldos(data DESC);

CREATE TABLE amazon_settlements (
  id SERIAL PRIMARY KEY,
  data DATE NOT NULL,
  amount_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  group_id TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_amazon_settlements_data ON amazon_settlements(data);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gastos_updated_at BEFORE UPDATE ON gastos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investimentos_updated_at BEFORE UPDATE ON investimentos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receitas_updated_at BEFORE UPDATE ON receitas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_amazon_receitas_updated_at BEFORE UPDATE ON amazon_receitas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: exchange_rates (taxas de câmbio)
-- ============================================
CREATE TABLE IF NOT EXISTS exchange_rates (
  id SERIAL PRIMARY KEY,
  data TIMESTAMP NOT NULL DEFAULT NOW(),
  usd_to_brl NUMERIC(10,4) NOT NULL,
  usd_to_eur NUMERIC(10,4) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exchange_rates_data ON exchange_rates(data DESC);

-- ALTERAR tabela gastos para incluir moeda original
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS valor NUMERIC(12,2);
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS moeda VARCHAR(3) DEFAULT 'BRL';