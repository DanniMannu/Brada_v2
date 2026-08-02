import { supabase } from "@/lib/supabase";

export const RestaurantRepository = {
/*async getAll() {
  const { data, error } = await supabase
    .from("establishments")
    .select("*")
    .eq("active", true);

  console.log(data);
  console.log(error);

  if (error) throw error;

  return data ?? [];
}*/
async getAll() {
  const { data, error } = await supabase
    .from("establishments")
    .select(`
      *,
      stores(*),
      products(*)
    `);

  console.log("DATA:", data);
  console.log("ERROR:", JSON.stringify(error, null, 2));

  if (error) throw error;

  return data ?? [];
},

  async getById(id: string) {
    const { data, error } = await supabase
      .from("establishments")
      .select(
        `
        *,
        stores(
          id,
          name,
          address,
          contact,
          is_active
        ),
        products(
          id,
          name,
          description,
          price,
          category,
          active
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.log("GET RESTAURANT ERROR:", error);
      throw error;
    }

    return data;
  },

  async getFeatured() {
    const { data, error } = await supabase
      .from("establishments")
      .select(
        `
        *,
        stores(
          id,
          name,
          address,
          contact,
          is_active
        ),
        products(
          id,
          name,
          description,
          price,
          category,
          active
        )
      `
      )
      .eq("active", true)
      .limit(10);

    if (error) {
      throw error;
    }

    return data ?? [];
  },

  async getByCategory(category: string) {
    const { data, error } = await supabase
      .from("establishments")
      .select(
        `
        *,
        stores(
          id,
          name,
          address,
          contact,
          is_active
        ),
        products!inner(
          id,
          name,
          description,
          category,
          price,
          active
        )
      `
      )
      .eq("products.category", category)
      .eq("active", true);

    if (error) {
      throw error;
    }

    return data ?? [];
  },
};