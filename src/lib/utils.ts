import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Decimal } from "@prisma/client/runtime/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | Decimal | string): string {
  const num = typeof value === "string" ? parseFloat(value) : Number(value);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function calculateOrderTotal(
  services: { unitPrice: number | Decimal | string; quantity: number }[],
  parts: { unitPrice: number | Decimal | string; quantity: number }[]
): number {
  const servicesTotal = services.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0
  );
  const partsTotal = parts.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0
  );
  return servicesTotal + partsTotal;
}
