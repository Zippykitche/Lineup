import { AppError } from './types';

export const getErrorMessage = (
  error: unknown,
  fallback = 'An unexpected error occurred. Please try again.'
): string => {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;

  if (error && typeof error === 'object') {
    const errObj = error as Record<string, any>;
    if (typeof errObj.message === 'string') return errObj.message;
    if (typeof errObj.error === 'string') return errObj.error;
    if (typeof errObj.statusText === 'string') return errObj.statusText;
  }

  return fallback;
};

export const toAppError = (
  error: unknown,
  fallbackMessage = 'An unexpected error occurred.',
  fallbackCode = 'UNKNOWN_ERROR',
  fallbackStatus = 500
): AppError => {
  if (error instanceof AppError) return error;
  if (error instanceof Error) return new AppError(error.message, fallbackCode, fallbackStatus);
  if (typeof error === 'string') return new AppError(error, fallbackCode, fallbackStatus);

  if (error && typeof error === 'object') {
    const errObj = error as Record<string, any>;
    const message =
      typeof errObj.message === 'string'
        ? errObj.message
        : typeof errObj.error === 'string'
        ? errObj.error
        : fallbackMessage;
    const code = typeof errObj.code === 'string' ? errObj.code : fallbackCode;
    const status = typeof errObj.status === 'number' ? errObj.status : fallbackStatus;
    return new AppError(message, code, status, errObj.details);
  }

  return new AppError(fallbackMessage, fallbackCode, fallbackStatus);
};
