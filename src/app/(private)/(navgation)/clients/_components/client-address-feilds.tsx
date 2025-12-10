import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { PatternFormat } from "react-number-format";

export function ClientAdressFields() {
  const form = useFormContext();

  return (
    <>
      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem className="col-span-1 lg:col-span-2">
            <FormLabel>Cidade</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ex: Viçosa do Ceará" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="cep"
        render={({ field }) => (
          <FormItem className="col-span-1 lg:col-span-2">
            <FormLabel isOptional>CEP</FormLabel>
            <FormControl>
              <PatternFormat
                format="#####-###"
                mask="_"
                value={field.value}
                onValueChange={(values) => field.onChange(values.value)}
                customInput={Input}
                placeholder="Ex: 62300 - 000"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="neighborhood"
        render={({ field }) => (
          <FormItem className="col-span-1 lg:col-span-2">
            <FormLabel isOptional>Bairro</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ex: Centro" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="street"
        render={({ field }) => (
          <FormItem className="col-span-1 lg:col-span-3">
            <FormLabel isOptional>Endereço</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ex: Rua da...." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="complement"
        render={({ field }) => (
          <FormItem className="col-span-1 lg:col-span-3">
            <FormLabel isOptional>Complemento ou referência</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ex: Próximo ao..." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
