import { supabase } from "./supabase";

/**
 * Upload de licença para Supabase Storage (React Native compatível)
 */
export async function uploadLicense(
  registrationId: string,
  file: {
    uri: string;
    name: string;
    mimeType?: string;
  },
  type: "operating" | "sanitary",
) {
  const fileExt = file.name.split(".").pop();
  const filePath = `${registrationId}/${type}.${fileExt}`;

  // ✅ React Native: usar FormData
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    name: filePath,
    type: file.mimeType || "application/pdf",
  } as any);

  const { error } = await supabase.storage
    .from("licenses")
    .upload(filePath, formData, {
      upsert: true,
      contentType: file.mimeType || "application/pdf",
    });

  if (error) {
    console.error("❌ Erro no upload da licença:", error);
    throw error;
  }

  const { data } = supabase.storage.from("licenses").getPublicUrl(filePath);

  return {
    fileName: file.name,
    fileUrl: data.publicUrl,
  };
}
