/**
 * Template de email baseado EXCLUSIVAMENTE
 * na fonte da verdade: a Base de Dados
 *
 * Recebe: row da tabela `registrations`
 */
const safe = (v, fallback = "—") =>
  v !== undefined && v !== null && v !== "" ? v : fallback;

export const registrationTemplate = (registration) => {
  if (!registration || typeof registration !== "object") {
    return `
      <h2>Nova candidatura – Brada</h2>
      <p>⚠️ Erro ao carregar dados da candidatura.</p>
    `;
  }

  return `
    <div style="font-family: Arial, sans-serif; line-height:1.5; color:#333">

      <h2>Nova Candidatura – Brada</h2>

      <hr/>

      <h3>🏪 Estabelecimento</h3>
      <p><b>Nome:</b> ${safe(registration.name)}</p>
      <p><b>NUIT:</b> ${safe(registration.nuit)}</p>
      <p><b>Tipo:</b> ${safe(registration.type)}</p>
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

      <p style="font-size:12px; color:#666">
        Estado: ${safe(registration.status)}<br/>
        Submetido em ${new Date(registration.created_at).toLocaleString("pt-PT")}
      </p>

    </div>
  `;
};
