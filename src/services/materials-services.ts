import type { SearchState } from "@/app/(private)/(navgation)/_context/search-provider";
import type { SearchResult } from "@/app/(private)/_types/search-result";
import { generateId } from "@/utils/generate-nano-id";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BaseService } from "./base-service";

export class MaterialsService extends BaseService {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async upsertMaterial(
    material: Omit<Partial<Material>, "category"> & { category: string },
  ): Promise<Material> {
    try {
      const {
        data: { user },
        error: authError,
      } = await this.supabase.auth.getUser();

      if (authError) throw new Error(`Auth error: ${authError.message}`);
      if (!user) throw new Error("Auth error: User not authenticated");

      const materialToUpsert = { ...material };

      if (!material.id) {
        materialToUpsert.code = await generateId();

        delete materialToUpsert.id;
      } else {
        const { data: materialCode, error: materialCodeError } =
          await this.supabase
            .from("materials")
            .select("code")
            .eq("id", material.id)
            .single();

        if (materialCodeError)
          throw new Error(
            `Fetch material code error: ${materialCodeError.message}`,
          );

        materialToUpsert.code = materialCode.code;
      }

      const { category, ...rest } = materialToUpsert;

      const materialDB = {
        id: rest.id,
        code: rest.code,
        name: rest.name,
        description: rest.description,
        measure_type: rest.measureType,
        unit: rest.unit,
        waste_tax: rest.wasteTax,
        base_value: rest.baseValue,
        measure: rest.measure,
        cut_direction: rest.cutDirection,
        user_id: user.id,
      };

      const { data, error: upsertError } = await this.supabase
        .from("materials")
        .upsert(materialDB, { onConflict: "id", ignoreDuplicates: false })
        .select()
        .single();

      if (upsertError)
        throw new Error(`Upsert material error: ${upsertError.message}`);

      if (category) {
        const { error: relError } = await this.supabase
          .from("materials_categories_relation")
          .upsert({
            material_id: data.id,
            category_id: category,
          });

        if (relError)
          throw new Error(
            `Upsert material-category relation error: ${relError.message}`,
          );
      }

      return data as Material;
    } catch (err) {
      this.handleError(err, "MaterialsService.upsertMaterial");
    }
  }

  async getMaterials(params?: SearchState): Promise<SearchResult<Material>> {
    try {
      let query = this.supabase.from("materials").select(
        `
          *,
          materials_categories_relation:materials_categories_relation(
            category:materials_categories(id, name)
          )
        `,
        { count: "exact" },
      );

      if (params?.text?.length) {
        const searchableFields = ["name", "description", "code"];

        const orExpressions = params.text
          .flatMap((t) => searchableFields.map((f) => `${f}.ilike.%${t}%`))
          .join(",");

        query = query.or(orExpressions);
      }

      if (params?.extras && params.extras.length > 0) {
        for (const extra of params.extras) {
          if (extra.key === "category") {
            const { data: materialIds, error: relError } = await this.supabase
              .from("materials_categories_relation")
              .select("material_id")
              .eq("category_id", extra.value);

            if (relError) throw relError;

            const ids = (materialIds ?? []).map((r) => r.material_id);
            query = query.in("id", ids);
          } else {
            query = query.eq(extra.key, extra.value);
          }
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

      if (error) {
        throw error;
      }

      const items = (data ?? []).map(this.formatMaterial);
      const totalPages = Math.ceil((count ?? items.length) / perPage);

      return { items, page, totalPages };
    } catch (err) {
      this.handleError(err, "MaterialsService.getMaterials");
    }
  }

  async getMaterialById(id: string) {
    try {
      const { data, error } = await this.supabase
        .from("materials")
        .select(
          `
          *,
          materials_categories_relation:materials_categories_relation(
            category:materials_categories(id, name)
          )
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      return this.formatMaterial(data);
    } catch (err) {
      this.handleError(err, "MaterialsService.getMaterialById");
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await this.supabase
        .from("materials_categories")
        .select("id, name");

      if (error) throw error;

      return data ?? [];
    } catch (err) {
      this.handleError(err, "MaterialsService.getCategories");
    }
  }

  async deleteMaterial(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("materials")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return true;
    } catch (err) {
      this.handleError(err, "MaterialsService.deleteMaterial");
    }
  }

  private formatMaterial(dbMaterial: any): Material {
    return {
      id: dbMaterial.id,
      code: dbMaterial.code,
      category: dbMaterial.materials_categories_relation?.[0]?.category || {
        id: "",
        name: "",
      },
      name: dbMaterial.name,
      description: dbMaterial.description,
      measureType: dbMaterial.measure_type,
      unit: dbMaterial.unit,
      wasteTax: dbMaterial.waste_tax,
      baseValue: dbMaterial.base_value,
      measure: dbMaterial.measure,
      cutDirection: dbMaterial.cut_direction,
    };
  }

  transformMaterials(dbMaterials: any[]): Material[] {
    return dbMaterials.map(this.formatMaterial);
  }
}
