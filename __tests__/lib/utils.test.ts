import { calculateOrderTotal, formatCurrency } from "@/lib/utils";

describe("calculateOrderTotal", () => {
  it("returns 0 when both arrays are empty", () => {
    expect(calculateOrderTotal([], [])).toBe(0);
  });

  it("sums service items correctly", () => {
    const services = [
      { unitPrice: 100, quantity: 2 },
      { unitPrice: 50, quantity: 1 },
    ];
    expect(calculateOrderTotal(services, [])).toBe(250);
  });

  it("sums part items correctly", () => {
    const parts = [{ unitPrice: 30, quantity: 3 }];
    expect(calculateOrderTotal([], parts)).toBe(90);
  });

  it("sums services and parts together", () => {
    const services = [{ unitPrice: 200, quantity: 1 }];
    const parts = [{ unitPrice: 50, quantity: 2 }];
    expect(calculateOrderTotal(services, parts)).toBe(300);
  });

  it("handles string prices (from Prisma Decimal)", () => {
    const services = [{ unitPrice: "99.99", quantity: 2 }];
    expect(calculateOrderTotal(services, [])).toBeCloseTo(199.98);
  });
});

describe("formatCurrency", () => {
  it("formats a number as BRL currency", () => {
    const result = formatCurrency(1500);
    expect(result).toContain("1.500");
    expect(result).toContain("R$");
  });

  it("formats a string price", () => {
    const result = formatCurrency("200.50");
    expect(result).toContain("200");
  });
});
