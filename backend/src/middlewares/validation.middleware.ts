import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Valida o parâmetro de rota :id (inteiro positivo).
 */
export const validateIdParam: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return void res.status(400).json({ error: 'Parâmetro id inválido' });
  }
  return void next();
};

/**
 * Valida a query `month` no formato YYYY-MM.
 * Se não for enviada, deixa passar.
 */
export const validateMonthQuery: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const { month } = req.query;
  if (month == null || month === '') {
    return void next();
  }
  const value = String(month);
  const ok = /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
  if (!ok) {
    return void res.status(400).json({ error: 'Parâmetro month inválido. Use YYYY-MM.' });
  }
  return void next();
};

/**
 * Validação para criação de gasto.
 * Ajuste os nomes dos campos conforme seu domínio.
 */
export const validateCreateGasto: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const body = req.body ?? {};

  const date = body.date ?? body.data;
  const category = body.category ?? body.categoria;

  // Data é obrigatória
  if (!date || isNaN(Date.parse(String(date)))) {
    return void res.status(400).json({ error: 'date/data é obrigatório (ISO válido).' });
  }

  // Categoria é obrigatória
  if (!category || typeof category !== 'string') {
    return void res.status(400).json({ error: 'category/categoria é obrigatório (string).' });
  }

  // Valores de moeda são opcionais, mas se fornecidos devem ser números válidos
  if (body.valor_usd != null && body.valor_usd !== '' && !Number.isFinite(Number(body.valor_usd))) {
    return void res.status(400).json({ error: 'valor_usd deve ser um número válido.' });
  }
  if (body.valor_brl != null && body.valor_brl !== '' && !Number.isFinite(Number(body.valor_brl))) {
    return void res.status(400).json({ error: 'valor_brl deve ser um número válido.' });
  }
  if (body.valor_eur != null && body.valor_eur !== '' && !Number.isFinite(Number(body.valor_eur))) {
    return void res.status(400).json({ error: 'valor_eur deve ser um número válido.' });
  }

  return void next();
};

/**
 * Validação para atualização parcial de gasto.
 * Exige pelo menos 1 campo e checa tipos dos campos permitidos.
 */
export const validateUpdateGasto: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const body = req.body ?? {};
  const allowed = [
    'description', 'descricao',
    'valor_usd', 'valor_brl', 'valor_eur',
    'date', 'data',
    'category', 'categoria',
    'metodo', 'conta', 'quem'
  ];

  if (Object.keys(body).length === 0) {
    return void res.status(400).json({ error: 'Body vazio. Informe ao menos um campo para atualizar.' });
  }

  const unknown = Object.keys(body).filter(k => !allowed.includes(k));
  if (unknown.length > 0) {
    return void res.status(400).json({ error: `Campos não permitidos: ${unknown.join(', ')}` });
  }

  if (body.description != null && typeof body.description !== 'string') {
    return void res.status(400).json({ error: 'description deve ser string.' });
  }
  if (body.descricao != null && typeof body.descricao !== 'string') {
    return void res.status(400).json({ error: 'descricao deve ser string.' });
  }
  if (body.valor_usd != null && body.valor_usd !== '' && !Number.isFinite(Number(body.valor_usd))) {
    return void res.status(400).json({ error: 'valor_usd deve ser número.' });
  }
  if (body.valor_brl != null && body.valor_brl !== '' && !Number.isFinite(Number(body.valor_brl))) {
    return void res.status(400).json({ error: 'valor_brl deve ser número.' });
  }
  if (body.valor_eur != null && body.valor_eur !== '' && !Number.isFinite(Number(body.valor_eur))) {
    return void res.status(400).json({ error: 'valor_eur deve ser número.' });
  }
  if (body.date != null && isNaN(Date.parse(String(body.date)))) {
    return void res.status(400).json({ error: 'date inválido (ISO).' });
  }
  if (body.data != null && isNaN(Date.parse(String(body.data)))) {
    return void res.status(400).json({ error: 'data inválida (ISO).' });
  }
  if (body.category != null && typeof body.category !== 'string') {
    return void res.status(400).json({ error: 'category deve ser string.' });
  }
  if (body.categoria != null && typeof body.categoria !== 'string') {
    return void res.status(400).json({ error: 'categoria deve ser string.' });
  }

  return void next();
};

export const validateGasto = validateCreateGasto; // alias legacy (POST)
