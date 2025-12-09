"use client";

import { cn } from "@/lib/utils";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cx } from "class-variance-authority";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./icon";

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cx(
        "border-b-light placeholder:body-lighter rounded-default h-12 w-full border px-4 pb-0.5 lg:px-5",
        className,
      )}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  children,
  placeholder,
  truncate = false,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  placeholder?: string;
  truncate?: boolean;
}) {
  return (
    <SelectPrimitive.Trigger
      {...props}
      data-slot="select-trigger"
      className={cn(
        "group border-b-light rounded-default text-title-light flex h-[2.875rem] w-full cursor-pointer items-center justify-between gap-2 border bg-[#F4F4F0] px-5 text-left font-medium shadow-[inset_0_-0.25rem_1.25rem_0_rgba(0,0,0,0.04),0_0.1875rem_0.3125rem_0_rgba(0,0,0,0.05)] hover:bg-[#F0F0EC]",
        truncate && "overflow-hidden",
        className,
      )}
    >
      <span className={cn("w-full", truncate && "truncate")}>
        <SelectPrimitive.Value
          placeholder={placeholder}
          className={cn("w-full", truncate && "truncate")}
        />
      </span>
      <SelectPrimitive.Icon asChild>
        <Icon
          name="keyboard_arrow_down"
          size={20}
          className="-mr-1 transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

interface SelectContentProps
  extends React.ComponentProps<typeof SelectPrimitive.Content> {
  classNameViewport?: string;
}

type SelectSearchListProps = {
  children: React.ReactNode;
  filterKey: string;
  placeholder?: string;
};

function isElementWithProps(
  node: React.ReactNode,
): node is React.ReactElement<{ [key: string]: any }> {
  return !!node && typeof node === "object" && "props" in node;
}

function SelectSearchList({
  children,
  filterKey,
  placeholder = "Buscar...",
}: Readonly<SelectSearchListProps>) {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const childArray = React.Children.toArray(children);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return childArray;

    return childArray.filter((child) => {
      if (!isElementWithProps(child)) return false;

      const item = child.props["data-item"];
      if (!item) return true;

      const value = String(item?.[filterKey] ?? "").toLowerCase();
      return value.includes(searchTerm.toLowerCase());
    });
  }, [children, searchTerm, filterKey]);

  useEffect(() => {
    if (searchTerm) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [filteredItems, searchTerm]);

  return (
    <>
      <div className="border-b-light sticky -top-1 z-20 -mx-1 -mt-1 mb-1 flex h-(--radix-select-trigger-height) min-w-full items-center border-b bg-white px-4 py-3">
        <Icon name="search" size={20} className="mr-2 shrink-0 opacity-50" />
        <input
          ref={inputRef}
          autoFocus
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          className="flex h-6 w-full rounded-md bg-transparent text-sm outline-none"
        />
      </div>
      <SelectScrollUpButton className="sticky top-12 z-10 mx-0 mb-1" />
      <div className="pt-0">
        {filteredItems.length > 0 ? (
          filteredItems
        ) : (
          <div className="p-4 text-center text-sm text-gray-500">
            Sem resultados
          </div>
        )}
      </div>
    </>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  classNameViewport,
  hideScrollUpButton = false,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & {
  classNameViewport?: string;
  hideScrollUpButton?: boolean;
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 border-b-light rounded-default relative z-50 mt-1 flex max-h-80 w-full origin-(--radix-select-content-transform-origin) flex-col overflow-x-hidden overflow-y-auto border bg-white p-0!",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        {!hideScrollUpButton && <SelectScrollUpButton />}

        <SelectPrimitive.Viewport
          className={cn(
            position === "popper" &&
              "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-1",
            "p-1",
            classNameViewport,
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "rounded-default hover:bg-beige-light/50 relative flex w-full cursor-pointer items-center gap-2 truncate px-5 py-3 select-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ml-auto">
        <Icon name="check_small" size={20} className="text-red-default" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "rounded-default border-b-light text-title-light mx-1 mt-1 flex cursor-default items-center justify-center border bg-[#F4F4F0] py-1 shadow-[inset_0_-0.25rem_1.25rem_0_rgba(0,0,0,0.04),0_0.1875rem_0.3125rem_0_rgba(0,0,0,0.05)] hover:bg-[#F0F0EC]",
        className,
      )}
      {...props}
    >
      <Icon name="keyboard_arrow_up" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "rounded-default border-b-light text-title-light mx-1 mb-1 flex cursor-default items-center justify-center border bg-[#F4F4F0] py-1 shadow-[inset_0_-0.25rem_1.25rem_0_rgba(0,0,0,0.04),0_0.1875rem_0.3125rem_0_rgba(0,0,0,0.05)] hover:bg-[#F0F0EC]",
        className,
      )}
      {...props}
    >
      <Icon name="keyboard_arrow_down" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSearchList,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
