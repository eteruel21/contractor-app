import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveLocalData<T>(
  key: string,
  value: T,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      key,
      JSON.stringify(value),
    );
  } catch (error) {
    console.error(
      `No fue posible guardar la información local: ${key}`,
      error,
    );
  }
}

export async function loadLocalData<T>(
  key: string,
): Promise<T | null> {
  try {
    const storedValue = await AsyncStorage.getItem(key);

    if (!storedValue) {
      return null;
    }

    return JSON.parse(storedValue) as T;
  } catch (error) {
    console.error(
      `No fue posible leer la información local: ${key}`,
      error,
    );

    return null;
  }
}

export async function removeLocalData(
  key: string,
): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(
      `No fue posible eliminar la información local: ${key}`,
      error,
    );
  }
}
