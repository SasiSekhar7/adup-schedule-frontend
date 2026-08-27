import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Trash2, HelpCircle } from "lucide-react";

export interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning";
}

export type ConfirmFunction = (options: string | ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFunction | null>(null);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm: ConfirmFunction = useCallback((opts) => {
    return new Promise<boolean>((resolve) => {
      let formattedOpts: ConfirmOptions = {};
      if (typeof opts === "string") {
        formattedOpts = {
          title: "Confirmation Required",
          description: opts,
          confirmText: "Confirm",
          cancelText: "Cancel",
          variant: "destructive",
        };
      } else {
        formattedOpts = {
          title: opts.title || "Confirmation Required",
          description: opts.description || "Are you sure you want to proceed?",
          confirmText: opts.confirmText || "Confirm",
          cancelText: opts.cancelText || "Cancel",
          variant: opts.variant || "destructive",
        };
      }

      setOptions(formattedOpts);
      resolverRef.current = resolve;
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  };

  const isDestructive = options.variant === "destructive" || options.variant === "warning";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) handleCancel(); }}>
        <AlertDialogContent className="sm:max-w-[440px] p-6 rounded-xl border border-slate-200 shadow-2xl bg-white dark:bg-slate-900 dark:border-slate-800">
          <AlertDialogHeader className="flex flex-row items-start gap-4 space-y-0 text-left">
            <div
              className={`p-3 rounded-full shrink-0 ${
                isDestructive
                  ? "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
                  : "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
              }`}
            >
              {isDestructive ? (
                <Trash2 className="w-5 h-5" />
              ) : (
                <HelpCircle className="w-5 h-5" />
              )}
            </div>
            <div className="space-y-1.5 flex-1">
              <AlertDialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {options.title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {options.description}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-row items-center justify-end gap-3 sm:gap-2">
            <AlertDialogCancel
              onClick={handleCancel}
              className="mt-0 font-medium border-slate-300 hover:bg-slate-100 text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300"
            >
              {options.cancelText || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={`font-semibold shadow-sm transition-all ${
                isDestructive
                  ? "bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-600 dark:hover:bg-rose-700"
                  : "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
              }`}
            >
              {options.confirmText || "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmFunction => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};
