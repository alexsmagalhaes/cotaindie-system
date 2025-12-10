"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetDataTables } from "../_hooks/use-get-data-tables";
import { TableMaterial } from "./table-material";
import { TableOrder } from "./table-order";
import { TableContent, TableTitle, TableWrap } from "./table-wrap";

export const TablesGroup = () => {
  const { data, loading } = useGetDataTables();

  const orders = data?.orders ?? [];
  const materials = data?.materials ?? [];

  if (loading) {
    return (
      <div className="mt-4 hidden grid-cols-1 gap-6 lg:mt-0 lg:grid lg:grid-cols-2 lg:gap-4">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-[1.3125rem] w-[40%]" />
          <Skeleton className="h-[34.25rem] w-full" />
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-[1.3125rem] w-[40%]" />
          <Skeleton className="h-[34.25rem] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mt-6 hidden lg:mt-3 lg:grid lg:gap-4",
        materials.length > 0 ? "lg:grid-cols-2" : "lg:grid-cols-1",
      )}
    >
      <TableWrap>
        <TableTitle>Orçamentos recentes</TableTitle>
        <TableContent>
          <TableOrder orders={orders} />
        </TableContent>
      </TableWrap>

      {materials.length > 0 && (
        <TableWrap>
          <TableTitle>
            Materiais mais utilizados desde o início do mês
          </TableTitle>
          <TableContent>
            <TableMaterial data={materials} />
          </TableContent>
        </TableWrap>
      )}
    </div>
  );
};
