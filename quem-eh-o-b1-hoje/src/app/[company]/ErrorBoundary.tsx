"use client";
import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { FaCircleInfo } from "react-icons/fa6";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { showErrorBoundaryToast } from "~/lib/toasts-helpers";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

//https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/error_boundaries/
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error });
    showErrorBoundaryToast(error.message);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-100 rounded-2xl bg-red-500 p-8">
          <h3 className="mb-4 max-w-[75ch]">
            Ops! Algo deu errado por aqui. Os nossos desenvolvedores já estão
            investigando o caso e tomando um café para se inspirarem
          </h3>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-white">
                <div className="flex gap-2">
                  <FaCircleInfo />
                  Detalhes:
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <span>{this.state.error?.message ?? ""}</span>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
