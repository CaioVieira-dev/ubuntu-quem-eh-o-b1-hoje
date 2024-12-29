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
          toast:
            "group/toast group-[.toaster]:bg-background group-[.toaster]:text-foreground  group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group/toast:text-white/85",
          actionButton:
            "group/toast:bg-primary group/toast:text-primary-foreground",
          cancelButton:
            "group/toast:bg-muted group/toast:text-muted-foreground",
          closeButton:
            "group/toast:bg-muted group-data-[type='error']/toast:text-red-500 group-data-[type='success']/toast:text-green-700",
          error:
            "group-[.toaster]:bg-red-500 group-[.toaster]:text-white group-[.toaster]:border group-[.toaster]:border-red-400",
          success:
            "group-[.toaster]:bg-green-500 group-[.toaster]:text-white group-[.toaster]:border group-[.toaster]:border-green-400",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
