-- Qota Finance - Atualização da tabela receitas

-- Adicionar campos ausentes na tabela receitas
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS valor NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS moeda VARCHAR(3) DEFAULT 'USD';
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS valor_eur NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS produto_id INTEGER REFERENCES produtos(id) ON DELETE SET NULL;
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS asin TEXT;
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 1;

-- Criar índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_receitas_produto_id ON receitas(produto_id);
CREATE INDEX IF NOT EXISTS idx_receitas_sku ON receitas(sku);
CREATE INDEX IF NOT EXISTS idx_receitas_asin ON receitas(asin);
CREATE INDEX IF NOT EXISTS idx_receitas_moeda ON receitas(moeda);
