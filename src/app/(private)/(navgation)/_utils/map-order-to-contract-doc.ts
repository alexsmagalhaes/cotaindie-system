import {
  contractClauses,
  mockCompany,
} from "@/pdfs/_constants/contract-doc-mock";
import type {
  ContractDocumentProps,
  ContractProjectProps,
} from "@/pdfs/_docs/contract-document";
import { paymentCategories } from "../../order/_constants/payment-categories";
import { currencyFormatter } from "../../order/_utils/currency-formatter";
import { getProjectSummary } from "../../order/functions/project-summary";
import { formatDate } from "./format-date";
import { generateSignatureDateLocation } from "./generate-segnature-date-location";

export const mapOrderToContractDoc = (
  order: Partial<Order>,
): ContractDocumentProps => {
  const currency = (value: number) => currencyFormatter.format(value);

  const projects = order.projects ?? [];

  const rawAmount =
    order.projects?.reduce((acc, project, index) => {
      const summary = getProjectSummary(project, index);
      return acc + summary.totalValue;
    }, 0) ?? 0;

  const discountPercent = order.discountPercent ?? 0;
  const discountAmount = rawAmount * discountPercent;
  const finalAmount = rawAmount - discountAmount;

  const installmentCount = order.installmentCount ?? 1;
  const advanceAmount = order.advanceAmount ?? 0;
  const remainingAmount = finalAmount - advanceAmount;

  const contractProjects: ContractProjectProps[] = projects.map(
    (project: Project, index) => {
      const summary = getProjectSummary(project, index);

      return {
        name: summary.name || "Projeto sem nome",
        qtde: summary.qtde ?? 1,
        unitPrice: currency(summary.projectValue),
        totalPrice: currency(summary.totalValue),
      };
    },
  );

  const paymentMethodName = paymentCategories.find(
    (p) => p.id === order.paymentMethod,
  )?.name;

  return {
    company: mockCompany,

    client: {
      name: order.client?.name || "",
      document: order.client?.document || "N/A",
      phone: order.client?.phone || "N/A",
      email: order.client?.email || "N/A",
      code: order.client?.code,
      address: {
        street: order.client?.street || "N/A",
        complement: order.client?.complement || "N/A",
        neighborhood: order.client?.neighborhood || "N/A",
        city: order.client?.city || "N/A",
        cep: order.client?.cep || "N/A",
      },
    },

    contract: {
      quoteCode: order.code ?? "",
      saleCode: order.code ?? "",
      name: order.name ?? "",
      generationDate: formatDate(order.initialDate),
      projects: contractProjects,
      included: order.included || "",
      excluded: order.excluded || "",
      rawAmount: currency(rawAmount),
      discountPercent: Number((discountPercent * 100).toFixed(2)),
      discountAmount: `-${currency(discountAmount)}`,
      finalAmount: currency(finalAmount),
      clauses: contractClauses ?? [],
      signatureDateLocation: generateSignatureDateLocation("Viçosa do Ceará"),
    },

    payment: {
      initialDate: order.initialDate ? formatDate(order.initialDate) : "",
      paymentMethod: paymentMethodName ?? "",
      advanceAmount:
        typeof order.advanceAmount === "number"
          ? currency(order.advanceAmount)
          : "",
      deliveryDays: order.deliveryDays || 0,
      remainingPaymentInfo:
        remainingAmount >= 0 ? currency(remainingAmount) : "0",
      installmentsInfo:
        remainingAmount >= 0
          ? `${installmentCount} x ${currency(
              remainingAmount / installmentCount,
            )} = ${currency(remainingAmount)}`
          : "",
    },
  };
};
