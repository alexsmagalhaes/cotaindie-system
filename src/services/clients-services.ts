import type { SearchState } from "@/app/(private)/(navgation)/_context/search-provider";
import type { SearchResult } from "@/app/(private)/_types/search-result";
import { generateId } from "@/utils/generate-nano-id";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BaseService } from "./base-service";

export class ClientsService extends BaseService {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async upsertClient(client: Partial<Client>) {
    try {
      const {
        data: { user },
        error: authError,
      } = await this.supabase.auth.getUser();

      if (authError) throw new Error(`Auth error: ${authError.message}`);
      if (!user) throw new Error("Auth error: User not authenticated");

      const clientToUpsert: Partial<Client> = { ...client };

      if (!client.id) {
        clientToUpsert.code = await generateId();

        delete clientToUpsert.id;
      } else {
        const { data: clientCode, error: clientCodeError } = await this.supabase
          .from("clients")
          .select("code")
          .eq("id", client.id)
          .single();

        if (clientCodeError)
          throw new Error(
            `Fetch client code error: ${clientCodeError.message}`,
          );

        clientToUpsert.code = clientCode.code;
      }

      const { data, error: upsertError } = await this.supabase
        .from("clients")
        .upsert(
          { ...clientToUpsert, user_id: user.id },
          {
            onConflict: "id",
            ignoreDuplicates: false,
          },
        )
        .select()
        .single();

      if (upsertError)
        throw new Error(`Upsert client error: ${upsertError.message}`);

      return data as Client;
    } catch (err) {
      this.handleError(err, "ClientsService.upsertClient");
    }
  }

  async getClients(params?: SearchState): Promise<SearchResult<Client>> {
    try {
      let query = this.supabase.from("clients").select("*", { count: "exact" });

      if (params?.text && params.text.length > 0) {
        const searchableFields = [
          "name",
          "email",
          "phone",
          "code",
          "notes",
          "cep",
          "city",
          "neighborhood",
          "street",
          "complement",
        ];

        const orExpressions = params.text
          .flatMap((t) => searchableFields.map((f) => `${f}.ilike.%${t}%`))
          .join(",");

        query = query.or(orExpressions);
      }

      if (params?.extras && params.extras.length > 0) {
        for (const extra of params.extras) {
          query = query.eq(extra.key, extra.value);
        }
      }

      if (params?.sort) {
        query = query.order("created_at", { ascending: params.sort === "ASC" });
      }

      const page = params?.pagination?.page ?? 1;
      const perPage = params?.pagination?.perPage ?? 1000;
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      const totalPages = Math.ceil((count ?? data?.length ?? 0) / perPage);

      return {
        items: data ?? [],
        page,
        totalPages,
      };
    } catch (err) {
      this.handleError(err, "ClientsService.getClients");
    }
  }

  async getClientById(id: string) {
    try {
      const { data, error } = await this.supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return data as Client;
    } catch (err) {
      this.handleError(err, "ClientsService.getClientById");
    }
  }

  async deleteClient(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("clients")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return true;
    } catch (err) {
      this.handleError(err, "ClientsService.deleteClient");
    }
  }
}
