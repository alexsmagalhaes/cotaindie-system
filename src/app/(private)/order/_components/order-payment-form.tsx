"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputDisabled } from "@/components/ui/input-disabled";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { paymentCategories } from "../_constants/payment-categories";
import { useOrderStore } from "../_stores/order-store";
import { currencyFormatter } from "../_utils/currency-formatter";
import {
  orderPaymentSchema,
  type orderPaymentType,
} from "../schema/order-payment-schema";

export const OrderPaymentForm = () => {
  const setTrigger = useOrderStore((state) => state.setTrigger);
  const setPayment = useOrderStore((state) => state.setPayment);
  const order = useOrderStore((state) => state.order);
  const loading = useOrderStore((state) => state.loading);

  const form = useForm<orderPaymentType>({
    resolver: zodResolver(orderPaymentSchema),
    defaultValues: {
      deliveryDays: order.deliveryDays,
      paymentMethod: order.paymentMethod || "TO_AGREE",
      discountPercent: order.discountPercent || 0.1,
      discount: 0,
      advanceAmount: order.advanceAmount,
      advancePaymentMethod: order.advancePaymentMethod || "TO_AGREE",
      installmentCount: order.installmentCount,
      notes: order.notes,
    },
  });

  const {
    order: { rawAmount = 0 },
  } = useOrderStore();

  const discount = form.watch("discount");
  const advanceAmount = form.watch("advanceAmount") ?? 0;
  const installmentCount = Number(form.watch("installmentCount") ?? 0);

  const discountMessage = discount
    ? `Desconto final: ${currencyFormatter.format(discount)}`
    : "Desconto não aplicado";

  const remainingPerInstallment = installmentCount
    ? (rawAmount - advanceAmount - (discount ?? 0)) / installmentCount
    : 0;

  const installmentsLabel = installmentCount > 1 ? "parcelas" : "parcela";

  const remainingMessage = installmentCount
    ? `Restante: ${installmentCount} ${installmentsLabel} de ${currencyFormatter.format(remainingPerInstallment)}`
    : "Escolha o n° de parcelas";

  useEffect(() => {
    setTrigger("paymentForm", form.trigger);
  }, [form.trigger, setTrigger]);

  useEffect(() => {
    const initialPercent = form.getValues("discountPercent");
    const initialDiscount = initialPercent * rawAmount;

    form.setValue("discount", initialDiscount, {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, []);

  useEffect(() => {
    const percent = form.getValues("discountPercent") ?? 0;
    const advanceAmount = form.getValues("advanceAmount") ?? 0;
    const discountValue = rawAmount * percent;

    form.setValue("discount", discountValue, {
      shouldDirty: false,
      shouldValidate: true,
    });

    form.setValue("advanceAmount", advanceAmount, {
      shouldDirty: false,
      shouldValidate: true,
    });

    setPayment({ discountPercent: percent, advanceAmount: 0 });
  }, [rawAmount]);

  if (loading) {
    return (
      <div className="flex grid-cols-1 flex-col gap-3 lg:grid-cols-1">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-start">
        <FormField
          control={form.control}
          name="deliveryDays"
          render={({ field }) => (
            <FormItem className="col-span-1 lg:col-span-6">
              <FormLabel>Previsão de entrega</FormLabel>
              <FormControl>
                <NumericFormat
                  value={field.value ?? ""}
                  onValueChange={(values) => {
                    field.onChange(values.floatValue ?? "");
                  }}
                  allowNegative={false}
                  decimalScale={0}
                  suffix={` ${field.value === 1 ? "dia útil" : "dias úteis"}`}
                  placeholder="Número de dias úteis"
                  customInput={Input}
                  isAllowed={(values) => {
                    const { floatValue } = values;
                    return floatValue === undefined || floatValue >= 1;
                  }}
                  onBlur={() => {
                    field.onBlur();
                    setPayment({ deliveryDays: field.value });
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem className="col-span-1 lg:col-span-6">
              <FormLabel>Pagamento principal</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(val) => {
                    field.onChange(val as Payment);
                    setPayment({
                      paymentMethod: val as Payment,
                    });
                  }}
                >
                  <SelectTrigger
                    truncate
                    placeholder="Selecione uma opção"
                    className="justify-between"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {paymentCategories.map(({ id, name }) => (
                      <SelectItem key={id} value={id}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="discountPercent"
          render={({ field }) => (
            <FormItem className="col-span-1 lg:col-span-3">
              <FormLabel>Percentual do desconto</FormLabel>
              <FormControl>
                <NumericFormat
                  value={
                    field.value == null
                      ? ""
                      : Math.min(Math.max(field.value * 100, 0), 100)
                  }
                  onValueChange={(values) => {
                    const percent = Math.min(
                      Math.max(values.floatValue ?? 0, 0),
                      100,
                    );
                    const decimalPercent = percent / 100;

                    field.onChange(decimalPercent);

                    const discountValue = decimalPercent * rawAmount;
                    form.setValue("discount", discountValue, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });

                    setPayment({ discountPercent: decimalPercent });
                  }}
                  allowNegative={false}
                  decimalScale={2}
                  fixedDecimalScale
                  suffix="%"
                  decimalSeparator=","
                  placeholder="Ex: 10%"
                  customInput={Input}
                  isAllowed={(values) => (values.floatValue ?? 0) <= 100}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => {
            const handleChange = (values: any) => {
              const newValue = values.floatValue ?? 0;
              field.onChange(newValue);

              const percent = newValue / rawAmount;

              form.setValue("discountPercent", percent, {
                shouldValidate: true,
                shouldDirty: true,
              });

              setPayment({ discountPercent: percent });
            };

            return (
              <FormItem className="col-span-1 lg:col-span-5">
                <FormLabel>Valor do desconto</FormLabel>
                <FormControl>
                  <NumericFormat
                    value={field.value ?? ""}
                    onValueChange={handleChange}
                    allowNegative={false}
                    decimalScale={4}
                    fixedDecimalScale
                    prefix="R$ "
                    thousandSeparator="."
                    decimalSeparator=","
                    placeholder="Ex: R$ 500,00"
                    customInput={Input}
                    isAllowed={(values) =>
                      values.floatValue === undefined ||
                      values.floatValue <= rawAmount
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <InputDisabled className="col-span-1 lg:col-span-4 lg:mt-[1.375rem]">
          {discountMessage}
        </InputDisabled>
        <FormField
          control={form.control}
          name="advanceAmount"
          render={({ field }) => {
            const handleChange = (values: any) => {
              const newValue = values.floatValue ?? 0;
              field.onChange(newValue);
              setPayment({ advanceAmount: newValue });
            };

            return (
              <FormItem className="col-span-1 lg:col-span-3">
                <FormLabel>Adiantamento</FormLabel>
                <FormControl>
                  <NumericFormat
                    value={field.value ?? ""}
                    onValueChange={handleChange}
                    allowNegative={false}
                    decimalScale={2}
                    fixedDecimalScale
                    prefix="R$ "
                    thousandSeparator="."
                    decimalSeparator=","
                    placeholder="Ex: R$ 250,00"
                    customInput={Input}
                    onBlur={field.onBlur}
                    isAllowed={(values) => {
                      const { floatValue } = values;
                      const maxValue =
                        rawAmount - (form.getValues("discount") ?? 0);
                      return floatValue === undefined || floatValue <= maxValue;
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="advancePaymentMethod"
          render={({ field }) => (
            <FormItem className="col-span-1 lg:col-span-3">
              <FormLabel isOptional>Pag. do adiantamento</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(val) => {
                    field.onChange(val as Payment);
                    setPayment({
                      advancePaymentMethod: val as Payment,
                    });
                  }}
                >
                  <SelectTrigger
                    truncate
                    placeholder="Selecione uma opção"
                    className="justify-between"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {paymentCategories.map(({ id, name }) => (
                      <SelectItem key={id} value={id}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="installmentCount"
          render={({ field }) => (
            <FormItem className="col-span-1 lg:col-span-2">
              <FormLabel>Par. do restante</FormLabel>
              <FormControl>
                <Select
                  value={field.value != null ? String(field.value) : ""}
                  onValueChange={(val) => {
                    field.onChange(Number(val));
                    setPayment({
                      installmentCount: Number(val),
                    });
                  }}
                >
                  <SelectTrigger
                    truncate
                    placeholder="N° de parcelas"
                    className="justify-between"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {Array.from({ length: 24 }).map((_, index) => {
                      const installment = index + 1;
                      const formatedInstallment =
                        installment > 1 ? "parcelas" : "parcela";
                      return (
                        <SelectItem
                          key={installment}
                          value={String(installment)}
                        >
                          {installment} {formatedInstallment}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <InputDisabled className="col-span-1 lg:col-span-4 lg:mt-[1.375rem]">
          {remainingMessage}
        </InputDisabled>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="col-span-1 lg:col-span-12">
              <FormLabel isOptional>Observações (cliente)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Ex: Cliente deseja..."
                  onBlur={(e) => {
                    field.onBlur();
                    setPayment({ notes: e.target.value });
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
