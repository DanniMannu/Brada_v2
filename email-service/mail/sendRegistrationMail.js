import nodemailer from "nodemailer";
import { registrationTemplate } from "../utils/htmlTemplates.js";

/**
 * Envio de email de candidatura.
 */
export const sendRegistrationMail = async ({ data }) => {
  try {
    //  validação mínima defensiva
    const payload = data && typeof data === "object" ? data : {};

    // criar transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // construir mensagem
    const mailOptions = {
      from: `"Brada Delivery" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: "Nova candidatura de estabelecimento",
      html: registrationTemplate(payload),
    };

    // enviar
    await transporter.sendMail(mailOptions);

    console.log("✅ Email de candidatura enviado");
  } catch (error) {
    /**
     *
     * Nunca lançar o erro.
     * Email é secundário.
     * A candidatura NÃO pode ser afetada.
     */
    console.error("❌ Erro ao enviar email:", error);
  }
};
