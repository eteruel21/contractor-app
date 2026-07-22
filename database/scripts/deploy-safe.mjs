import { execSync } from "node:child_process";
import fs from "node:fs";

console.log("=== SCRIPT DE DESPLIEGUE SEGURO (CONTRACTOR APP) ===");
console.log("-> 1. Ejecutando validación de tipos y compilación...");

try {
  execSync("npm run typecheck", { stdio: "inherit" });
  console.log("✓ Typecheck exitoso.");
} catch (error) {
  console.error("❌ Falló la verificación de tipos TypeScript.");
  process.exit(1);
}

console.log("-> 2. Verificando estado del repositorio Git...");
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

console.log("\n-> 3. Despliegues disponibles:");
console.log("   [A] Desplegar Admin Web a Cloudflare Pages (npm run deploy:admin)");
console.log("   [B] Desplegar Mobile Web a Cloudflare Pages (npm run deploy:mobile)");
console.log("   [C] Validar build API para Render (npm run build:api)");
console.log("\nNOTA: Este script NO realiza 'git push' automático a 'main'.");
console.log("=== Proceso de validación previa completado con éxito ===");
