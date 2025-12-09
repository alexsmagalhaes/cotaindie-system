"use client";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { StepperProvider } from "../_provider/project-stepper-provider";
import { useOrderStore } from "../_stores/order-store";
import { currencyFormatter } from "../_utils/currency-formatter";
import {
  getProjectSummary,
  type ProjectSummary,
} from "../functions/project-summary";
import { OrderEmptyTable } from "./order-empty-table";
import { ProjectsDialog } from "./project-dialog";
import { SummaryActions } from "./summary-actions";

export const SummaryTable = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { order, setRawAmount } = useOrderStore();
  const projects = order.projects ?? [];

  const projectSummaries: ProjectSummary[] = projects.map(getProjectSummary);

  const projectsTotal = projectSummaries.reduce(
    (acc, project) => project.totalValue + acc,
    0,
  );

  useEffect(() => {
    setRawAmount(projectsTotal);
  }, [projectsTotal, setRawAmount]);

  if (!projects.length) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <OrderEmptyTable
            title="Clique para adicionar um projeto"
            text="O orçamento deve conter ao menos um projeto."
          />
        </DialogTrigger>
        <StepperProvider>
          <ProjectsDialog isOpen={setIsOpen} />
        </StepperProvider>
      </Dialog>
    );
  }

  return (
    <Table
      className="border-0"
      classNameWrap="rounded-default border-b-light border"
    >
      <TableHeader>
        <TableRow className="bg-body-dark">
          <TableHead className="max-w-12">N°</TableHead>
          <TableHead className="w-full">Nome do projeto</TableHead>
          <TableHead className="max-w-43">Qtde</TableHead>
          <TableHead className="max-w-43">Valor do projeto</TableHead>
          <TableHead className="max-w-43">Valor total</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="text-title-light">
        {projectSummaries.map(
          ({ name, qtde, projectValue, totalValue, project }, index) => (
            <TableRow
              key={index}
              className="text-title-light whitespace-nowrap last:border-0"
            >
              <TableCell className="pr-0">{index + 1}</TableCell>
              <TableCell>
                <span className="line-clamp-1" title={name}>
                  {name}
                </span>
              </TableCell>
              <TableCell>{qtde}</TableCell>
              <TableCell>{currencyFormatter.format(projectValue)}</TableCell>
              <TableCell>{currencyFormatter.format(totalValue)}</TableCell>
              <TableCell className="flex h-full items-center justify-center text-right">
                <SummaryActions project={project} index={index} />
              </TableCell>
            </TableRow>
          ),
        )}
      </TableBody>
    </Table>
  );
};
