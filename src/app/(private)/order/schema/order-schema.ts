import z from "zod";
import { orderIncludedSchema } from "./order-included-schema";
import { paymentMethod } from "./order-payment-schema";
import { projectSchema } from "./project-form-schema";

const statusEnum = z.enum(["APPROVED", "OPEN"]);

const PaymentSchema = z.object({
  deliveryDays: z
    .number("Adicione os dias até a entrega")
    .positive("O número de dias deve ser positivo"),
  discountPercent: z
    .number("Insira um desconto")
    .min(0, "Desconto deve ser a partir de zero")
    .max(1, "Desconto máximo de 100%"),
  paymentMethod: z.enum(paymentMethod, {
    message: "Escolha uma opção válida",
  }),
  advanceAmount: z
    .number("Insira um adiantamento")
    .min(0, "O adiantamento deve ser a partir de zero"),
  advancePaymentMethod: z.enum(paymentMethod).optional(),
  installmentCount: z
    .number("Insira a quantidade de parcelas")
    .int("O valor deve ser um número inteiro")
    .positive("O valor deve ser maior que zero"),

  notes: z.string().optional(),
});

export const orderSchema = z
  .object({
    id: z.string().optional(),

    status: statusEnum,

    name: z.string(),
    client: z.string(),
    initialDate: z.string(),

    projects: z.array(projectSchema),

    rawAmount: z.number(),
  })
  .merge(orderIncludedSchema)
  .merge(PaymentSchema)
  .refine(
    (data) => {
      return data.advanceAmount > 0 ? !!data.advancePaymentMethod : true;
    },
    {
      path: ["advancePaymentMethod"],
      message: "Selecione uma forma de pagamento para o adiantamento",
    },
  );

export type OrderType = z.infer<typeof orderSchema>;
