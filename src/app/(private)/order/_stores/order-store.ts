import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface OrderStore {
  order: Partial<Order>;
  loading: boolean;
  setLoading: (value: boolean) => void;

  setStatusInfo: (data: Partial<Pick<Order, "status">>) => void;
  setReference: (
    data: Partial<Pick<Order, "name" | "client" | "initialDate">>,
  ) => void;
  setExcluded: (
    data: Partial<Pick<Order, "included" | "excluded" | "teamNotes">>,
  ) => void;
  setPayment: (
    data: Partial<
      Pick<
        Order,
        | "deliveryDays"
        | "paymentMethod"
        | "discountPercent"
        | "installmentCount"
        | "advanceAmount"
        | "advancePaymentMethod"
        | "notes"
      >
    >,
  ) => void;

  setProject: (data: Project) => void;
  updateProject: (index: number, updatedProject: Project) => void;
  deleteProject: (index: number) => void;
  duplicateProject: (index: number) => void;

  setRawAmount: (rawAmount: number) => void;

  setOrderId: (id: string) => void;

  setOrderFull: (order: Partial<Order>) => void;

  reset: () => void;

  triggers: Record<string, () => Promise<boolean>>;
  setTrigger: (key: string, fn: () => Promise<boolean>) => void;
}

export const useOrderStore = create<OrderStore>()(
  subscribeWithSelector((set) => ({
    order: {
      status: "OPEN" as Status,
      initialDate: new Date().toISOString(),
      rawAmount: 0,
      deliveryDays: undefined,
      paymentMethod: undefined,
      advancePaymentMethod: undefined,
      discountPercent: 0,
      installmentCount: 1,
      name: "",
      notes: "",
      // projects: undefined,
      included: "",
      excluded: "",
      teamNotes: "",
    },

    loading: true,

    setLoading: (value: boolean) => set({ loading: value }),

    setStatusInfo: (data) =>
      set((state) => ({ order: { ...state.order, ...data } })),

    setReference: (data) =>
      set((state) => ({ order: { ...state.order, ...data } })),

    setExcluded: (data) =>
      set((state) => ({ order: { ...state.order, ...data } })),

    setPayment: (data) =>
      set((state) => ({ order: { ...state.order, ...data } })),

    setProject: (data) =>
      set((state) => ({
        order: {
          ...state.order,
          projects: [...(state.order.projects ?? []), data],
        },
      })),

    updateProject: (index, updatedProject) =>
      set((state) => {
        const projects = [...(state.order.projects ?? [])];
        projects[index] = updatedProject;

        return {
          order: {
            ...state.order,
            projects,
          },
        };
      }),

    deleteProject: (index) =>
      set((state) => {
        const projects = [...(state.order.projects ?? [])];
        projects.splice(index, 1);
        return {
          order: {
            ...state.order,
            projects,
          },
        };
      }),

    duplicateProject: (index) =>
      set((state) => {
        const projects = [...(state.order.projects ?? [])];
        const projectToCopy = projects[index];
        if (!projectToCopy) return state;

        const cloned = structuredClone(projectToCopy);

        delete cloned.id;

        if (Array.isArray(cloned.pieces)) {
          cloned.pieces = cloned.pieces.map((piece) => {
            const { id, ...rest } = piece;
            return rest;
          });
        }

        const duplicated = {
          ...cloned,
          name: `${projectToCopy.name || "Projeto"} (cópia)`,
        };

        projects.splice(index + 1, 0, duplicated);

        return {
          order: {
            ...state.order,
            projects,
          },
        };
      }),

    setRawAmount: (rawAmount: number) =>
      set((state) => ({ order: { ...state.order, rawAmount } })),

    setOrderId: (id: string) =>
      set((state) => ({ order: { ...state.order, id } })),

    setOrderFull: (order: Partial<Order>) =>
      set((state) => ({
        order: {
          ...state.order,
          ...order,
        },
      })),

    reset: () => set({ order: {} }),

    triggers: {},
    setTrigger: (key, fn) =>
      set((state) => ({ triggers: { ...state.triggers, [key]: fn } })),
  })),
);

useOrderStore.subscribe(
  (state) => state.order,
  (newOrder) => {
    console.log("Order updated: ", newOrder);
  },
);
