import { Request, Response, NextFunction } from 'express';

type AnyObj = Record<string, unknown>;

export interface AppError extends Error {
  status?: number;      // HTTP status
  code?: string;        // código de erro de negócio/sistema
  details?: AnyObj;     // detalhes adicionais (ex.: validação)
  expose?: boolean;     // se true, expõe a mensagem original em produção
}

/**
 * Middleware central de tratamento de erros.
 * - Sempre responde em JSON
 * - Em desenvolvimento, expõe stack
 * - Em produção, esconde mensagem interna (a menos que err.expose = true)
 */
export function errorMiddleware(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isDev = process.env.NODE_ENV !== 'production';

  const status = typeof err.status === 'number' && err.status >= 100 ? err.status : 500;
  const exposeMessage = isDev || err.expose === true;
  const message = exposeMessage ? (err.message || 'Erro interno') : 'Erro interno do servidor';

  // Log básico
  // Em produção você pode integrar com pino/winston/sentry
  if (isDev) {
    // eslint-disable-next-line no-console
    console.error('[ERROR]', {
      status,
      code: err.code,
      message: err.message,
      stack: err.stack,
      details: err.details
    });
  }

  const payload: AnyObj = {
    error: {
      message,
      code: err.code ?? undefined,
      details: err.details ?? undefined
    },
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  };

  // Em dev, incluir stack ajuda muito
  if (isDev && err.stack) {
    payload.error = { ...(payload.error as AnyObj), stack: err.stack };
  }

  return void res.status(status).json(payload);
}
