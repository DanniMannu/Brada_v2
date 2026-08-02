import { supabase } from "./supabase";

type LicenseFile = {
  uri: string;
  name: string;
  mimeType?: string | null;
};

/** Faz upload de uma licença no bucket privado/público configurado no Supabase. */
export async function uploadLicense(
  registrationId: string,
  file: LicenseFile,
  type: "operating" | "sanitary",
) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const path = `${registrationId}/${type}.${extension}`;
  const body = new FormData();

  // O FormData do React Native aceita este formato; o tipo DOM não o declara.
  body.append("file", {
    uri: file.uri,
    name: path,
    type: file.mimeType || "application/pdf",
  } as unknown as Blob);

  const { error } = await supabase.storage.from("licenses").upload(path, body, {
    upsert: true,
    contentType: file.mimeType || "application/pdf",
  });

  if (error) throw error;

  const { data } = supabase.storage.from("licenses").getPublicUrl(path);
  return { fileName: file.name, fileUrl: data.publicUrl };
}
