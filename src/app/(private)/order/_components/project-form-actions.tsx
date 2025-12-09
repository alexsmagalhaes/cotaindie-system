"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { DialogClose } from "@radix-ui/react-dialog";
import { useFormContext } from "react-hook-form";
import { DeleteDialog } from "../../(navgation)/_components/delete-dialog";
import { Stepper } from "../_provider/project-stepper-provider";
import { useOrderStore } from "../_stores/order-store";

export const ProjectActions = ({ index }: { index?: number }) => {
  const { reset } = useFormContext();
  const form = useFormContext();
  const stepper = Stepper.useStepper();
  const { deleteProject } = useOrderStore();

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;
    if (!stepper.isLast) stepper.next();
  };

  const handlePrevious = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;
    if (!stepper.isFirst) stepper.prev();
  };

  const handleReset = () => setTimeout(() => reset(), 200);

  const handleDelete = () => {
    if (index !== undefined) deleteProject(index);
  };

  const isPendingSubmit = form.formState.isSubmitting;

  return (
    <DialogFooter className="flex flex-row justify-end gap-3">
      {stepper.isLast && index === undefined && (
        <Button type="submit" disabled={isPendingSubmit}>
          {!isPendingSubmit && (
            <>
              <Icon name="add_2" />
              Adicionar projeto
            </>
          )}
          {isPendingSubmit && (
            <>
              <Icon name="progress_activity" className="animate-spin" />{" "}
              Adicionando...
            </>
          )}
        </Button>
      )}
      {stepper.isLast && index !== undefined && (
        <Button type="submit">
          {!isPendingSubmit && (
            <>
              <Icon name="folder_check" />
              Salvar mudanças
            </>
          )}
          {isPendingSubmit && (
            <>
              <Icon name="progress_activity" className="animate-spin" />{" "}
              Salvando...
            </>
          )}
        </Button>
      )}
      {!stepper.isLast && (
        <Button onClick={handleNext}>
          Próxima etapa
          <Icon name="keyboard_arrow_right" />
        </Button>
      )}
      {index !== undefined && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">
              <Icon name="delete" />
              Apagar projeto
            </Button>
          </DialogTrigger>
          <DeleteDialog handleDelete={handleDelete} />
        </Dialog>
      )}
      {!stepper.isFirst && (
        <Button variant="secondary" onClick={handlePrevious}>
          <Icon name="keyboard_arrow_left" />
          Etapa anterior
        </Button>
      )}

      <DialogClose asChild>
        <Button variant="outline" onClick={handleReset}>
          Cancelar
        </Button>
      </DialogClose>
    </DialogFooter>
  );
};
