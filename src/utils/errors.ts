export enum ErrorCode {
  FILE_NOT_FOUND = "FILE_NOT_FOUND",
  FILE_READ_ERROR = "FILE_READ_ERROR",
  FILE_WRITE_ERROR = "FILE_WRITE_ERROR",
  PARSE_ERROR = "PARSE_ERROR",
  RENDER_ERROR = "RENDER_ERROR",
  CONFIG_ERROR = "CONFIG_ERROR",
  PLUGIN_ERROR = "PLUGIN_ERROR",
  CACHE_ERROR = "CACHE_ERROR",
  BUILD_ERROR = "BUILD_ERROR",
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public context?: Record<string, unknown>,
    public cause?: Error
  ) {
    super(message);
    this.name = "AppError";
  }

  static fromError(err: unknown, code: ErrorCode, context?: Record<string, unknown>): AppError {
    const original = err instanceof Error ? err : new Error(String(err));
    return new AppError(original.message, code, context, original);
  }

  static isAppError(err: unknown): err is AppError {
    return err instanceof AppError;
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      stack: this.stack,
      cause: this.cause?.message,
    };
  }
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: AppError };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<T>(error: AppError): Result<T> {
  return { ok: false, error };
}

export async function tryCatch<T>(
  fn: () => Promise<T>,
  code: ErrorCode,
  context?: Record<string, unknown>
): Promise<Result<T>> {
  try {
    const value = await fn();
    return ok(value);
  } catch (e) {
    return err(AppError.fromError(e, code, context));
  }
}

export function tryCatchSync<T>(
  fn: () => T,
  code: ErrorCode,
  context?: Record<string, unknown>
): Result<T> {
  try {
    const value = fn();
    return ok(value);
  } catch (e) {
    return err(AppError.fromError(e, code, context));
  }
}

export function isENOENT(err: unknown): boolean {
  return err instanceof Error && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT";
}

export function isEEXIST(err: unknown): boolean {
  return err instanceof Error && "code" in err && (err as NodeJS.ErrnoException).code === "EEXIST";
}

export interface ErrorReporter {
  report(error: AppError): void;
  reportWarning(message: string, context?: Record<string, unknown>): void;
  summary(): { errors: number; warnings: number };
}

export class ConsoleErrorReporter implements ErrorReporter {
  private errors: AppError[] = [];
  private warnings: Array<{ message: string; context?: Record<string, unknown> }> = [];

  report(error: AppError): void {
    this.errors.push(error);
    console.error(`✗ [${error.code}] ${error.message}`);
    if (error.context) {
      console.error("  Context:", error.context);
    }
  }

  reportWarning(message: string, context?: Record<string, unknown>): void {
    this.warnings.push({ message, context });
    console.warn(`⚠ ${message}`);
    if (context) {
      console.warn("  Context:", context);
    }
  }

  summary(): { errors: number; warnings: number } {
    return { errors: this.errors.length, warnings: this.warnings.length };
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  throwIfErrors(): void {
    if (this.errors.length > 0) {
      const first = this.errors[0];
      throw new AppError(
        `Build failed with ${this.errors.length} error(s). First: ${first.message}`,
        ErrorCode.BUILD_ERROR,
        { errorCount: this.errors.length },
        first
      );
    }
  }
}

export const errorReporter = new ConsoleErrorReporter();

export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  code: ErrorCode,
  getContext?: (...args: Parameters<T>) => Record<string, unknown>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (e) {
      if (AppError.isAppError(e)) throw e;
      const context = getContext ? getContext(...args) : undefined;
      throw AppError.fromError(e, code, context);
    }
  }) as T;
}

export function safeAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
  warningMessage?: string
): Promise<T> {
  return fn().catch((e) => {
    if (warningMessage) {
      errorReporter.reportWarning(warningMessage, { error: String(e) });
    }
    return fallback;
  });
}
