import z from "zod";

export const materialSchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1, "Categoria obrigatória"),
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().optional(),
  measureType: z.enum(["M2", "ML", "UN"], {
    message: "Tipo de medida inválido",
  }),
  unit: z.enum(["CM", "UN"], {
    message: "Unidade inválida",
  }),
  wasteTax: z.number().nonnegative("Deve ser maior ou igual a 0"),
  baseValue: z.number().positive("Deve ser maior que 0"),
  measure: z.union([
    z.tuple([z.number().positive("Deve ser maior que 0")]),
    z.tuple([
      z.number().positive("Deve ser maior que 0"),
      z.number().positive("Deve ser maior que 0"),
    ]),
  ]),
  cutDirection: z.enum(["V", "VH", "H"]).optional(),
});

export const getMaterialDefaultValues = (
  material?: Material,
): z.infer<typeof materialSchema> => {
  return {
    id: material?.id ?? "",
    category: material?.category?.id ?? "",
    name: material?.name ?? "",
    description: material?.description ?? "",
    measureType: material?.measureType ?? "M2",
    unit: material?.unit ?? "CM",
    wasteTax: material?.wasteTax ?? 0,
    baseValue: material?.baseValue ?? 0,
    measure: material?.measure
      ? (material.measure.map((v) => Number(v)) as [number] | [number, number])
      : [0, 0],
    cutDirection: material?.cutDirection ?? "VH",
  };
};
