"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

export const Toast = () => {
  const isSmallScreen = useMediaQuery("(max-width: 1023px)");
  const pathname = usePathname();

  const margins: Record<string, { desktop: string; mobile: string }> = {
    "/order": { desktop: "6.125rem", mobile: "4.5rem" },
    "/materials": { desktop: "5rem", mobile: "4.5rem" },
    "/orders": { desktop: "5rem", mobile: "4.5rem" },
    "/clients": { desktop: "5rem", mobile: "4.5rem" },
  };

  const matchedRoute = Object.keys(margins).find((route) =>
    pathname.startsWith(route),
  );

  let marginBottom: string;

  if (matchedRoute) {
    const marginConfig = margins[matchedRoute];

    marginBottom = isSmallScreen ? marginConfig.mobile : marginConfig.desktop;
  } else {
    marginBottom = isSmallScreen ? "1.5rem" : "0.5rem";
  }

  const toasterKey = `${pathname}-${isSmallScreen ? "mobile" : "desktop"}`;

  return (
    <Toaster
      key={toasterKey}
      gutter={16}
      position={isSmallScreen ? "bottom-center" : "bottom-right"}
      toastOptions={{
        style: {
          transition: "0ms",
          height: "auto",
          maxWidth: "none",
          width: "100%",
          padding: 0,
          margin: 0,
          boxShadow: "none",
          background: "transparent",
          pointerEvents: "none",
        },
      }}
      containerStyle={{
        margin: 0,
        padding: 0,
        marginBottom,
      }}
    />
  );
};
