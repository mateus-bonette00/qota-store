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

  const description = body.description ?? body.descricao;
  const amount = body.amount ?? body.valor;
  const date = body.date ?? body.data;
  const category = body.category ?? body.categoria;

  if (!description || typeof description !== 'string') {
    return void res.status(400).json({ error: 'description é obrigatório (string).' });
  }
  if (!Number.isFinite(Number(amount))) {
    return void res.status(400).json({ error: 'amount/valor é obrigatório (número).' });
  }
  if (!date || isNaN(Date.parse(String(date)))) {
    return void res.status(400).json({ error: 'date/data é obrigatório (ISO válido).' });
  }
  if (!category || typeof category !== 'string') {
    return void res.status(400).json({ error: 'category/categoria é obrigatório (string).' });
  }

  return void next();
};

/**
 * Validação para atualização parcial de gasto.
 * Exige pelo menos 1 campo e checa tipos dos campos permitidos.
 */
export const validateUpdateGasto: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const body = req.body ?? {};
  const allowed = ['description', 'descricao', 'amount', 'valor', 'date', 'data', 'category', 'categoria'];

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
  if (body.amount != null && !Number.isFinite(Number(body.amount))) {
    return void res.status(400).json({ error: 'amount deve ser número.' });
  }
  if (body.valor != null && !Number.isFinite(Number(body.valor))) {
    return void res.status(400).json({ error: 'valor deve ser número.' });
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
