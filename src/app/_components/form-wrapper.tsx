"use client";

import React from "react";

export function FormWrapper({
  children,
  ...props
}: Readonly<React.FormHTMLAttributes<HTMLFormElement>>) {
  return (
    <form
      {...props}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}
