"use client";

import { ToastCard } from "@/components/ui/toast-card";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { getMaterialsAction } from "../_actions/get-materials-action";

export function useGetMaterials() {
  const query = useQuery<Material[]>({
    queryKey: ["materials"],
    queryFn: getMaterialsAction,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      toast((t) => (
        <ToastCard
          id={t.id}
          status="error"
          title={"Algo deu errado!"}
          text={
            query.error.message ||
            "Não foi possível buscar os materiais. Tente novamente."
          }
        />
      ));
    }
  }, [query.isError, query.error]);

  return {
    data: query.data || [],
    loading: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
