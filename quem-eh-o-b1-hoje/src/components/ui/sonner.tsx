"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast",
          description: "text-white/80",
          closeButton:
            "group-[:is([data-sonner-toast],[data-close-button])]:bg-red-500",

          error: "bg-red-500 text-white border border-red-400",
          icon: "text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
