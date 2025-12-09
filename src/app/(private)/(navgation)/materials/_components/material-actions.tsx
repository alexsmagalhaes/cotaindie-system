"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { DialogClose } from "@radix-ui/react-dialog";
import { useFormContext } from "react-hook-form";
import { DeleteDialog } from "../../_components/delete-dialog";
import { useDialog } from "../../_hooks/use-dialog";
import { useDeleteMaterial } from "../_hooks/use-delete-material";

export const MaterialActions = ({ isPending }: { isPending: boolean }) => {
  const { execute, isPending: isPendingDelete } = useDeleteMaterial();
  const { watch, reset } = useFormContext();

  const id = watch("id");

  const { open, setOpen } = useDialog(id);

  const handleReset = () => setTimeout(() => reset(), 200);

  return (
    <DialogFooter className="flex flex-row justify-end gap-3">
      <Button type="submit" disabled={isPending}>
        {!isPending && (
          <>
            <Icon name="folder_check" />
            Salvar
          </>
        )}
        {isPending && (
          <>
            <Icon name="progress_activity" className="animate-spin" />{" "}
            Salvando...
          </>
        )}
      </Button>
      {id && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" disabled={isPendingDelete}>
              <Icon name="delete" />
              Apagar
            </Button>
          </DialogTrigger>
          <DeleteDialog
            handleDelete={() => execute(id)}
            isPending={isPendingDelete}
          />
        </Dialog>
      )}
      <DialogClose asChild>
        <Button
          variant={id ? "outline" : "secondary"}
          onClick={handleReset}
          disabled={isPending}
        >
          Cancelar
        </Button>
      </DialogClose>
    </DialogFooter>
  );
};
