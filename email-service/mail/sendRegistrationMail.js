import nodemailer from "nodemailer";
import { registrationTemplate } from "../utils/htmlTemplates.js";

/**
 * Envio de email de candidatura.
 * Recebe SEMPRE dados da BD (fonte da verdade)
 */
export const sendRegistrationMail = async ({ registration, licenses }) => {
  try {
    // ✅ validação defensiva real
    if (!registration || typeof registration !== "object") {
      throw new Error("Registration inválido para envio de email");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Brada Delivery" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: "Nova candidatura de estabelecimento",
      html: registrationTemplate({
        registration,
        licenses,
      }),
    };

    await transporter.sendMail(mailOptions);

    console.log(
      "✅ Email enviado com sucesso para candidatura:",
      registration.id,
    );
  } catch (error) {
    // ❗ Email é secundário — nunca quebra o fluxo
    console.error("❌ Erro ao enviar email:", error);
  }
};
