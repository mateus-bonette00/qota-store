-- Migration 002: Add new features for Kanban, Sync Log, and Alerts
-- Run this after 001_create_tables.sql

-- ============================================
-- ADD STATUS COLUMN TO PRODUTOS (for Kanban)
-- ============================================
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'sourcing';
-- Status options: sourcing, comprado, em_transito, no_estoque, vendido

ALTER TABLE produtos ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS fornecedor VARCHAR(255);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS valor_eur NUMERIC(12,2) DEFAULT 0;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS moeda_compra VARCHAR(3) DEFAULT 'USD';

-- ============================================
-- ADD MULTI-CURRENCY FIELDS TO RECEITAS
-- ============================================
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS valor_eur NUMERIC(12,2) DEFAULT 0;
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS moeda VARCHAR(3) DEFAULT 'USD';
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS produto_id INTEGER REFERENCES produtos(id) ON DELETE SET NULL;
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS sku VARCHAR(100);
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS asin VARCHAR(20);
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS quantidade INTEGER DEFAULT 1;

-- Index for receitas produto_id
CREATE INDEX IF NOT EXISTS idx_receitas_produto_id ON receitas(produto_id);
CREATE INDEX IF NOT EXISTS idx_receitas_sku ON receitas(sku);

-- ============================================
-- ADD MULTI-CURRENCY TO INVESTIMENTOS
-- ============================================
ALTER TABLE investimentos ADD COLUMN IF NOT EXISTS valor_eur NUMERIC(12,2) DEFAULT 0;
ALTER TABLE investimentos ADD COLUMN IF NOT EXISTS valor NUMERIC(12,2);
ALTER TABLE investimentos ADD COLUMN IF NOT EXISTS moeda VARCHAR(3) DEFAULT 'USD';
ALTER TABLE investimentos ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'capital';
ALTER TABLE investimentos ADD COLUMN IF NOT EXISTS descricao TEXT;

