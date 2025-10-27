/**
 * Format CPF from 11 digits to XXX.XXX.XXX-XX
 * @param cpf - CPF with 11 digits (no formatting)
 * @returns Formatted CPF or original value if invalid
 */
export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return "";

  // Remove any non-digit characters
  const digits = cpf.replace(/\D/g, "");

  // Check if it has 11 digits
  if (digits.length !== 11) return cpf;

  // Format: XXX.XXX.XXX-XX
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Remove formatting from CPF, keeping only digits
 * @param cpf - CPF with or without formatting
 * @returns CPF with only digits (11 characters)
 */
export function cleanCPF(cpf: string | null | undefined): string {
  if (!cpf) return "";

  // Remove all non-digit characters
  return cpf.replace(/\D/g, "");
}

/**
 * Validate CPF format (checks if has 11 digits)
 * @param cpf - CPF to validate
 * @returns true if valid format (11 digits)
 */
export function isValidCPFFormat(cpf: string | null | undefined): boolean {
  if (!cpf) return false;

  const digits = cleanCPF(cpf);
  return digits.length === 11;
}
