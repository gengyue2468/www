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

export function isENOENT(err: unknown): boolean {
  return err instanceof Error && "code" in err && (err as { code?: string }).code === "ENOENT";
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

  reset(): void {
    this.errors = [];
    this.warnings = [];
  }
}

export const errorReporter = new ConsoleErrorReporter();
