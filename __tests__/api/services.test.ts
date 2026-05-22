/** @jest-environment node */
import { GET, POST } from "@/app/api/services/route";
import { PATCH, DELETE } from "@/app/api/services/[id]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const mockSession = { user: { id: "1" } };
const mockService = { id: 1, name: "Screen Repair", description: null, price: "150.00" };

jest.mock("@/lib/prisma", () => ({
  prisma: {
    service: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
const { auth } = jest.requireMock("@/lib/auth");

beforeEach(() => {
  jest.clearAllMocks();
  auth.mockResolvedValue(mockSession);
});

describe("GET /api/services", () => {
  it("returns service list", async () => {
    (prisma.service.findMany as jest.Mock).mockResolvedValue([mockService]);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    expect((await GET()).status).toBe(401);
  });
});

describe("POST /api/services", () => {
  it("creates a service", async () => {
    (prisma.service.create as jest.Mock).mockResolvedValue(mockService);
    const req = new NextRequest("http://localhost/api/services", {
      method: "POST",
      body: JSON.stringify({ name: "Screen Repair", price: 150 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await POST(req)).status).toBe(201);
  });

  it("returns 400 when price is missing", async () => {
    const req = new NextRequest("http://localhost/api/services", {
      method: "POST",
      body: JSON.stringify({ name: "Screen Repair" }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("returns 400 when price is negative", async () => {
    const req = new NextRequest("http://localhost/api/services", {
      method: "POST",
      body: JSON.stringify({ name: "Screen Repair", price: -10 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/services", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    expect((await POST(req)).status).toBe(401);
  });
});

describe("PATCH /api/services/[id]", () => {
  it("returns 400 for invalid data", async () => {
    const req = new NextRequest("http://localhost/api/services/1", {
      method: "PATCH",
      body: JSON.stringify({ price: -1 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await PATCH(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(400);
  });

  it("updates a service price", async () => {
    (prisma.service.update as jest.Mock).mockResolvedValue({ ...mockService, price: "200.00" });
    const req = new NextRequest("http://localhost/api/services/1", {
      method: "PATCH",
      body: JSON.stringify({ price: 200 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/services/1", {
      method: "PATCH",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    expect((await PATCH(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});

describe("DELETE /api/services/[id]", () => {
  it("deletes a service and returns 204", async () => {
    (prisma.service.delete as jest.Mock).mockResolvedValue(mockService);
    const req = new NextRequest("http://localhost/api/services/1", { method: "DELETE" });
    expect((await DELETE(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(204);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/services/1", { method: "DELETE" });
    expect((await DELETE(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});
