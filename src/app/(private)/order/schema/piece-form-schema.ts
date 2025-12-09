import z from "zod";

export const pieceSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    qtde: z.number().min(1, "Insira um número"),
    measure: z.union([
      z.tuple([z.number().positive("Deve ser maior que 0")]),
      z.tuple([
        z.number().positive("Deve ser maior que 0"),
        z.number().positive("Deve ser maior que 0"),
      ]),
    ]),
    material: z.object({
      id: z.string("Insira um ID válido"),
      name: z.string("Escolha um material"),
      code: z.string("Insira um código válido"),
      measure: z.union([
        z.tuple([z.number().positive("Deve ser maior que 0")]),
        z.tuple([
          z.number().positive("Deve ser maior que 0"),
          z.number().positive("Deve ser maior que 0"),
        ]),
      ]),
      baseValue: z.number().min(0, "Insira um valor a partir de zero"),
      measureType: z.enum(["M2", "ML", "UN"], {
        message: "Tipo de medida inválido",
      }),
      unit: z.enum(["CM", "UN"], {
        message: "Unidade inválida",
      }),
      wasteTax: z.number(),
      cutDirection: z
        .enum(["V", "VH", "H"])
        .optional()
        .or(z.literal(undefined)),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.material.measureType !== "UN" && !data.name) {
      ctx.addIssue({
        path: ["name"],
        code: "custom",
        message: "Insira o nome da peça",
      });
    }
  });

export type orderReferenceType = z.infer<typeof pieceSchema>;

export const getPiecetDefaultValues = () => {
  return {
    name: "",
    qtde: 1,
    material: {
      code: "",
      baseValue: 0,
    },
  };
};
