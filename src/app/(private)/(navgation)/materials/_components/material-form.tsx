"use client";

import { FormWrapper } from "@/app/_components/form-wrapper";
import { DialogBody } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type z from "zod";
import { useUpsertMaterial } from "../_hooks/use-upsert-material";
import {
  getMaterialDefaultValues,
  materialSchema,
} from "../_schema/material-schema";
import { MaterialBasicFields } from "./materail-basic-fields";
import { MaterialActions } from "./material-actions";
import { MaterialCutFields } from "./material-cut-fields";
import { MaterialDinamicFields } from "./material-dynamic-fields";

export const MateriaForm = ({ material }: { material?: Material }) => {
  const { isPending, execute } = useUpsertMaterial();

  const form = useForm<z.infer<typeof materialSchema>>({
    resolver: zodResolver(materialSchema),
    defaultValues: getMaterialDefaultValues(material),
  });

  const onSubmit = (values: z.infer<typeof materialSchema>) => {
    if (isPending) return;
    execute(values);
  };

  return (
    <Form {...form}>
      <FormWrapper onSubmit={form.handleSubmit(onSubmit)}>
        <DialogBody className="grid grid-cols-1 items-start gap-3 lg:grid-cols-4">
          <MaterialBasicFields />
        </DialogBody>
        <DialogBody className="flex flex-col items-start gap-3 lg:flex-row">
          <MaterialDinamicFields />
        </DialogBody>
        <MaterialCutFields />
        <MaterialActions isPending={isPending} />
      </FormWrapper>
    </Form>
  );
};
