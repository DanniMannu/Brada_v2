// =====================
// IMPORTS
// =====================
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { sendRegistrationMail } from "./mail/sendRegistrationMail.js";
import { saveRegistration } from "./saveRegistration.js";
import { supabase } from "./supabase.js";

// =====================
// INIT
// =====================
dotenv.config();

const app = express();

// =====================
// MIDDLEWARES
// =====================
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// =====================
// ROUTES
// =====================

/**
 * 1️⃣ SUBMISSÃO DA CANDIDATURA
 * - Guarda na BD
 * - Responde rápido ao frontend
 * ❌ NÃO envia email aqui
 */
app.post("/send-registration", async (req, res) => {
  try {
    const payload = req.body;
    console.log("📦 PAYLOAD RECEBIDO:", payload);

    const registration = await saveRegistration(payload);

    res.status(200).json({
      success: true,
      registrationId: registration.id,
    });
  } catch (error) {
    console.error("❌ Erro ao submeter candidatura:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao submeter candidatura",
    });
  }
});

/**
 * 2️⃣ GUARDAR LICENÇAS + ENVIAR EMAIL
 * ✅ Email só é enviado quando AMBAS as licenças existem
 */
app.post("/save-license-url", async (req, res) => {
  try {
    const { registrationId, type, fileUrl, fileName } = req.body;

    // =====================
    // 1️⃣ VALIDAÇÃO DO BODY
    // =====================
    if (!registrationId || !type || !fileUrl || !fileName) {
      console.error("❌ Dados incompletos no /save-license-url:", req.body);
      return res.status(400).json({ success: false });
    }

    console.log("📎 Licença recebida:", registrationId, type);

    // =====================
    // 2️⃣ GUARDAR LICENÇA
    // =====================
    const { error: insertError } = await supabase.from("licenses").insert([
      {
        registration_id: registrationId,
        type, // operating | sanitary
        file_name: fileName,
        file_url: fileUrl,
      },
    ]);

    if (insertError) {
      console.error("❌ Erro ao inserir licença:", insertError);
      throw insertError;
    }

    // =====================
    // 3️⃣ VERIFICAR LICENÇAS COMPLETAS
    // =====================
    const { data: licenses, error: licensesError } = await supabase
      .from("licenses")
      .select("type, file_url")
      .eq("registration_id", registrationId);

    if (licensesError) {
      console.error("❌ Erro ao buscar licenças:", licensesError);
      throw licensesError;
    }

    const hasOperating = licenses.some((l) => l.type === "operating");
    const hasSanitary = licenses.some((l) => l.type === "sanitary");

    // =====================
    // 4️⃣ ENVIAR EMAIL APENAS QUANDO COMPLETO
    // =====================
    if (hasOperating && hasSanitary) {
      console.log("✅ Ambas as licenças presentes. Enviando email…");

      const { data: registration, error: regError } = await supabase
        .from("registrations")
        .select("*")
        .eq("id", registrationId)
        .single();

      if (regError || !registration) {
        console.error("❌ Erro ao buscar registration:", regError);
        throw regError;
      }

      await sendRegistrationMail({
        registration,
        licenses,
      });
    } else {
      console.log("⏳ Aguardando ambas as licenças para:", registrationId);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erro no /save-license-url:", err);
    res.status(500).json({ success: false });
  }
});

// =====================
// SERVER
// =====================
app.listen(process.env.PORT, () => {
  console.log(`📧 Email service ativo na porta ${process.env.PORT}`);
});
