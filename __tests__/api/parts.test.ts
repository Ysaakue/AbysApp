/** @jest-environment node */
import { GET as getList, POST as postPart } from "@/app/api/parts/route";
import { GET as getPart, PATCH, DELETE } from "@/app/api/parts/[id]/route";
import { GET as getMovements, POST as postMovement } from "@/app/api/parts/[id]/movements/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const mockSession = { user: { id: "1" } };
const mockPart = { id: 1, name: "Battery", description: null, price: "50.00" };
const mockMovement = { id: 1, partId: 1, type: "IN" as const, quantity: 10, price: "45.00", notes: null, createdAt: new Date(), orderPartItemId: null };

jest.mock("@/lib/prisma", () => ({
  prisma: {
    part: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    stockMovement: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
const { auth } = jest.requireMock("@/lib/auth");

beforeEach(() => {
  jest.clearAllMocks();
  auth.mockResolvedValue(mockSession);
});

describe("GET /api/parts", () => {
  it("returns parts with calculated stock", async () => {
    (prisma.part.findMany as jest.Mock).mockResolvedValue([{
      ...mockPart,
      movements: [
        { type: "IN", quantity: 10 },
        { type: "OUT", quantity: 3 },
      ],
    }]);
    const res = await getList();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data[0].stock).toBe(7);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    expect((await getList()).status).toBe(401);
  });
});

describe("POST /api/parts", () => {
  it("creates a part", async () => {
    (prisma.part.create as jest.Mock).mockResolvedValue(mockPart);
    const req = new NextRequest("http://localhost/api/parts", {
      method: "POST",
      body: JSON.stringify({ name: "Battery", price: 50 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await postPart(req)).status).toBe(201);
  });

  it("returns 400 for invalid data", async () => {
    const req = new NextRequest("http://localhost/api/parts", {
      method: "POST",
      body: JSON.stringify({ price: -5 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await postPart(req)).status).toBe(400);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/parts", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    expect((await postPart(req)).status).toBe(401);
  });
});

describe("GET /api/parts/[id]", () => {
  it("returns a part with stock", async () => {
    (prisma.part.findUnique as jest.Mock).mockResolvedValue({
      ...mockPart,
      movements: [{ type: "IN", quantity: 5 }],
    });
    const req = new NextRequest("http://localhost/api/parts/1");
    const res = await getPart(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    expect((await res.json()).stock).toBe(5);
  });

  it("subtracts OUT movements from stock", async () => {
    (prisma.part.findUnique as jest.Mock).mockResolvedValue({
      ...mockPart,
      movements: [{ type: "IN", quantity: 10 }, { type: "OUT", quantity: 3 }],
    });
    const req = new NextRequest("http://localhost/api/parts/1");
    const res = await getPart(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    expect((await res.json()).stock).toBe(7);
  });

  it("returns 404 when part not found", async () => {
    (prisma.part.findUnique as jest.Mock).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/parts/99");
    expect((await getPart(req, { params: Promise.resolve({ id: "99" }) })).status).toBe(404);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/parts/1");
    expect((await getPart(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});

describe("PATCH /api/parts/[id]", () => {
  it("returns 400 for invalid data", async () => {
    const req = new NextRequest("http://localhost/api/parts/1", {
      method: "PATCH",
      body: JSON.stringify({ price: -5 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await PATCH(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(400);
  });

  it("updates a part", async () => {
    (prisma.part.update as jest.Mock).mockResolvedValue({ ...mockPart, price: "60.00" });
    const req = new NextRequest("http://localhost/api/parts/1", {
      method: "PATCH",
      body: JSON.stringify({ price: 60 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await PATCH(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(200);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/parts/1", {
      method: "PATCH",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    expect((await PATCH(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});

describe("DELETE /api/parts/[id]", () => {
  it("deletes a part and returns 204", async () => {
    (prisma.part.delete as jest.Mock).mockResolvedValue(mockPart);
    const req = new NextRequest("http://localhost/api/parts/1", { method: "DELETE" });
    expect((await DELETE(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(204);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/parts/1", { method: "DELETE" });
    expect((await DELETE(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});

describe("GET /api/parts/[id]/movements", () => {
  it("returns paginated movements", async () => {
    (prisma.stockMovement.findMany as jest.Mock).mockResolvedValue([mockMovement]);
    (prisma.stockMovement.count as jest.Mock).mockResolvedValue(1);
    const req = new NextRequest("http://localhost/api/parts/1/movements?page=1&pageSize=5");
    const res = await getMovements(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.movements).toHaveLength(1);
    expect(data.total).toBe(1);
    expect(data.page).toBe(1);
  });

  it("defaults to page 1 and pageSize 5 when params are absent", async () => {
    (prisma.stockMovement.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.stockMovement.count as jest.Mock).mockResolvedValue(0);
    const req = new NextRequest("http://localhost/api/parts/1/movements");
    const res = await getMovements(req, { params: Promise.resolve({ id: "1" }) });
    const data = await res.json();
    expect(data.page).toBe(1);
    expect(data.pageSize).toBe(5);
  });

  it("clamps page to minimum 1 when 0 is given", async () => {
    (prisma.stockMovement.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.stockMovement.count as jest.Mock).mockResolvedValue(0);
    const req = new NextRequest("http://localhost/api/parts/1/movements?page=0");
    const res = await getMovements(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    expect((await res.json()).page).toBe(1);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/parts/1/movements");
    expect((await getMovements(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});

describe("POST /api/parts/[id]/movements", () => {
  it("creates an IN movement", async () => {
    (prisma.stockMovement.create as jest.Mock).mockResolvedValue(mockMovement);
    const req = new NextRequest("http://localhost/api/parts/1/movements", {
      method: "POST",
      body: JSON.stringify({ type: "IN", quantity: 10, price: 45 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await postMovement(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(201);
  });

  it("returns 400 for invalid movement type", async () => {
    const req = new NextRequest("http://localhost/api/parts/1/movements", {
      method: "POST",
      body: JSON.stringify({ type: "TRANSFER", quantity: 5, price: 10 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await postMovement(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(400);
  });

  it("returns 400 when notes exceed 50 characters", async () => {
    const req = new NextRequest("http://localhost/api/parts/1/movements", {
      method: "POST",
      body: JSON.stringify({ type: "IN", quantity: 5, price: 10, notes: "x".repeat(51) }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await postMovement(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(400);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/parts/1/movements", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    expect((await postMovement(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});
