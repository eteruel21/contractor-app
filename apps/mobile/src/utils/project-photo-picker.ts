import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

export type ProjectPhotoSource = "camera" | "library";

export type PreparedProjectPhoto = {
  fileName: string;
  fileData: string;
  mimeType: "image/jpeg";
  previewUri: string;
  sizeBytes: number;
};

const MAX_WIDTH = 1600;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function base64Size(base64: string): number {
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

async function ensurePermission(source: ProjectPhotoSource): Promise<void> {
  if (Platform.OS === "web") return;
  const permission = source === "camera" ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error(source === "camera" ? "Se necesita permiso para usar la cámara." : "Se necesita permiso para acceder a la galería.");
}

export async function prepareProjectPhoto(source: ProjectPhotoSource): Promise<PreparedProjectPhoto | null> {
  await ensurePermission(source);
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], allowsEditing: false, quality: 1 };
  const result = source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  const actions = asset.width > MAX_WIDTH ? [{ resize: { width: MAX_WIDTH } }] : [];
  const processed = await manipulateAsync(asset.uri, actions, { compress: 0.78, format: SaveFormat.JPEG, base64: true });
  if (!processed.base64) throw new Error("No fue posible procesar la imagen seleccionada.");
  const sizeBytes = base64Size(processed.base64);
  if (sizeBytes > MAX_UPLOAD_BYTES) throw new Error("La imagen continúa siendo demasiado grande después de comprimirla. Selecciona una imagen menor.");
  return { fileName: `foto-${Date.now()}.jpg`, fileData: processed.base64, mimeType: "image/jpeg", previewUri: processed.uri, sizeBytes };
}