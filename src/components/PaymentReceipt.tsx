import { forwardRef } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PaymentReceiptProps {
  studentName: string;
  planName: string;
  amount: number;
  month: number;
  year: number;
  paymentMethod?: string;
  paidAt?: string;
  receiptNumber?: string;
}

const paymentMethodLabels: Record<string, string> = {
  cash: "Dinheiro",
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  pix: "PIX",
};

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const PaymentReceipt = forwardRef<HTMLDivElement, PaymentReceiptProps>(
  (
    {
      studentName,
      planName,
      amount,
      month,
      year,
      paymentMethod,
      paidAt,
      receiptNumber,
    },
    ref
  ) => {
    const formattedAmount = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount / 100);

    const formattedDate = paidAt
      ? format(new Date(paidAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
          locale: ptBR,
        })
      : format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
          locale: ptBR,
        });

    return (
      <div
        ref={ref}
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundColor: "#ffffff",
          padding: "32px",
          borderRadius: "8px",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          maxWidth: "28rem",
          margin: "0 auto",
          border: "2px solid #3A3768",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "2px solid #3A3768",
          }}
        >
          <h1
            style={{
              fontSize: "2.2rem",
              fontWeight: "700",
              color: "#3A3768",
              marginBottom: "4px",
              fontFamily: "'Dancing Script', cursive",
            }}
          >
            Espaço Respire Fundo
          </h1>
          <p
            style={{ fontSize: "0.875rem", color: "#4B5563", marginTop: "8px" }}
          >
            Recibo de Pagamento
          </p>
          {receiptNumber && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6B7280",
                marginTop: "4px",
              }}
            >
              Nº {receiptNumber}
            </p>
          )}
        </div>

        {/* Payment Details */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ marginBottom: "16px" }}>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6B7280",
                textTransform: "uppercase",
                fontWeight: "500",
              }}
            >
              Aluno
            </p>
            <p
              style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "#111827",
                marginTop: "4px",
              }}
            >
              {studentName}
            </p>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6B7280",
                textTransform: "uppercase",
                fontWeight: "500",
              }}
            >
              Plano
            </p>
            <p
              style={{
                fontSize: "1rem",
                fontWeight: "500",
                color: "#111827",
                marginTop: "4px",
              }}
            >
              {planName}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#6B7280",
                  textTransform: "uppercase",
                  fontWeight: "500",
                }}
              >
                Referente a
              </p>
              <p
                style={{
                  fontSize: "1rem",
                  fontWeight: "500",
                  color: "#111827",
                  marginTop: "4px",
                }}
              >
                {monthNames[month - 1]}/{year}
              </p>
            </div>

            {paymentMethod && (
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#6B7280",
                    textTransform: "uppercase",
                    fontWeight: "500",
                  }}
                >
                  Forma de Pagamento
                </p>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: "500",
                    color: "#111827",
                    marginTop: "4px",
                  }}
                >
                  {paymentMethodLabels[paymentMethod] || paymentMethod}
                </p>
              </div>
            )}
          </div>

          <div
            style={{
              backgroundColor: "#F3F0FF",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6B7280",
                textTransform: "uppercase",
                fontWeight: "500",
                marginBottom: "4px",
              }}
            >
              Valor Pago
            </p>
            <p
              style={{
                fontSize: "1.875rem",
                fontWeight: "700",
                color: "#3A3768",
              }}
            >
              {formattedAmount}
            </p>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6B7280",
                textTransform: "uppercase",
                fontWeight: "500",
              }}
            >
              Data do Pagamento
            </p>
            <p
              style={{
                fontSize: "1rem",
                fontWeight: "500",
                color: "#111827",
                marginTop: "4px",
              }}
            >
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            paddingTop: "16px",
            borderTop: "1px solid #E5E7EB",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "0.75rem", color: "#6B7280" }}>
            Este documento não é válido como nota fiscal.
          </p>
          <p
            style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "4px" }}
          >
            Obrigado por fazer parte do Espaço Respire Fundo! 💜
          </p>
        </div>
      </div>
    );
  }
);

PaymentReceipt.displayName = "PaymentReceipt";
