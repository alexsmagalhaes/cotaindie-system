"use client";

import { FormWrapper } from "@/app/_components/form-wrapper";
import { DialogBody } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormList,
  FormListItem,
  FormMessage,
} from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { InputDisabled } from "@/components/ui/input-disabled";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSearchList,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToastCard } from "@/components/ui/toast-card";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useRef } from "react";
import {
  useFieldArray,
  useForm,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import toast from "react-hot-toast";
import { NumericFormat } from "react-number-format";
import type z from "zod";
import { measureMap } from "../../(navgation)/_constants/mesure-map";
import { useGetMaterials } from "../../(navgation)/_hooks/use-get-materials";
import { cutDirectionMap } from "../../(navgation)/materials/_utils/cut-direction-map";
import { formatMeasure } from "../_utils/format-measure";
import {
  getPiecetDefaultValues,
  pieceSchema,
} from "../schema/piece-form-schema";
import { PieceFormActions } from "./piece-form-actions";

export const PieceForm = ({
  formParent,
}: {
  formParent: UseFormReturn<FieldValues, any, FieldValues>;
}) => {
  const id = useId();

  const { data: materials } = useGetMaterials();

  const form = useForm<z.infer<typeof pieceSchema>>({
    resolver: zodResolver(pieceSchema),
    defaultValues: getPiecetDefaultValues(),
  });

  const { watch, setValue } = form;

  const measureType = watch("material.measureType");
  const cutDirection = watch("material.cutDirection");
  const unit = watch("material.unit");
  const measure = watch("material.measure");
  const material = watch("material.name");

  const isFirstRender = useRef(true);
  const previousMeasureType = useRef(measureType);

  useEffect(() => {
    if (!isFirstRender.current && previousMeasureType.current !== measureType) {
      if (measureType === "M2") setValue("measure", [0, 0]);
      if (measureType === "ML") setValue("measure", [0]);
      if (measureType === "UN") setValue("measure", [1]);
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
    }

    previousMeasureType.current = measureType;
  }, [measureType]);

  const { append } = useFieldArray({
    control: formParent.control,
    name: "pieces",
  });

  const onSubmit = async (values: z.infer<typeof pieceSchema>) => {
    const isValid = await form.trigger();
    if (!isValid) return;

    append(values);

    if (values.material.measureType === "M2") {
      form.setValue("measure", [0, 0]);
    }

    if (values.material.measureType === "ML") {
      form.setValue("measure", [0]);
    }

    if (values.material.measureType === "UN") {
      form.setValue("measure", [1]);
    }

    form.setValue("name", "");
    form.setValue("qtde", 1);

    toast((t) => (
      <ToastCard
        id={t.id}
        status="success"
        title="Peças adicionadas!"
        text="O projeto recebeu as novas peças."
      />
    ));
  };

  return (
    <Form {...form}>
      <FormWrapper id={id}>
        <DialogBody className="grid grid-cols-1 items-start gap-3 lg:grid-cols-6">
          <FormField
            control={form.control}
            name="material.name"
            render={({ field }) => (
              <FormItem className="order-1 col-span-1 lg:order-1 lg:col-span-4">
                <FormLabel>Material</FormLabel>
                <FormControl>
                  <Select
                    value={
                      materials.find((opt) => opt.name === field.value)?.id ??
                      ""
                    }
                    onValueChange={(value) => {
                      const selectedMaterial = materials.find(
                        (opt) => opt.id === value,
                      );
                      if (selectedMaterial) {
                        form.setValue("material.id", selectedMaterial.id, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        form.setValue("material.name", selectedMaterial.name, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        form.setValue("material.code", selectedMaterial.code, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        form.setValue(
                          "material.measureType",
                          selectedMaterial.measureType,
                          {
                            shouldValidate: true,
                            shouldDirty: true,
                          },
                        );
                        form.setValue(
                          "material.measure",
                          selectedMaterial.measure,
                          {
                            shouldValidate: true,
                            shouldDirty: true,
                          },
                        );
                        form.setValue(
                          "material.baseValue",
                          selectedMaterial.baseValue,
                          {
                            shouldValidate: true,
                            shouldDirty: true,
                          },
                        );
                        form.setValue("material.unit", selectedMaterial.unit, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        form.setValue(
                          "material.wasteTax",
                          selectedMaterial.wasteTax,
                          {
                            shouldValidate: true,
                            shouldDirty: true,
                          },
                        );
                        form.setValue(
                          "material.cutDirection",
                          selectedMaterial.cutDirection,
                          {
                            shouldValidate: true,
                            shouldDirty: true,
                          },
                        );
                      }
                    }}
                  >
                    <SelectTrigger
                      truncate
                      placeholder="Selecione um material"
                      className="justify-between"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectSearchList filterKey="name">
                        {materials.map((item) => (
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
                {material && (
                  <FormList>
                    <FormListItem>
                      {formatMeasure(measure, unit, measureType)}
                    </FormListItem>
                  </FormList>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          {material && measureType !== "UN" && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="order-2 col-span-1 lg:order-3 lg:col-span-4">
                  <FormLabel>Nome da peça</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Peça do local..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="material.baseValue"
            render={({ field }) => (
              <FormItem className="order-3 col-span-1 lg:order-2 lg:col-span-2">
                <FormLabel>Valor base</FormLabel>
                <FormControl>
                  <NumericFormat
                    value={field.value ?? ""}
                    onValueChange={(values) =>
                      field.onChange(values.floatValue ?? 0)
                    }
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                    prefix="R$ "
                    allowNegative={false}
                    customInput={Input}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="qtde"
            render={({ field }) => (
              <FormItem
                className={cn(
                  "order-4 col-span-1 lg:order-4 lg:col-span-6",
                  material &&
                    measureType !== "UN" &&
                    "col-span-1 lg:col-span-2",
                )}
              >
                <FormLabel>Quantidade</FormLabel>
                <FormControl>
                  <NumericFormat
                    value={field.value ?? 0}
                    onValueChange={(values) => {
                      field.onChange(values.floatValue ?? 0);
                    }}
                    allowNegative={false}
                    decimalScale={0}
                    suffix={` ${field.value === 1 ? "peça" : "peças"}`}
                    placeholder="Qtde..."
                    customInput={Input}
                    isAllowed={(values) => {
                      const { floatValue } = values;
                      return floatValue === undefined || floatValue >= 1;
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </DialogBody>

        {measureType && (
          <DialogBody className="flex flex-col items-start gap-3 lg:flex-row">
            {measureType === "M2" && (
              <>
                <FormField
                  control={form.control}
                  name="measure.0"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Largura</FormLabel>
                      <FormControl>
                        <NumericFormat
                          value={field.value}
                          onValueChange={(values) =>
                            field.onChange(values.floatValue ?? 0)
                          }
                          suffix={` ${measureMap["ML"]}`}
                          allowNegative={false}
                          decimalScale={0}
                          customInput={Input}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-title-light -mt-1 hidden pt-9 text-base lg:flex">
                  x
                </div>
                <FormField
                  control={form.control}
                  name="measure.1"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Altura</FormLabel>
                      <FormControl>
                        <NumericFormat
                          value={field.value}
                          onValueChange={(values) =>
                            field.onChange(values.floatValue ?? 0)
                          }
                          suffix={` ${measureMap["M2"]}`}
                          allowNegative={false}
                          decimalScale={3}
                          customInput={Input}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <InputDisabled className="shrink-0 lg:mt-5.5">
                  {cutDirection === "VH" && <Icon name={"grid_on"} />}
                  {cutDirection === "H" && <Icon name={"table_rows_narrow"} />}
                  {cutDirection === "V" && <Icon name={"calendar_view_week"} />}
                  {cutDirection && cutDirectionMap[cutDirection]}
                </InputDisabled>
              </>
            )}
            {measureType === "ML" && (
              <>
                <FormField
                  control={form.control}
                  name="measure.0"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Comprimento</FormLabel>
                      <FormControl>
                        <NumericFormat
                          value={field.value}
                          onValueChange={(values) =>
                            field.onChange(values.floatValue ?? 10)
                          }
                          suffix={` ${measureMap["ML"]}`}
                          allowNegative={false}
                          decimalScale={0}
                          customInput={Input}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <InputDisabled className="shrink-0 lg:mt-5.5">
                  <Icon name={"table_rows_narrow"} />
                  Comp. horizontal
                </InputDisabled>
              </>
            )}
            <InputDisabled
              className={cn(
                measureType === "UN" && "w-full",
                measureType !== "UN" && "mt-5.5 shrink-0",
              )}
            >
              Unidade: {measureType}
            </InputDisabled>
          </DialogBody>
        )}

        <PieceFormActions onSubmit={() => onSubmit(form.getValues())} />
      </FormWrapper>
    </Form>
  );
};
