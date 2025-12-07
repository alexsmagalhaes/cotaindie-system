import type { SearchState } from "@/app/(private)/(navgation)/_context/search-provider";
import type { SearchResult } from "@/app/(private)/_types/search-result";
import type { OrderType } from "@/app/(private)/order/schema/order-schema";
import { generateId } from "@/utils/generate-nano-id";
import { mapOrderFromSupabase } from "@/utils/order-mapper";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BaseService } from "./base-service";

export class OrdersService extends BaseService {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async upsertOrder(order: OrderType): Promise<Order> {
    try {
      const {
        data: { user },
        error: authError,
      } = await this.supabase.auth.getUser();

      if (authError) {
        throw new Error(`Auth error: ${authError.message}`);
      }

      if (!user) {
        throw new Error("Auth error: User not authenticated");
      }

      let orderCode: string;

      if (!order.id) {
        orderCode = await generateId();
      } else {
        const { data: existingOrderCode, error: fetchCodeError } =
          await this.supabase
            .from("orders")
            .select("code")
            .eq("id", order.id)
            .single();

        if (fetchCodeError) {
          throw new Error(`Fetch order code error: ${fetchCodeError.message}`);
        }
        orderCode = existingOrderCode.code;
      }

      let approvedAt: string | null = null;

      if (order.status === "OPEN") {
        approvedAt = null;
      } else if (order.status === "APPROVED") {
        if (order.id) {
          const { data: existingOrder, error: fetchApprovedError } =
            await this.supabase
              .from("orders")
              .select("approved_at")
              .eq("id", order.id)
              .single();

          if (fetchApprovedError) {
            throw new Error(fetchApprovedError.message);
          }

          approvedAt = existingOrder.approved_at ?? new Date().toISOString();
        } else {
          approvedAt = new Date().toISOString();
        }
      }

      const {
        id,
        client,
        advanceAmount,
        advancePaymentMethod,
        initialDate,
        rawAmount,
        deliveryDays,
        discountPercent,
        installmentCount,
        paymentMethod,
        projects,
        teamNotes,
        ...rest
      } = order;

      const orderToUpsert = {
        ...rest,
        id,
        user_id: user.id,
        code: orderCode,
        client_id: client,
        initial_date: initialDate,
        raw_amount: rawAmount,
        delivery_days: deliveryDays ?? 0,
        discount_percent: discountPercent ?? 0,
        payment_method: paymentMethod,
        advance_amount: advanceAmount ?? 0,
        advance_payment_method: advancePaymentMethod ?? null,
        installment_count: installmentCount ?? 1,
        team_notes: teamNotes,
        approved_at: approvedAt,
      };

      const { data: orderData, error: orderError } = await this.supabase
        .from("orders")
        .upsert(orderToUpsert)
        .select()
        .single();
      if (orderError)
        throw new Error(`Order upsert error: ${orderError.message}`);

      const { data: existingProjects } = await this.supabase
        .from("orders_projects")
        .select("id")
        .eq("order_id", orderData.id);

      const existingProjectIds = existingProjects?.map((p) => p.id) ?? [];
      const newProjectIdsSet = new Set(
        projects.map((p) => p.id).filter(Boolean),
      );

      const projectsToDelete = existingProjectIds.filter(
        (id) => !newProjectIdsSet.has(id),
      );
      if (projectsToDelete.length) {
        await this.supabase
          .from("orders_projects")
          .delete()
          .in("id", projectsToDelete);
      }

      for (const project of projects) {
        const projectToUpsert = {
          id: project.id,
          order_id: orderData.id,
          name: project.name,
          costs: project.costs,
          qtde: project.qtde,
          monthly_expense: project.monthlyExpense ?? 0,
          profit_rate: project.profitRate ?? 0,
          comission: project.comission ?? 0,
        };

        const { data: projectData, error: projectError } = await this.supabase
          .from("orders_projects")
          .upsert(projectToUpsert)
          .select()
          .single();
        if (projectError)
          throw new Error(`Project upsert error: ${projectError.message}`);

        const { data: existingPieces } = await this.supabase
          .from("orders_pieces")
          .select("id")
          .eq("project_id", projectData.id);

        const existingPieceIds = existingPieces?.map((p) => p.id) ?? [];
        const newPieceIdsSet = new Set(
          (project.pieces ?? []).map((p) => p.id).filter(Boolean),
        );

        const piecesToDelete = existingPieceIds.filter(
          (id) => !newPieceIdsSet.has(id),
        );
        if (piecesToDelete.length) {
          await this.supabase
            .from("orders_pieces")
            .delete()
            .in("id", piecesToDelete);
        }

        for (const piece of project.pieces ?? []) {
          const pieceToUpsert = {
            id: piece.id,
            name: piece.name,
            qtde: piece.qtde,
            measure: piece.measure,
            project_id: projectData.id,
            material_id: piece.material?.id ?? null,
          };

          const { data: pieceData, error: pieceError } = await this.supabase
            .from("orders_pieces")
            .upsert(pieceToUpsert)
            .select()
            .single();
          if (pieceError)
            throw new Error(`Piece upsert error: ${pieceError.message}`);

          if (piece.material) {
            const snapshot = {
              piece_id: pieceData.id,
              measure_type: piece.material.measureType,
              unit: piece.material.unit,
              waste_tax: piece.material.wasteTax,
              base_value: piece.material.baseValue,
              measure: piece.material.measure,
              cut_direction: piece.material.cutDirection,
            };

            const { error: snapshotError } = await this.supabase
              .from("orders_pieces_materials_snapshot")
              .upsert(snapshot, { onConflict: "piece_id" });
            if (snapshotError)
              throw new Error(
                `Snapshot insert error: ${snapshotError.message}`,
              );
          }
        }
      }

      const { data: fullOrder, error: fetchError } = await this.supabase
        .from("orders")
        .select(
          `
      *,
      client:clients(*),
      projects:orders_projects(
        *,
        pieces:orders_pieces(
          *,
          material:materials(id, name, code, description),
          material_snapshot:orders_pieces_materials_snapshot(*)
        )
      )
    `,
        )
        .eq("id", orderData.id)
        .single();
      if (fetchError)
        throw new Error(`Fetch order error: ${fetchError.message}`);

      return mapOrderFromSupabase(fullOrder);
    } catch (err) {
      this.handleError(err, "OrdersService.upsertOrder");
    }
  }

