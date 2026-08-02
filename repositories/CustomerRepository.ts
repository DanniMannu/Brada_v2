import { supabase } from "@/lib/supabase";

class CustomerRepository {

  async createCustomer(
    customer: any
  ) {

    return await supabase

      .from("customers")

      .insert(customer);

  }

  async getCustomer(
    id: string
  ) {

    return await supabase

      .from("customers")

      .select("*")

      .eq("id", id)

      .single();

  }

  async updateCustomer(
    id: string,
    values: any
  ) {

    return await supabase

      .from("customers")

      .update(values)

      .eq("id", id);

  }

}

export default new CustomerRepository();