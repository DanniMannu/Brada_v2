import { supabase } from "./supabase.js";

/**
 * Guarda a candidatura usando o payload REAL do frontend
 */
export const saveRegistration = async (payload = {}) => {
  // aceitar payload flat ou estruturado
  const establishment = payload.establishment ?? payload;

  if (!establishment?.name) {
    throw new Error("Campo obrigatório 'name' em falta no payload");
  }

  if (!establishment?.nuit) {
    throw new Error("Campo obrigatório 'nuit' em falta no payload");
  }

  const { data: registration, error } = await supabase
    .from("registrations")
    .insert([
      {
        name: establishment.name,
        nuit: establishment.nuit,
        type: establishment.type,
        email: establishment.email,
        phone: establishment.phone,
        location: establishment.location,
        stores: establishment.stores,

        delivery_type: payload.delivery?.deliveryType,
        coverage: payload.delivery?.coverage,
        delivery_fee: payload.delivery?.fee,
        delivery_time: payload.delivery?.time,

        payment_method: payload.payment?.method,
        mobile_number: payload.payment?.mobileNumber,
        bank_name: payload.payment?.bankName,
        bank_nib: payload.payment?.bankNib,

        owner_name: payload.agreement?.ownerName,
        owner_email: payload.agreement?.ownerEmail,
        agreed: payload.agreement?.agreed ?? false,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return registration;
};
