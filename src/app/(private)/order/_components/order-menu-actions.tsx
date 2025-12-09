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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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

export const OrderMenuActions = () => {
  const { order, setStatusInfo } = useOrderStore();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const router = useRouter();
  const { execute: handleSave, isPending: isPendingUpsert } = useUpsertOrder();
  const { execute: executeCopy, isPending: isPendingCopy } = useCopyOrder();
  const { execute: executeDelete, isPending: isPendingDelete } =
    useDeleteOrder();

  const handleDelete = async () => {
    if (order.id) {
      executeDelete(order.id);
    }

    setIsDeleteOpen(false);

    window.close();
    router.push("/orders");
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
    <div className="hidden gap-4 outline-0 lg:flex">
      <Select
        value={order.status ?? undefined}
        onValueChange={(value) => setStatusInfo({ status: value as Status })}
      >
        <Button variant="secondary" className="border-0" asChild>
          <SelectTrigger
            className="hidden outline-0 lg:flex"
            placeholder="Fase do pedido"
          >
            <SelectValue placeholder="Fase do pedido" />
          </SelectTrigger>
        </Button>
        <SelectContent
          align="end"
          className="divide-x divide-gray-300"
          classNameViewport="px-0"
        >
          <SelectItem
            value="OPEN"
            className="text-yellow-darker font-semibold outline-0"
          >
            Apenas cotado
          </SelectItem>
          <Separator />
          <SelectItem
            value="APPROVED"
            className="text-green-default font-semibold outline-0"
          >
            Pedido finalizado
          </SelectItem>
        </SelectContent>
      </Select>
      <div className="flex">
        <Button
          className="rounded-r-none border-0 border-r border-[#d2837cda] focus:z-10"
          onClick={handleSave}
          disabled={isPendingUpsert}
        >
          {!isPendingUpsert && (
            <>
              <Icon name="folder_check" />
              Salvar
            </>
          )}
          {isPendingUpsert && (
            <>
              <Icon name="progress_activity" className="animate-spin" />{" "}
              Salvando...
            </>
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="group w-8 rounded-l-none border-0 focus:z-10"
              disabled={isPendingUpsert}
            >
              <Icon
                name="keyboard_arrow_down"
                className="group-data-[state=OPEN]:rotate-180"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[12.5rem]">
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
          <DeleteDialog
            handleDelete={handleDelete}
            isPending={isPendingDelete}
          />
        </Dialog>
      </div>
    </div>
  );
};
