import { quoteCompanyInfo } from "@/pdfs/_constants/company-mock";
import type {
  QuoteDocumentProps,
  QuoteProjectProps,
} from "@/pdfs/_docs/quote-document";
import { paymentCategories } from "../../order/_constants/payment-categories";
import { currencyFormatter } from "../../order/_utils/currency-formatter";
import { getProjectSummary } from "../../order/functions/project-summary";
import { formatDate } from "./format-date";

export const mapOrderToQuoteDoc = (
  order: Partial<Order>,
): QuoteDocumentProps => {
  const currency = (value: number) => currencyFormatter.format(value);

  const projects = order.projects ?? [];

  const rawAmount = projects.reduce((acc, p, index) => {
    const summary = getProjectSummary(p, index);
    return acc + summary.totalValue;
  }, 0);

  const discountPercent = order.discountPercent ?? 0;
  const discountAmount = rawAmount * discountPercent;
  const finalAmount = rawAmount - discountAmount;

  const installmentCount = order.installmentCount ?? 1;
  const advanceAmount = order.advanceAmount ?? 0;
  const remainingAmount = finalAmount - advanceAmount;

  const quoteProjects: QuoteProjectProps[] = projects.map(
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
    company: quoteCompanyInfo,

    client: {
      name: order.client?.name || "",
      document: order.client?.document || "N/A",
      phone: order.client?.phone || "N/A",
      email: order.client?.email || "N/A",
      code: order.client?.code,
      address: {
        street: order.client?.street || "",
        complement: order.client?.complement || "",
        neighborhood: order.client?.neighborhood || "",
        city: order.client?.city || "",
        cep: order.client?.cep || "",
      },
    },

    order: {
      code: order.code ?? "",
      name: order.name ?? "",
      generationDate: formatDate(order.initialDate),
      projects: quoteProjects,
      included: order.included || "",
      excluded: order.excluded || "",
      rawAmount: currency(rawAmount),
      discountPercent: Number((discountPercent * 100).toFixed(2)),
      discountAmount: `-${currency(discountAmount)}`,
      finalAmount: currency(finalAmount),
      notes: order.notes ?? "",
    },

    payment: {
      initialDate: order.initialDate ? formatDate(order.initialDate) : "",
      paymentMethod: paymentMethodName ?? "",
      advanceAmount:
        typeof order.advanceAmount === "number"
          ? currency(order.advanceAmount)
          : "",
      deliveryDays: order.deliveryDays,
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
