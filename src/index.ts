import { build } from "./build.js";
import { AppError, ErrorCode, errorReporter } from "./utils/errors.js";

build().catch((err) => {
  const error = AppError.isAppError(err) ? err : AppError.fromError(err, ErrorCode.BUILD_ERROR);
  errorReporter.report(error);
  process.exit(1);
});
