export function mapOrderFromSupabase(rawOrder: any): Order {
  return {
    id: rawOrder.id,
    code: rawOrder.code,
    status: rawOrder.status as Status,
    name: rawOrder.name,
    client: {
      id: rawOrder.client?.id,
      code: rawOrder.client?.code ?? "",
      name: rawOrder.client?.name,
      type: rawOrder.client?.type,
      notes: rawOrder.client?.notes ?? "",
      document: rawOrder.client?.document ?? "",
      email: rawOrder.client?.email ?? "",
      phone: rawOrder.client?.phone ?? "",
      street: rawOrder.client?.street,
      complement: rawOrder.client?.complement ?? "",
      neighborhood: rawOrder.client?.neighborhood,
      city: rawOrder.client?.city,
      cep: rawOrder.client?.cep ?? "",
    },
    initialDate: rawOrder.initial_date,
    approvedAt: rawOrder.approved_at ?? null,
    projects: (rawOrder.projects ?? []).map((project: any) => ({
      id: project.id,
      name: project.name,
      qtde: project.qtde,
      costs: project.costs ?? [],
      profitRate: project.profit_rate ?? 0,
      monthlyExpense: project.monthly_expense ?? 0,
      comission: project.comission ?? 0,
      pieces: (project.pieces ?? []).map((piece: any) => {
        const snapshot = piece.material_snapshot ?? {};
        const materialBase = piece.material ?? {};

        return {
          id: piece.id,
          name: piece.name ?? "",
          qtde: piece.qtde,
          measure: piece.measure ?? [0],
          project_id: piece.project_id,
          material: {
            id: materialBase.id ?? "",
            code: materialBase.code ?? "",
            name: materialBase.name ?? "",
            measure: snapshot.measure ?? [0],
            measureType: snapshot.measure_type ?? "",
            baseValue: snapshot.base_value ?? 0,
            unit: snapshot.unit ?? "",
            wasteTax: snapshot.waste_tax ?? 0,
            cutDirection: snapshot.cut_direction ?? null,
          },
        };
      }),
    })),
    included: rawOrder.included ?? "",
    excluded: rawOrder.excluded ?? "",
    teamNotes: rawOrder.team_notes ?? "",
    rawAmount: rawOrder.raw_amount ?? 0,
    deliveryDays: rawOrder.delivery_days ?? 0,
    paymentMethod: rawOrder.payment_method as Payment,
    discountPercent: rawOrder.discount_percent ?? 0,
    installmentCount: rawOrder.installment_count ?? 1,
    advanceAmount: rawOrder.advance_amount ?? 0,
    advancePaymentMethod:
      (rawOrder.advance_payment_method as Payment) ?? undefined,
    notes: rawOrder.notes ?? "",
    createdAt: rawOrder.created_at,
  };
}
