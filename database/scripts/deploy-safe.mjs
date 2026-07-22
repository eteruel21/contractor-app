import { execSync } from "node:child_process";
import fs from "node:fs";

console.log("=== SCRIPT DE DESPLIEGUE SEGURO (CONTRACTOR APP) ===");
console.log("-> 1. Asegurando instalación de git hooks de protección...");
try {
  execSync("npm run install-hooks", { stdio: "inherit" });
} catch (e) {
  console.log("⚠️ No se pudo instalar git hooks.");
}

console.log("\n-> 2. Ejecutando validación de tipos y compilación de aplicaciones...");
try {
  execSync("npm run typecheck", { stdio: "inherit" });
  execSync("npm run build:api", { stdio: "inherit" });
  execSync("npm run build:admin", { stdio: "inherit" });
  console.log("✓ Verificación y compilaciones exitosas.");
} catch (error) {
  console.error("❌ Falló la compilación o verificación de tipos.");
  process.exit(1);
}

console.log("\n-> 3. Verificando estado del repositorio Git...");
try {
  const gitStatus = execSync("git status --porcelain", { encoding: "utf-8" });
  if (gitStatus.trim().length > 0) {
    console.log("⚠️ AVISO: Existen cambios no confirmados en el repositorio local.");
  } else {
    console.log("✓ Repositorio limpio.");
  }
} catch (e) {
  console.log("⚠️ No se pudo verificar el estado de Git.");
}

console.log("\n-> 4. Despliegues disponibles:");
console.log("   [A] Desplegar Admin Web a Cloudflare Pages (npm run deploy:admin)");
console.log("   [B] Desplegar Mobile Web a Cloudflare Pages (npm run deploy:mobile)");
console.log("   [C] Validar build API para Render (npm run build:api)");
console.log("\nNOTA: Este script NO realiza 'git push' automático a 'main'. Proteja la rama 'main' usando PRs.");
console.log("=== Proceso de validación previa completado con éxito ===");

