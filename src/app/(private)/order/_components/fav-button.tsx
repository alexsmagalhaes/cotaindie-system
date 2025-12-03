"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { ROUTES } from "@/constants/urls";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteDialog } from "../../(navgation)/_components/delete-dialog";
import { useGenerateContractDocument } from "../../(navgation)/_hooks/use-generate-contract-document";
import { useGenerateCuttingPlanDocument } from "../../(navgation)/_hooks/use-generate-cutting-plan-document";
import { useGenerateMaterialsDocument } from "../../(navgation)/_hooks/use-generate-materials-document";
import { useGenerateQuoteDocument } from "../../(navgation)/_hooks/use-generate-quote-document";
import { mapOrderToContractDoc } from "../../(navgation)/_utils/map-order-to-contract-doc";
import { mapOrderToCuttingPlanDoc } from "../../(navgation)/_utils/map-order-to-cutting-plan-doc";
import { mapOrderToMaterialsDoc } from "../../(navgation)/_utils/map-order-to-materials-doc";
import { mapOrderToQuoteDoc } from "../../(navgation)/_utils/map-order-to-quote-doc";
import { useCopyOrder } from "../../(navgation)/orders/_hooks/use-copy-order";
import { useDeleteOrder } from "../../(navgation)/orders/_hooks/use-delete-order";
import { useUpsertOrder } from "../_hooks/use-order-save";
import { useOrderStore } from "../_stores/order-store";

interface FavButtonWrapperProps {
  children: React.ReactNode;
}

export const FavButtonWrapper = ({ children }: FavButtonWrapperProps) => (
  <div className="fixed right-4 bottom-[6rem] z-50 flex flex-col items-end gap-3 lg:hidden">
    {children}
  </div>
);

export const SaveButton = () => {
  const { execute: handleSave, isPending: isPendingUpsert } = useUpsertOrder();

  return (
    <Button
      onClick={handleSave}
      square
      disabled={isPendingUpsert}
      className="group h-[3.25rem] min-w-[3.25rem] !rounded-[0.5rem] shadow-[0_0_32px_0_rgba(0,0,0,0.16)]"
    >
      {!isPendingUpsert && <Icon name="folder_check" className="text-white" />}
      {isPendingUpsert && (
        <Icon name="progress_activity" className="animate-spin" />
      )}
    </Button>
  );
};

export const OptionsButton = () => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { order } = useOrderStore();
  const router = useRouter();

  const { execute: executeDelete, isPending: isPendingDelete } =
    useDeleteOrder();
  const { execute: executeCopy, isPending: isPendingCopy } = useCopyOrder();

  const handleDelete = async () => {
    if (order.id) {
      executeDelete(order.id);
    }

    setIsDeleteOpen(false);

    window.close();
    router.push(ROUTES.PRIVATE.ORDERS);
  };

  const handleCopy = () => {
    if (order.id) executeCopy(order.id);
  };

  const { generateQuoteDocument } = useGenerateQuoteDocument();
  const handleGenerateQuote = () => {
    const quoteDoc = mapOrderToQuoteDoc(order);
    if (!quoteDoc) {
      return;
    }

    generateQuoteDocument(quoteDoc);
  };

  const { generateContractDocument } = useGenerateContractDocument();
  const handleGenerateContract = () => {
    const contractDoc = mapOrderToContractDoc(order);
    if (!contractDoc) {
      return;
    }

    generateContractDocument(contractDoc);
  };

  const { generateMaterialsDocument } = useGenerateMaterialsDocument();
  const handleGenerateMaterial = () => {
    const materialDoc = mapOrderToMaterialsDoc(order);
    if (!materialDoc) {
      return;
    }

    generateMaterialsDocument(materialDoc);
  };

  const { generateCuttingPlanDocument } = useGenerateCuttingPlanDocument();
  const handleGenerateCuttingPlan = () => {
    const materialDoc = mapOrderToCuttingPlanDoc(order);
    if (!materialDoc) {
      return;
    }

    generateCuttingPlanDocument(materialDoc);
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="group">
          <Button
            className="h-[2.5rem] w-[2.5rem] min-w-[2.5rem] !rounded-[0.5rem] shadow-[0_0_32px_0_rgba(0,0,0,0.16)]"
            variant="secondary"
            square
          >
            <Icon
              name="keyboard_arrow_down"
              className="group-data-[state=open]:rotate-180"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          sideOffset={8}
          align="end"
          className="min-w-[12.5rem]"
        >
          {order.id && (
            <DropdownMenuItem onClick={handleCopy} disabled={isPendingCopy}>
              {!isPendingCopy && (
                <>
                  <Icon name="file_copy" /> Fazer cópia Salvar
                </>
              )}
              {isPendingCopy && (
                <>
                  <Icon name="progress_activity" className="animate-spin" />{" "}
                  Copiando...
                </>
              )}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleGenerateQuote}>
            <Icon name="picture_as_pdf" /> Exportar PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleGenerateCuttingPlan}>
            <Icon name="crop" /> Plano de corte
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleGenerateMaterial}>
            <Icon name="download" /> Espelho de materiais
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleGenerateContract}>
            <Icon name="contract" /> Baixar contrato
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-default"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Icon name="delete" /> Apagar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DeleteDialog handleDelete={handleDelete} isPending={isPendingDelete} />
      </Dialog>
    </>
  );
};
