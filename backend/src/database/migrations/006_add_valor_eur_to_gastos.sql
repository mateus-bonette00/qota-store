-- Adiciona coluna valor_eur na tabela gastos

ALTER TABLE gastos ADD COLUMN IF NOT EXISTS valor_eur NUMERIC(12, 2) DEFAULT 0;

-- Atualiza valores existentes (pode deixar 0 ou calcular baseado nos outros valores)
UPDATE gastos SET valor_eur = 0 WHERE valor_eur IS NULL;