-- ============================================
-- TABLE: amazon_sync_log
-- Track Amazon API synchronizations
-- ============================================
CREATE TABLE IF NOT EXISTS amazon_sync_log (
  id SERIAL PRIMARY KEY,
  data TIMESTAMP DEFAULT NOW(),
  tipo VARCHAR(50) NOT NULL, -- 'orders', 'balance', 'settlement', 'products'
  registros_novos INTEGER DEFAULT 0,
  registros_atualizados INTEGER DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'success', -- 'success', 'error', 'partial'
  erro TEXT,
  detalhes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_amazon_sync_log_data ON amazon_sync_log(data DESC);
CREATE INDEX IF NOT EXISTS idx_amazon_sync_log_tipo ON amazon_sync_log(tipo);
CREATE INDEX IF NOT EXISTS idx_amazon_sync_log_status ON amazon_sync_log(status);

-- ============================================
-- TABLE: alertas
-- System alerts and notifications
-- ============================================
CREATE TABLE IF NOT EXISTS alertas (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL, -- 'gasto_alto', 'estoque_baixo', 'margem_baixa', 'sync_error', etc
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  severidade VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  data TIMESTAMP DEFAULT NOW(),
  lido BOOLEAN DEFAULT FALSE,
  entidade_id INTEGER, -- ID of related entity (produto, gasto, etc)
  entidade_tipo VARCHAR(50), -- 'produto', 'gasto', 'receita', etc
  metadata JSONB, -- Additional data as needed
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alertas_lido ON alertas(lido);
CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON alertas(tipo);
CREATE INDEX IF NOT EXISTS idx_alertas_data ON alertas(data DESC);
CREATE INDEX IF NOT EXISTS idx_alertas_severidade ON alertas(severidade);

-- ============================================
-- TABLE: metas
-- Financial goals and targets
-- ============================================
CREATE TABLE IF NOT EXISTS metas (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL, -- 'receita_mensal', 'lucro_mensal', 'margem_minima', etc
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  valor_alvo NUMERIC(12,2) NOT NULL,
  moeda VARCHAR(3) DEFAULT 'USD',
  periodo VARCHAR(20) DEFAULT 'mensal', -- 'diario', 'semanal', 'mensal', 'anual'
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metas_tipo ON metas(tipo);
CREATE INDEX IF NOT EXISTS idx_metas_ativo ON metas(ativo);

-- ============================================
-- TABLE: configuracoes
-- System configurations
-- ============================================
CREATE TABLE IF NOT EXISTS configuracoes (
  id SERIAL PRIMARY KEY,
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  descricao TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default configurations
INSERT INTO configuracoes (chave, valor, tipo, descricao) VALUES
  ('moeda_padrao', 'USD', 'string', 'Moeda padrão do sistema'),
  ('sync_amazon_interval', '4', 'number', 'Intervalo de sincronização Amazon em horas'),
  ('update_rates_interval', '1', 'number', 'Intervalo de atualização de taxas de câmbio em horas'),
  ('estoque_minimo_alerta', '10', 'number', 'Quantidade mínima de estoque para alerta'),
  ('margem_minima_alerta', '20', 'number', 'Margem de lucro mínima (%) para alerta')
ON CONFLICT (chave) DO NOTHING;

-- ============================================
-- ADD TRIGGERS FOR NEW TABLES
-- ============================================
CREATE TRIGGER update_metas_updated_at BEFORE UPDATE ON metas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON configuracoes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS: Useful database views
-- ============================================

-- View: Produtos com margem de lucro calculada
CREATE OR REPLACE VIEW v_produtos_margem AS
SELECT
  p.*,
  (p.custo_base + p.freight + p.tax + p.prep) AS custo_total,
  (p.sold_for - p.amazon_fees - (p.custo_base + p.freight + p.tax + p.prep)) AS lucro_unitario,
  CASE
    WHEN p.sold_for > 0 THEN
      ROUND(((p.sold_for - p.amazon_fees - (p.custo_base + p.freight + p.tax + p.prep)) / p.sold_for * 100)::numeric, 2)
    ELSE 0
  END AS margem_percentual
FROM produtos p;

-- View: Resumo mensal de receitas e despesas
CREATE OR REPLACE VIEW v_resumo_mensal AS
SELECT
  TO_CHAR(data, 'YYYY-MM') AS mes,
  'receita' AS tipo,
  SUM(valor_usd) AS total_usd,
  SUM(valor_brl) AS total_brl,
  COUNT(*) AS quantidade
FROM receitas
GROUP BY TO_CHAR(data, 'YYYY-MM')
UNION ALL
SELECT
  TO_CHAR(data, 'YYYY-MM') AS mes,
  'despesa' AS tipo,
  SUM(valor_usd) AS total_usd,
  SUM(valor_brl) AS total_brl,
  COUNT(*) AS quantidade
FROM gastos
GROUP BY TO_CHAR(data, 'YYYY-MM')
ORDER BY mes DESC, tipo;

-- View: Dashboard summary
CREATE OR REPLACE VIEW v_dashboard_summary AS
SELECT
  (SELECT disponivel FROM amazon_saldos ORDER BY data DESC LIMIT 1) AS saldo_amazon_disponivel,
  (SELECT pendente FROM amazon_saldos ORDER BY data DESC LIMIT 1) AS saldo_amazon_pendente,
  (SELECT SUM(valor_usd) FROM receitas WHERE EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)) AS receitas_mes_usd,
  (SELECT SUM(valor_brl) FROM receitas WHERE EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)) AS receitas_mes_brl,
  (SELECT SUM(valor_usd) FROM gastos WHERE EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)) AS despesas_mes_usd,
  (SELECT SUM(valor_brl) FROM gastos WHERE EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)) AS despesas_mes_brl,
  (SELECT COUNT(*) FROM produtos WHERE status = 'no_estoque') AS produtos_estoque,
  (SELECT SUM(estoque) FROM produtos WHERE status = 'no_estoque') AS unidades_estoque,
  (SELECT COUNT(*) FROM alertas WHERE lido = false) AS alertas_nao_lidos;

COMMENT ON TABLE produtos IS 'Tabela de produtos FBA com suporte a Kanban';
COMMENT ON TABLE amazon_sync_log IS 'Log de sincronizações com Amazon SP-API';
COMMENT ON TABLE alertas IS 'Sistema de alertas e notificações';
COMMENT ON TABLE metas IS 'Metas financeiras do negócio';
COMMENT ON TABLE configuracoes IS 'Configurações do sistema';
