import { Button } from "@/components/ui/button";
import { DialogBody } from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { OrderEmptyTable } from "./order-empty-table";
import { PiecesTable } from "./pieces-table";
import {
  PiecesActions,
  PiecesContent,
  PiecesTotal,
  ProjectPieces,
} from "./project-pieces";

export const ProjectStepOne = () => {
  const form = useFormContext();
  const pieces = form.watch("pieces");

  return (
    <>
      <DialogBody className="grid grid-cols-1 items-start gap-3 lg:grid-cols-12">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="col-span-1 lg:col-span-10">
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Nome da peça a ser adicionada"
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
            <FormItem className="col-span-1 lg:col-span-2">
              <FormLabel>Quantidade</FormLabel>
              <FormControl>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(val) => field.onChange(Number(val))}
                >
                  <SelectTrigger
                    truncate
                    placeholder="Qtde..."
                    className="justify-between"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {Array.from({ length: 10 }).map((_, index) => {
                      const value = index + 1;
                      return (
                        <SelectItem key={value} value={String(value)}>
                          {value}
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
      </DialogBody>
      <DialogBody className="flex items-start gap-3">
        <ProjectPieces>
          <PiecesContent>
            <ScrollArea className="grow">
              <div className="max-w-[calc(100vw-2rem)]">
                {!pieces.length && (
                  <PiecesActions>
                    <OrderEmptyTable
                      title="Clique para adicionar uma peça"
                      text="Adicione uma peça a primeira peça do projeto."
                    />
                  </PiecesActions>
                )}
                {!!pieces.length && <PiecesTable pieces={pieces} />}
              </div>
            </ScrollArea>
            {pieces.length > 0 && (
              <PiecesActions>
                <Button variant="secondary" className="w-full">
                  <Icon name="add_2" />
                  Nova peça
                </Button>
              </PiecesActions>
            )}
          </PiecesContent>
          <PiecesTotal />
        </ProjectPieces>
      </DialogBody>
    </>
  );
};
