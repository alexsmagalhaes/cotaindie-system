import z from "zod";

export const clientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome obrigatório"),
  type: z.enum(["CPF", "CNPJ"], { message: "Categoria obrigatória" }),
  document: z
    .string()
    .min(1, "Número do documento obrigatório")
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .email("Digite um email válido")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(1, "Digite o número de telefone")
    .optional()
    .or(z.literal("")),
  notes: z.string().optional(),

  street: z
    .string()
    .min(1, "Digite o nome do endereço")
    .optional()
    .or(z.literal("")),
  complement: z.string().optional(),
  neighborhood: z
    .string()
    .min(1, "Digite o nome do bairro")
    .optional()
    .or(z.literal("")),
  city: z.string().min(1, "Digite o nome da cidade"),
  cep: z.string("Digite um CEP válido").optional(),
});

export function getClientDefaultValues(
  client?: Partial<Client>,
): z.infer<typeof clientSchema> {
  return {
    id: client?.id ?? "",
    name: client?.name ?? "",
    type: client?.type ?? "CPF",

    document: client?.document ?? "",

    email: client?.email ?? "",
    phone: client?.phone ?? "",
    notes: client?.notes ?? "",

    street: client?.street ?? "",
    complement: client?.complement ?? "",
    neighborhood: client?.neighborhood ?? "",
    city: client?.city ?? "",
    cep: client?.cep ?? "",
  };
}

export interface IClientDialog {
  client?: z.infer<typeof clientSchema>;
}
