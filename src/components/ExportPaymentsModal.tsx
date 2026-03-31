import { useState } from "react";
import { Modal } from "./ui/modal";
import { Select } from "./ui/select";
import { Button } from "./ui/button";
import { paymentsApi } from "../lib/api";

interface ExportPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getLast12Months(): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const label = date.toLocaleDateString("pt-BR", {
      month: "short",
      year: "numeric",
    });
    options.push({ value: `${month}-${year}`, label });
  }

  return options;
}

export function ExportPaymentsModal({
  isOpen,
  onClose,
}: ExportPaymentsModalProps) {
  const monthOptions = getLast12Months();
  const [selected, setSelected] = useState(monthOptions[0].value);
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    const [month, year] = selected.split("-").map(Number);
    setIsExporting(true);
    try {
      const blob = await paymentsApi.exportByMonth(month, year);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pagamentos-${String(month).padStart(2, "0")}-${year}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isExporting) onClose();
      }}
      title="Exportar Pagamentos"
      description="Selecione o mês para exportar todos os pagamentos em CSV."
      size="sm"
      isLoading={isExporting}
    >
      <div className="flex flex-col gap-4">
        <Select
          label="Mês de Referência"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          options={monthOptions}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isExporting}>
            Cancelar
          </Button>
          <Button
            variant="brand-violet"
            onClick={handleExport}
            disabled={isExporting}
          >
            Exportar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
