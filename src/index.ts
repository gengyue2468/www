import { build } from "./build.js";
import { AppError, ErrorCode, errorReporter } from "./utils/errors.js";

const development = process.argv.includes("--development");
if (development) {
  // Ctrl+C may reach both the preview parent and its child. Let this build
  // finish its staging cleanup instead of terminating halfway through a write.
  process.once("SIGINT", () => {});
  process.once("SIGTERM", () => {});
}

build({ development }).catch((err) => {
  const error = AppError.isAppError(err) ? err : AppError.fromError(err, ErrorCode.BUILD_ERROR);
  errorReporter.report(error);
  process.exit(1);
});
