import { supabase } from "@/lib/supabase";
import * as ImagePicker from "expo-image-picker";
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  birthDate?: Date | null;
}

class AuthRepository {
  async register(data: RegisterData) {
    const email = data.email.trim().toLowerCase();

    console.log("REGISTER EMAIL:", email);

    // Criar utilizador no Auth
    const {
      data: authData,
      error: authError,
    } = await supabase.auth.signUp({
      email,
      password: data.password,
    });

    if (authError) {
      console.error("SIGNUP ERROR:", authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error("Não foi possível criar o utilizador.");
    }

    // Criar perfil
    const {
      error: customerError,
    } = await supabase
      .from("customers")
      .insert({
  id: authData.user.id,

  full_name: data.name,

  email,

  phone: data.phone,

  birth_date: data.birthDate
    ? data.birthDate.toISOString().split("T")[0]
    : null,

  avatar_url: null,

  gender: null,


  payment_methods: [
    "Dinheiro",
    "M-Pesa",
    "e-Mola",
    "mKesh",
  ],

  selected_payment_method: "Dinheiro",

  addresses: [],
  account_status: "active",
})

    if (customerError) {
      console.error(
        "CUSTOMER ERROR:",
        customerError
      );

      throw customerError;
    }

    return authData.user;
  }

  async login(
    email: string,
    password: string
  ) {
    const {
      data,
      error,
    } =
      await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

    if (error) {
      console.error("LOGIN ERROR:", error);
      throw error;
    }

    return data.user;
  }

  async logout() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } =
      await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    if (!user) {
      return null;
    }

    const {
      data: customer,
      error: customerError,
    } =
      await supabase
        .from("customers")
        .select("*")
        .eq("id", user.id)
        .single();

    if (customerError) {
      throw customerError;
    }

    return customer;
  }

  async updateProfile(
    userId: string,
    values: any
  ) {
    const { error } =
      await supabase
        .from("customers")
        .update(values)
        .eq("id", userId);

    if (error) {
      throw error;
    }
  }

  async recoverPassword(
    email: string
  ) {
    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo:
            "brada://reset-password",
        }
      );

    if (error) {
      throw error;
    }
  }

  async getSession() {
    const {
      data,
      error,
    } =
      await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return data.session;
  }



async uploadAvatar(userId: string) {
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Permissão negada.");
  }

  const result =
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

  if (result.canceled) return null;

  const asset = result.assets[0];

  const response = await fetch(asset.uri);

  const blob = await response.blob();

  const fileName = `${userId}.jpg`;

  const { error } =
    await supabase.storage
      .from("avatars")
      .upload(fileName, blob, {
        upsert: true,
        contentType: "image/jpeg",
      });

  if (error) throw error;

  const { data } =
    supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

  await this.updateProfile(userId, {
    avatar_url: data.publicUrl,
  });

  return data.publicUrl;
}


}


export default new AuthRepository();