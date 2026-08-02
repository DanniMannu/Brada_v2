import { supabase } from "@/lib/supabase";

class FavoriteRepository {

    async isFavorite(
        customerId: string,
        establishmentId: string
    ) {

        const { data } = await supabase
            .from("favorites")
            .select("id")
            .eq("customer_id", customerId)
            .eq("establishment_id", establishmentId)
            .maybeSingle();

        return !!data;
    }

    async addFavorite(
        customerId: string,
        establishmentId: string
    ) {

        return supabase
            .from("favorites")
            .insert({
                customer_id: customerId,
                establishment_id: establishmentId,
            });

    }

    async removeFavorite(
        customerId: string,
        establishmentId: string
    ) {

        return supabase
            .from("favorites")
            .delete()
            .eq("customer_id", customerId)
            .eq("establishment_id", establishmentId);

    }

    async getFavorites(customerId: string) {

        return supabase
            .from("favorites")
            .select(`
                *,
                establishments(*)
            `)
            .eq("customer_id", customerId);

    }

}

export default new FavoriteRepository();