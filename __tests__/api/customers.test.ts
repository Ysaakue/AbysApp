import { GET, POST } from "@/app/api/customers/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    customer: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: "1", name: "Admin", email: "admin@test.com" } }),
}));

describe("GET /api/customers", () => {
  it("returns customers list", async () => {
    const mockCustomers = [
      { id: 1, name: "Alice", phone: "11999999999", email: null, createdAt: new Date() },
    ];
    (prisma.customer.findMany as jest.Mock).mockResolvedValue(mockCustomers);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("Alice");
  });
});

describe("POST /api/customers", () => {
  it("creates a customer with valid data", async () => {
    const created = { id: 2, name: "Bob", phone: "11888888888", email: "bob@test.com", createdAt: new Date() };
    (prisma.customer.create as jest.Mock).mockResolvedValue(created);

    const req = new NextRequest("http://localhost/api/customers", {
      method: "POST",
      body: JSON.stringify({ name: "Bob", phone: "11888888888", email: "bob@test.com" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.name).toBe("Bob");
  });

  it("returns 400 for missing required fields", async () => {
    const req = new NextRequest("http://localhost/api/customers", {
      method: "POST",
      body: JSON.stringify({ email: "nophone@test.com" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
