import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, Copy, FileText } from "lucide-react";
import toast from "react-hot-toast";

import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { PaymentReceipt } from "./PaymentReceipt";

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  planName: string;
  amount: number;
  month: number;
  year: number;
  paymentMethod?: string;
  paidAt?: string;
  receiptNumber?: string;
}

export function PaymentReceiptModal({
  isOpen,
  onClose,
  studentName,
  planName,
  amount,
  month,
  year,
  paymentMethod,
  paidAt,
  receiptNumber,
}: PaymentReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async () => {
    if (!receiptRef.current) return null;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      return canvas;
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Erro ao gerar imagem do recibo");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    const canvas = await generateImage();
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `recibo-${studentName.replace(
      /\s+/g,
      "-"
    )}-${month}-${year}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Recibo baixado como imagem!");
  };

  const handleDownloadPDF = async () => {
    const canvas = await generateImage();
    if (!canvas) return;

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`recibo-${studentName.replace(/\s+/g, "-")}-${month}-${year}.pdf`);
    toast.success("Recibo baixado como PDF!");
  };

  const handleCopyToClipboard = async () => {
    const canvas = await generateImage();
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Erro ao copiar recibo");
          return;
        }

        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        toast.success("Recibo copiado! Cole no WhatsApp para enviar.");
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Erro ao copiar recibo para área de transferência");
    }
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={onClose}
      title="Recibo de Pagamento"
      size="2xl"
    >
      <div className="space-y-6 py-4">
        {/* Receipt Preview */}
        <div className="overflow-auto">
          <PaymentReceipt
            ref={receiptRef}
            studentName={studentName}
            planName={planName}
            amount={amount}
            month={month}
            year={year}
            paymentMethod={paymentMethod}
            paidAt={paidAt}
            receiptNumber={receiptNumber}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleDownloadImage}
            disabled={isGenerating}
            loading={isGenerating}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar Imagem
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            loading={isGenerating}
            className="flex-1"
          >
            <FileText className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>
          <Button
            variant="brand-pink"
            onClick={handleCopyToClipboard}
            disabled={isGenerating}
            loading={isGenerating}
            className="flex-1"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copiar para WhatsApp
          </Button>
        </div>

        <div className="flex justify-end border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
