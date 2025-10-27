import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
  isLoading = false,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
        <Dialog.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-[90vw] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            sizeClasses[size]
          )}
        >
          {title && (
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </Dialog.Title>
          )}
          {description && (
            <Dialog.Description className="text-sm text-gray-600 mb-4">
              {description}
            </Dialog.Description>
          )}

          <div className="max-h-[70vh] overflow-y-auto px-1 -mx-1">
            {isLoading ? (
              <div className="flex justify-center items-center py-48">
                <Spinner />
              </div>
            ) : (
              children
            )}
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute cursor-pointer top-4 right-4 rounded-sm opacity-70 disabled:pointer-events-none hover:bg-gray-100 p-1 transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
