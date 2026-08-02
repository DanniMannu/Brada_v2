import AsyncStorage from "@react-native-async-storage/async-storage";

// Mantém a chave já usada em produção para não invalidar sessões existentes.
const ESTABLISHMENT_ID_KEY = "establishment_id";

export async function setEstablishmentId(id: string): Promise<void> {
  await AsyncStorage.setItem(ESTABLISHMENT_ID_KEY, id);
}

export function getEstablishmentId(): Promise<string | null> {
  return AsyncStorage.getItem(ESTABLISHMENT_ID_KEY);
}

export async function clearEstablishmentId(): Promise<void> {
  await AsyncStorage.removeItem(ESTABLISHMENT_ID_KEY);
}
