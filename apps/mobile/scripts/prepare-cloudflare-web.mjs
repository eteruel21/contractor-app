import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const distDirectory = path.join(projectRoot, "dist");
const expoFontDirectory = path.join(
  distDirectory,
  "assets",
  "node_modules",
  "@expo",
  "vector-icons",
  "build",
  "vendor",
  "react-native-vector-icons",
  "Fonts",
);
const publicFontDirectory = path.join(distDirectory, "fonts");

const fontFiles = await readdir(expoFontDirectory);
const ioniconsFile = fontFiles.find(
  (fileName) =>
    fileName.startsWith("Ionicons.") && fileName.endsWith(".ttf"),
);

if (!ioniconsFile) {
  throw new Error(
    "No se encontró la fuente Ionicons en la exportación web de Expo.",
  );
}

await mkdir(publicFontDirectory, { recursive: true });
await copyFile(
  path.join(expoFontDirectory, ioniconsFile),
  path.join(publicFontDirectory, ioniconsFile),
);

const oldFontUrl =
  `/assets/node_modules/@expo/vector-icons/build/vendor/` +
  `react-native-vector-icons/Fonts/${ioniconsFile}`;
const newFontUrl = `/fonts/${ioniconsFile}`;
const webBundleDirectory = path.join(
  distDirectory,
  "_expo",
  "static",
  "js",
  "web",
);

const bundleFiles = (await readdir(webBundleDirectory)).filter(
  (fileName) => fileName.endsWith(".js"),
);

let updatedBundles = 0;

for (const bundleFile of bundleFiles) {
  const bundlePath = path.join(webBundleDirectory, bundleFile);
  const bundle = await readFile(bundlePath, "utf8");

  if (!bundle.includes(oldFontUrl)) {
    continue;
  }

  await writeFile(
    bundlePath,
    bundle.replaceAll(oldFontUrl, newFontUrl),
    "utf8",
  );
  updatedBundles += 1;
}

if (updatedBundles === 0) {
  throw new Error(
    "No se encontró la referencia de Ionicons dentro del bundle web.",
  );
}

console.log(
  `Cloudflare web listo: ${ioniconsFile} publicado en /fonts.`,
);
