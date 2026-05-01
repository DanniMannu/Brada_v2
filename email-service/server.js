// =====================
// IMPORTS
// =====================
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { sendRegistrationMail } from "./mail/sendRegistrationMail.js";
import { saveRegistration } from "./saveRegistration.js";

// =====================
// INIT
// =====================
dotenv.config();
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);

const app = express();

// =====================
// MIDDLEWARES
// =====================
app.use(cors());

// aceitar JSON do frontend
app.use(express.json({ limit: "10mb" }));

// =====================
// ROUTES
// =====================

/**
 * Submissão de candidatura
 * Fluxo correto:
 * 1. Guardar na BD (fonte da verdade)
 * 2. Responder imediatamente ao frontend
 * 3. Enviar email em background COM DADOS DA BD
 */
app.post("/send-registration", async (req, res) => {
  try {
    const payload = req.body;

    // 1 - GUARDAR NA BASE DE DADOS
    // saveRegistration TEM de devolver a linha criada (select().single())
    console.log("📦 PAYLOAD RECEBIDO:", JSON.stringify(req.body, null, 2));
    const registration = await saveRegistration(payload);

    // 2 - RESPONDER IMEDIATAMENTE AO FRONTEND
    res.status(200).json({
      success: true,
      registrationId: registration.id,
    });

    // 3 - EMAIL EM BACKGROUND (NÃO BLOQUEIA UX)
    process.nextTick(() => {
      sendRegistrationMail({ data: registration });
    });
  } catch (error) {
    console.error("❌ Erro ao processar candidatura:", error);

    res.status(500).json({
      success: false,
      error: "Erro ao submeter candidatura",
    });
  }
});

// =====================
// SERVER
// =====================
app.listen(process.env.PORT, () => {
  console.log(`📧 Email service ativo na porta ${process.env.PORT}`);
});
