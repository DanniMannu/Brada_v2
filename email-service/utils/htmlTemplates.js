/**
 * Template de email – BD first
 * Nunca quebra se dados vierem incompletos
 */
export const registrationTemplate = (input = {}) => {
  const registration = input.registration || {};
  const licenses = Array.isArray(input.licenses) ? input.licenses : [];

  const safe = (v) => (v ? v : "—");

  const operating = licenses.find((l) => l.type === "operating");
  const sanitary = licenses.find((l) => l.type === "sanitary");

  return `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333">

      <h2>📩 Nova Candidatura – Brada Delivery</h2>

      <hr/>

      <h3>🏪 Estabelecimento</h3>
      <p><b>Nome:</b> ${safe(registration.name)}</p>
      <p><b>NUIT:</b> ${safe(registration.nuit)}</p>
      <p><b>Email:</b> ${safe(registration.email)}</p>
      <p><b>Telefone:</b> ${safe(registration.phone)}</p>
      <p><b>Localização:</b> ${safe(registration.location)}</p>
      <p><b>Nº de lojas:</b> ${safe(registration.stores)}</p>


      <hr/>

      <h3>🚚 Entregas</h3>
      <p><b>Tipo:</b> ${safe(registration.delivery_type)}</p>
      <p><b>Cobertura:</b> ${safe(registration.coverage)}</p>
      <p><b>Taxa:</b> ${safe(registration.delivery_fee)}</p>
      <p><b>Tempo:</b> ${safe(registration.delivery_time)}</p>

      <hr/>

      <h3>💳 Pagamento</h3>
      <p><b>Método:</b> ${safe(registration.payment_method)}</p>
      <p><b>Telemóvel:</b> ${safe(registration.mobile_number)}</p>
      <p><b>Banco:</b> ${safe(registration.bank_name)}</p>
      <p><b>NIB:</b> ${safe(registration.bank_nib)}</p>

      <hr/>

      <h3>👤 Responsável</h3>
      <p><b>Nome:</b> ${safe(registration.owner_name)}</p>
      <p><b>Email:</b> ${safe(registration.owner_email)}</p>
      <p><b>Acordo aceite:</b> ${registration.agreed ? "✅ Sim" : "❌ Não"}</p>

      <hr/>


      <h3>📎 Licenças</h3>
      <ul>
        <li>
          <b>Licença de Funcionamento:</b><br/>
          ${
            operating
              ? `<a href="${operating.file_url}" target="_blank">Ver documento</a>`
              : "— não enviada —"
          }
        </li>
        <li>
          <b>Licença Sanitária:</b><br/>
          ${
            sanitary
              ? `<a href="${sanitary.file_url}" target="_blank">Ver documento</a>`
              : "— não enviada —"
          }
        </li>
      </ul>

      <hr/>

      <p style="font-size:12px;color:#666">
        Estado: ${safe(registration.status)}<br/>
        Submetido em ${
          registration.created_at
            ? new Date(registration.created_at).toLocaleString("pt-PT")
            : "—"
        }
      </p>

    </div>
  `;
};
