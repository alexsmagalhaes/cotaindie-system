"use client";

import { FormWrapper } from "@/app/_components/form-wrapper";
import { DialogBody } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type z from "zod";
import { useUpsertClient } from "../_hooks/use-upsert-client";
import { clientSchema, getClientDefaultValues } from "../_schema/client-schema";
import { ClientActions } from "./client-actions";
import { ClientAdressFields } from "./client-address-feilds";
import { ClientBasicsFields } from "./client-basic-fields";

export const ClientForm = ({ client }: { client?: Client }) => {
  const { isPending, execute } = useUpsertClient();

  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: getClientDefaultValues(client),
  });

  const onSubmit = async (values: z.infer<typeof clientSchema>) => {
    if (isPending) return;
    execute(values);
  };

  return (
    <Form {...form}>
      <FormWrapper onSubmit={form.handleSubmit(onSubmit)}>
        <DialogBody className="grid grid-cols-1 items-start gap-3 lg:grid-cols-6">
          <ClientBasicsFields />
        </DialogBody>
        <DialogBody className="grid grid-cols-1 items-start gap-3 lg:grid-cols-6">
          <ClientAdressFields />
        </DialogBody>
        <DialogBody>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel isOptional>Observações</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Ex: Cliente deseja..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </DialogBody>
        <ClientActions isPending={isPending} />
      </FormWrapper>
    </Form>
  );
};
