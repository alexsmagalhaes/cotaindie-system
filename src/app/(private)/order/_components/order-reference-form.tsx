"use client";

import { FormWrapper } from "@/app/_components/form-wrapper";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSearchList,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useGetClients } from "../../(navgation)/_hooks/use-get-clients";
import { useOrderStore } from "../_stores/order-store";
import {
  orderReferenceSchema,
  type orderReferenceType,
} from "../schema/order-reference-schema";

export const OrderReferenceForm = () => {
  const { data: clients, loading: clientsLoading } = useGetClients();
  const loading = useOrderStore((state) => state.loading);

  const setReference = useOrderStore((state) => state.setReference);
  const setTrigger = useOrderStore((state) => state.setTrigger);
  const order = useOrderStore((state) => state.order);

  const form = useForm<orderReferenceType>({
    resolver: zodResolver(orderReferenceSchema),
    defaultValues: {
      title: order.name,
      client: order.client?.id,
      startsAt: order.initialDate ? new Date(order.initialDate) : new Date(),
    },
  });

  useEffect(() => {
    setTrigger("referencesForm", form.trigger);
  }, [form.trigger, setTrigger]);

  if (loading || clientsLoading) {
    return <Skeleton className="h-10" />;
  }

  return (
    <Form {...form}>
      <FormWrapper className="grid grid-cols-1 items-start gap-3 lg:grid-cols-12">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="col-span-1 lg:col-span-5">
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Título do orçamento"
                  onBlur={(e) => {
                    field.onBlur();
                    setReference({ name: e.target.value });
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="client"
          render={({ field }) => (
            <FormItem className="col-span-1 lg:col-span-4">
              <FormLabel>Cliente</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(val) => {
                    field.onChange(val);
                    const client = clients.find((c) => c.id === val);
                    if (client) setReference({ client });
                  }}
                >
                  <SelectTrigger
                    truncate
                    placeholder="Selecione um cliente"
                    className="justify-between"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectSearchList filterKey="name">
                      {clients.map((item) => (
                        <SelectItem
                          key={item.id}
                          value={item.id}
                          data-item={item}
                        >
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectSearchList>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startsAt"
          render={({ field }) => (
            <FormItem className="col-span-1 lg:col-span-3">
              <FormLabel>Data inicial</FormLabel>
              <FormControl>
                <DatePicker
                  {...field}
                  placeholder="Início..."
                  allowFutureDates
                  onBlur={() => {
                    field.onBlur();
                    if (field.value)
                      setReference({ initialDate: field.value.toISOString() });
                  }}
                  onChange={(val) => {
                    field.onChange(val);
                    if (val) setReference({ initialDate: val.toISOString() });
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
