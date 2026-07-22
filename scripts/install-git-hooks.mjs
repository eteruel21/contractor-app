import fs from "node:fs";
import path from "node:path";

const gitHooksDir = path.resolve(".git", "hooks");
const prePushHookPath = path.join(gitHooksDir, "pre-push");

const hookContent = `#!/bin/sh
# Contractor App - Git Pre-Push Hook
bash ./scripts/protect-main.sh "$@"
`;

try {
  if (!fs.existsSync(gitHooksDir)) {
    console.log("ℹ️ Directorio .git/hooks no encontrado (¿es un repositorio git?). Omitiendo.");
    process.exit(0);
  }

  fs.writeFileSync(prePushHookPath, hookContent, { encoding: "utf8", mode: 0o755 });
  console.log("✓ Git Hook 'pre-push' instalado con éxito en .git/hooks/pre-push");
} catch (error) {
  console.error("⚠️ Error instalando git hook pre-push:", error.message);
}