  async getOrders(
    params?: SearchState,
    options?: {
      limit?: number;
      dateRange?: { startDate: string; endDate: string };
      status?: Order["status"];
      approvedPeriod?: boolean;
    },
  ): Promise<SearchResult<Order>> {
    try {
      let query = this.supabase.from("orders").select(
        `
      *,
      approved_at,
      client:clients(*),
      projects:orders_projects(
        *,
        pieces:orders_pieces(
          *,
          material:materials(id, name, code, description),
          material_snapshot:orders_pieces_materials_snapshot(*)
        )
      )
      `,
        { count: "exact" },
      );

      if (params?.text?.length) {
        const searchableFields = [
          "name",
          "code",
          "notes",
          "included",
          "excluded",
          "team_notes",
        ];
        const orExpressions = params.text
          .flatMap((t) => searchableFields.map((f) => `${f}.ilike.%${t}%`))
          .join(",");
        query = query.or(orExpressions);
      }

      if (params?.extras?.length) {
        for (const extra of params.extras) {
          if (extra.key === "client") {
            const { data: orderIds, error: relError } = await this.supabase
              .from("orders")
              .select("id")
              .eq("client_id", extra.value);

            if (relError) throw relError;

            const ids = (orderIds ?? []).map((r) => r.id);
            if (ids.length) query = query.in("id", ids);
          } else {
            query = query.eq(extra.key, extra.value);
          }
        }
      }

      if (options?.status) {
        query = query.eq("status", options.status);
      }

      if (options?.dateRange) {
        const { startDate, endDate } = options.dateRange;
        const dateField = options.approvedPeriod ? "approved_at" : "created_at";
        query = query.gte(dateField, startDate).lte(dateField, endDate);
      }

      if (params?.sort) {
        query = query.order("created_at", { ascending: params.sort === "ASC" });
      }

      if (options?.limit != null) {
        query = query.limit(options.limit);
      } else {
        const page = params?.pagination?.page ?? 1;
        const perPage = params?.pagination?.perPage ?? 1000;
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      const items = (data ?? []).map(mapOrderFromSupabase);

      const perPage = params?.pagination?.perPage ?? 10;
      const totalPages = Math.ceil((count ?? 0) / perPage);

      return {
        items,
        page: params?.pagination?.page ?? 1,
        totalPages,
      };
    } catch (err) {
      this.handleError(err, "OrdersService.getOrders");
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const { data: order, error } = await this.supabase
        .from("orders")
        .select(
          `
        *,
        approved_at,
        client:clients(*),
        projects:orders_projects(
          *,
          pieces:orders_pieces(
            *,
            material:materials(id, name, code, description),
            material_snapshot:orders_pieces_materials_snapshot(*)
          )
        )
      `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      if (!order) return null;

      return mapOrderFromSupabase(order);
    } catch (err) {
      this.handleError(err, "OrdersService.getOrderById");
    }
  }

  async deleteOrder(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("orders")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return true;
    } catch (err) {
      this.handleError(err, "OrdersService.deleteOrder");
    }
  }

  async copyOrder(orderId: string): Promise<{ id: string }> {
    try {
      const {
        data: { user },
        error: authError,
      } = await this.supabase.auth.getUser();

      if (authError) throw new Error(authError.message);
      if (!user) throw new Error("User not authenticated");

      const { data: original, error: fetchError } = await this.supabase
        .from("orders")
        .select(
          `
        *,
        client:clients(*),
        projects:orders_projects(
          *,
          pieces:orders_pieces(
            *,
            material_snapshot:orders_pieces_materials_snapshot(*)
          )
        )
      `,
        )
        .eq("id", orderId)
        .single();

      if (fetchError) throw new Error(fetchError.message);
      if (!original) throw new Error("Order not found");

      const { id: _oldOrderId, client, projects, ...orderData } = original;

      delete orderData.created_at;
      delete orderData.updated_at;

      Object.keys(orderData).forEach((k) => {
        if (orderData[k] === undefined) delete orderData[k];
      });

      const { data: newOrder, error: orderInsertError } = await this.supabase
        .from("orders")
        .insert({
          ...orderData,
          name: `(Cópia) ${orderData.name ?? ""}`.trim(),
          code: await generateId(),
          user_id: user.id,
          status: "OPEN",
          approved_at: null,
        })
        .select()
        .single();

      if (orderInsertError) throw new Error(orderInsertError.message);

      for (const project of projects ?? []) {
        const { id: _oldProjId, pieces, ...projectData } = project;

        delete projectData.created_at;
        delete projectData.updated_at;

        Object.keys(projectData).forEach((k) => {
          if (projectData[k] === undefined) delete projectData[k];
        });

        const { data: newProject, error: projectInsertError } =
          await this.supabase
            .from("orders_projects")
            .insert({
              ...projectData,
              order_id: newOrder.id,
            })
            .select()
            .single();

        if (projectInsertError) throw new Error(projectInsertError.message);

        for (const piece of pieces ?? []) {
          const { id: _oldPieceId, material_snapshot, ...pieceData } = piece;

          delete pieceData.created_at;
          delete pieceData.updated_at;

          Object.keys(pieceData).forEach((k) => {
            if (pieceData[k] === undefined) delete pieceData[k];
          });

          const { data: newPiece, error: pieceInsertError } =
            await this.supabase
              .from("orders_pieces")
              .insert({
                ...pieceData,
                project_id: newProject.id,
              })
              .select()
              .single();

          if (pieceInsertError) throw new Error(pieceInsertError.message);

          if (material_snapshot) {
            const { id: _oldSnapId, ...snapData } = material_snapshot;

            delete snapData.created_at;
            delete snapData.updated_at;

            Object.keys(snapData).forEach((k) => {
              if (snapData[k] === undefined) delete snapData[k];
            });

            const { error: snapInsertError } = await this.supabase
              .from("orders_pieces_materials_snapshot")
              .insert({
                ...snapData,
                piece_id: newPiece.id,
              });

            if (snapInsertError) throw new Error(snapInsertError.message);
          }
        }
      }

      return { id: newOrder.code };
    } catch (err) {
      this.handleError(err, "OrdersService.duplicateOrder");
    }
  }
}
