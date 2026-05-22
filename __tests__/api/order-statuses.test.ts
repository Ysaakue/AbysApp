/** @jest-environment node */
import { GET, POST } from "@/app/api/order-statuses/route";
import { PATCH, DELETE } from "@/app/api/order-statuses/[id]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const mockSession = { user: { id: "1" } };
const mockStatus = { id: 1, name: "Open", color: "#3B82F6" };

jest.mock("@/lib/prisma", () => ({
  prisma: {
    orderStatus: {
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

describe("GET /api/order-statuses", () => {
  it("returns status list", async () => {
    (prisma.orderStatus.findMany as jest.Mock).mockResolvedValue([mockStatus]);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    expect((await GET()).status).toBe(401);
  });
});

describe("POST /api/order-statuses", () => {
  it("creates a status", async () => {
    (prisma.orderStatus.create as jest.Mock).mockResolvedValue(mockStatus);
    const req = new NextRequest("http://localhost/api/order-statuses", {
      method: "POST",
      body: JSON.stringify({ name: "Open", color: "#3B82F6" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("accepts status without color", async () => {
    (prisma.orderStatus.create as jest.Mock).mockResolvedValue({ ...mockStatus, color: null });
    const req = new NextRequest("http://localhost/api/order-statuses", {
      method: "POST",
      body: JSON.stringify({ name: "Open" }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await POST(req)).status).toBe(201);
  });

  it("returns 400 for invalid hex color", async () => {
    const req = new NextRequest("http://localhost/api/order-statuses", {
      method: "POST",
      body: JSON.stringify({ name: "Open", color: "red" }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/order-statuses", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    expect((await POST(req)).status).toBe(401);
  });
});

describe("PATCH /api/order-statuses/[id]", () => {
  it("returns 400 for invalid color", async () => {
    const req = new NextRequest("http://localhost/api/order-statuses/1", {
      method: "PATCH",
      body: JSON.stringify({ color: "not-a-hex" }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await PATCH(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(400);
  });

  it("updates a status", async () => {
    (prisma.orderStatus.update as jest.Mock).mockResolvedValue({ ...mockStatus, name: "Closed" });
    const req = new NextRequest("http://localhost/api/order-statuses/1", {
      method: "PATCH",
      body: JSON.stringify({ name: "Closed" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/order-statuses/1", {
      method: "PATCH",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    expect((await PATCH(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});

describe("DELETE /api/order-statuses/[id]", () => {
  it("deletes a status and returns 204", async () => {
    (prisma.orderStatus.delete as jest.Mock).mockResolvedValue(mockStatus);
    const req = new NextRequest("http://localhost/api/order-statuses/1", { method: "DELETE" });
    expect((await DELETE(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(204);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/order-statuses/1", { method: "DELETE" });
    expect((await DELETE(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});
