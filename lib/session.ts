import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "establishment_id";

// ✅ guardar ID
export const setEstablishmentId = async (id: string) => {
  await AsyncStorage.setItem(KEY, id);
};

// ✅ obter ID
export const getEstablishmentId = async () => {
  return await AsyncStorage.getItem(KEY);
};

// ✅ remover (logout)
export const clearEstablishmentId = async () => {
  await AsyncStorage.removeItem(KEY);
};
