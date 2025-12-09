"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSearchList,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  useState,
} from "react";
import { useSearchContext } from "../_context/search-provider";

export const SearchBar = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "border-b-light top-0 flex flex-col gap-3 border-b-0 bg-white px-4 py-4 lg:flex-row lg:gap-6 lg:px-6 lg:py-6 lg:pt-0",
      className,
    )}
  >
    {children}
  </div>
);

export const SearchSortWrap = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-3 lg:flex-row lg:gap-3">{children}</div>
);

const SearchBadge = ({
  term,
  onRemove,
}: {
  term: string;
  onRemove: (term: string) => void;
}) => (
  <Badge className="border-red-default text-xs shadow-[0_-0.25rem_1.25rem_0_rgba(0,0,0,0.04)_inset,0_0.1875rem_0.3125rem_0_rgba(0,0,0,0.05)]">
    {term}
    <button
      onClick={() => onRemove(term)}
      aria-label={`Remover filtro ${term}`}
      className="text-title-light flex cursor-pointer items-center"
    >
      <Icon name="close" size={16} />
    </button>
  </Badge>
);

const SearchBadgeGroup = ({
  filters,
  removeFilter,
  maxVisible = 3,
}: {
  filters: string[];
  removeFilter: (term: string) => void;
  maxVisible?: number;
}) => {
  const visibleFilters = filters.slice(0, maxVisible);
  const extraCount = filters.length - maxVisible;

  return (
    <div className="pointer-events-none absolute right-0 flex h-full items-center justify-end gap-2 pr-4">
      {visibleFilters.map((term) => (
        <div key={term} className="pointer-events-auto">
          <SearchBadge term={term} onRemove={removeFilter} />
        </div>
      ))}
      {extraCount > 0 && (
        <Badge variant="secondary" className="pointer-events-auto">
          +{extraCount} filtro{extraCount > 1 ? "s" : ""}
        </Badge>
      )}
    </div>
  );
};

export const SearchTextFilter = ({
  placeholder = "Pesquise por termos...",
}: {
  placeholder?: string;
}) => {
  const MAX_TAGS = 3;
  const { state, dispatch } = useSearchContext();
  const [input, setInput] = useState("");

  const addFilter = () => {
    const val = input.trim();
    if (!val) return;
    if (!state.text.includes(val)) {
      dispatch({ type: "SET_TEXT", payload: [...state.text, val] });
      setInput("");
    }
  };

  const removeFilter = (term: string) => {
    dispatch({
      type: "SET_TEXT",
      payload: state.text.filter((f) => f !== term),
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFilter();
    }
  };

  return (
    <div className="relative flex grow gap-3 lg:gap-3">
      <div className="relative flex grow">
        <Input
          placeholder={placeholder}
          value={input}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setInput(e.target.value)
          }
          onKeyDown={handleKeyDown}
        />
        <SearchBadgeGroup
          filters={state.text}
          removeFilter={removeFilter}
          maxVisible={MAX_TAGS}
        />
      </div>
      <Button onClick={addFilter} square>
        <Icon name="search" />
      </Button>
    </div>
  );
};

export const SelectFilter = ({
  options,
  filterKey = "category",
  deafultText = "Todas as categorias",
  className,
}: {
  options: { id: string; name: string }[];
  filterKey?: string;
  deafultText?: string;
  className?: string;
}) => {
  const { state, dispatch } = useSearchContext();
  const currentValue =
    state.extras.find((e) => e.key === filterKey)?.value || "";

  const handleChange = (value: string) => {
    if (value === "all") dispatch({ type: "REMOVE_EXTRA", payload: filterKey });
    else dispatch({ type: "SET_EXTRA", payload: { key: filterKey, value } });
  };

  return (
    <Select value={currentValue || "all"} onValueChange={handleChange}>
      <Button variant="secondary" asChild className={className}>
        <SelectTrigger>
          <SelectValue placeholder={deafultText} />
        </SelectTrigger>
      </Button>
      <SelectContent align="end" hideScrollUpButton>
        <SelectSearchList filterKey="name">
          <SelectItem value="all">{deafultText}</SelectItem>
          {options.map((item) => (
            <SelectItem key={item.id} value={item.id} data-item={item}>
              {item.name}
            </SelectItem>
          ))}
        </SelectSearchList>
      </SelectContent>
    </Select>
  );
};

export const SearchSortPeriod = ({ className }: { className?: string }) => {
  const { state, dispatch } = useSearchContext();

  return (
    <Select
      value={state.sort}
      onValueChange={(value) =>
        dispatch({ type: "SET_SORT", payload: value as "DESC" | "ASC" })
      }
    >
      <Button variant="secondary" asChild className={className}>
        <SelectTrigger>
          <SelectValue placeholder="Ordenar" />
        </SelectTrigger>
      </Button>
      <SelectContent>
        <SelectItem value="DESC">Recentes</SelectItem>
        <SelectItem value="ASC">Antigos</SelectItem>
      </SelectContent>
    </Select>
  );
};
