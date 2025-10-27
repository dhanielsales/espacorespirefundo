import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface DeleteConfirmationAlertProps {
  children: React.ReactNode; // Trigger button
  title?: string;
  description: string | React.ReactNode;
  onConfirm: () => void;
  isPending?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export function DeleteConfirmationAlert({
  children,
  title = "Tem certeza absoluta?",
  description,
  onConfirm,
  isPending = false,
  confirmText = "Sim, excluir",
  cancelText = "Cancelar",
}: DeleteConfirmationAlertProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            variant="destructive"
          >
            {isPending ? "Excluindo..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
