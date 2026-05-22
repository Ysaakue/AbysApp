/** @jest-environment node */
import { GET as getList, POST as postOrder } from "@/app/api/orders/route";
import { GET as getOrder, PATCH, DELETE } from "@/app/api/orders/[id]/route";
import { POST as postService, PATCH as patchService, DELETE as deleteService } from "@/app/api/orders/[id]/services/route";
import { POST as postPart, PATCH as patchPart, DELETE as deletePart } from "@/app/api/orders/[id]/parts/route";
import { POST as postComment } from "@/app/api/orders/[id]/comments/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const mockSession = { user: { id: "1", name: "Admin" } };
const mockOrder = {
  id: 1, customerId: 1, deviceId: 1, problemDescription: "Cracked screen",
  statusId: 1, createdAt: new Date(), completedAt: null, createdById: 1,
};

jest.mock("@/lib/prisma", () => {
  const mockTx = {
    orderPartItem: { create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    stockMovement: { create: jest.fn(), updateMany: jest.fn(), deleteMany: jest.fn() },
  };
  return {
    prisma: {
      serviceOrder: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
      orderServiceItem: { create: jest.fn(), update: jest.fn(), delete: jest.fn() },
      orderPartItem: { create: jest.fn(), update: jest.fn(), delete: jest.fn() },
      stockMovement: { create: jest.fn(), updateMany: jest.fn(), deleteMany: jest.fn() },
      comment: { create: jest.fn() },
      $transaction: jest.fn((cb) => cb(mockTx)),
    },
    __mockTx: mockTx,
  };
});

jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
const { auth } = jest.requireMock("@/lib/auth");

beforeEach(() => {
  jest.clearAllMocks();
  auth.mockResolvedValue(mockSession);
});

describe("GET /api/orders", () => {
  it("returns paginated orders", async () => {
    (prisma.serviceOrder.findMany as jest.Mock).mockResolvedValue([mockOrder]);
    (prisma.serviceOrder.count as jest.Mock).mockResolvedValue(1);
    const req = new NextRequest("http://localhost/api/orders?page=1&pageSize=10");
    const res = await getList(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.orders).toHaveLength(1);
    expect(data.total).toBe(1);
  });

  it("defaults to page 1 when no params given", async () => {
    (prisma.serviceOrder.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.serviceOrder.count as jest.Mock).mockResolvedValue(0);
    const req = new NextRequest("http://localhost/api/orders");
    const res = await getList(req);
    expect(res.status).toBe(200);
    expect((await res.json()).page).toBe(1);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/orders");
    expect((await getList(req)).status).toBe(401);
  });
});

describe("POST /api/orders", () => {
  it("creates an order with session user as creator", async () => {
    (prisma.serviceOrder.create as jest.Mock).mockResolvedValue(mockOrder);
    const req = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify({ customerId: 1, deviceId: 1, problemDescription: "Cracked screen", statusId: 1 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await postOrder(req);
    expect(res.status).toBe(201);
    expect((prisma.serviceOrder.create as jest.Mock).mock.calls[0][0].data.createdById).toBe(1);
  });

  it("returns 400 when problemDescription exceeds 200 chars", async () => {
    const req = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify({ customerId: 1, deviceId: 1, problemDescription: "x".repeat(201), statusId: 1 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await postOrder(req)).status).toBe(400);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    expect((await postOrder(req)).status).toBe(401);
  });
});

describe("GET /api/orders/[id]", () => {
  it("returns an order", async () => {
    (prisma.serviceOrder.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    const req = new NextRequest("http://localhost/api/orders/1");
    const res = await getOrder(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
  });

  it("returns 404 when order not found", async () => {
    (prisma.serviceOrder.findUnique as jest.Mock).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/orders/99");
    expect((await getOrder(req, { params: Promise.resolve({ id: "99" }) })).status).toBe(404);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/orders/1");
    expect((await getOrder(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});

describe("PATCH /api/orders/[id]", () => {
  it("returns 400 for invalid data", async () => {
    const req = new NextRequest("http://localhost/api/orders/1", {
      method: "PATCH",
      body: JSON.stringify({ problemDescription: "x".repeat(201) }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await PATCH(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(400);
  });

  it("updates order status", async () => {
    (prisma.serviceOrder.update as jest.Mock).mockResolvedValue({ ...mockOrder, statusId: 2 });
    const req = new NextRequest("http://localhost/api/orders/1", {
      method: "PATCH",
      body: JSON.stringify({ statusId: 2 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await PATCH(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(200);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/orders/1", {
      method: "PATCH",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    expect((await PATCH(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});

describe("DELETE /api/orders/[id]", () => {
  it("deletes an order and returns 204", async () => {
    (prisma.serviceOrder.delete as jest.Mock).mockResolvedValue(mockOrder);
    const req = new NextRequest("http://localhost/api/orders/1", { method: "DELETE" });
    expect((await DELETE(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(204);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/orders/1", { method: "DELETE" });
    expect((await DELETE(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});

describe("POST /api/orders/[id]/services", () => {
  it("adds a service item to an order", async () => {
    (prisma.orderServiceItem.create as jest.Mock).mockResolvedValue({ id: 1, orderId: 1, serviceId: 1, unitPrice: "100.00", quantity: 1, service: { id: 1, name: "Repair" } });
    const req = new NextRequest("http://localhost/api/orders/1/services", {
      method: "POST",
      body: JSON.stringify({ serviceId: 1, unitPrice: 100, quantity: 1 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await postService(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(201);
  });

  it("returns 400 for invalid data", async () => {
    const req = new NextRequest("http://localhost/api/orders/1/services", {
      method: "POST",
      body: JSON.stringify({ serviceId: 1, unitPrice: -1 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await postService(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(400);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/orders/1/services", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    expect((await postService(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});

describe("PATCH /api/orders/[id]/services", () => {
  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/orders/1/services?itemId=1", {
      method: "PATCH",
      body: JSON.stringify({ unitPrice: 120 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await patchService(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });

  it("updates a service item price", async () => {
    (prisma.orderServiceItem.update as jest.Mock).mockResolvedValue({ id: 1, unitPrice: "120.00", quantity: 1 });
    const req = new NextRequest("http://localhost/api/orders/1/services?itemId=1", {
      method: "PATCH",
      body: JSON.stringify({ unitPrice: 120 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await patchService(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(200);
  });

  it("returns 400 when itemId is missing", async () => {
    const req = new NextRequest("http://localhost/api/orders/1/services", {
      method: "PATCH",
      body: JSON.stringify({ unitPrice: 120 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await patchService(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(400);
  });

  it("returns 400 for invalid update data", async () => {
    const req = new NextRequest("http://localhost/api/orders/1/services?itemId=1", {
      method: "PATCH",
      body: JSON.stringify({ unitPrice: -5 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await patchService(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(400);
  });
});

describe("DELETE /api/orders/[id]/services", () => {
  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/orders/1/services?itemId=1", { method: "DELETE" });
    expect((await deleteService(req)).status).toBe(401);
  });

  it("removes a service item", async () => {
    (prisma.orderServiceItem.delete as jest.Mock).mockResolvedValue({});
    const req = new NextRequest("http://localhost/api/orders/1/services?itemId=1", { method: "DELETE" });
    expect((await deleteService(req)).status).toBe(204);
  });

  it("returns 400 when itemId is missing", async () => {
    const req = new NextRequest("http://localhost/api/orders/1/services", { method: "DELETE" });
    expect((await deleteService(req)).status).toBe(400);
  });
});

describe("POST /api/orders/[id]/parts", () => {
  it("returns 400 for invalid data", async () => {
    const req = new NextRequest("http://localhost/api/orders/1/parts", {
      method: "POST",
      body: JSON.stringify({ partId: 2, quantity: 0 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await postPart(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(400);
  });

  it("adds a part and creates an OUT stock movement atomically", async () => {
    const { __mockTx } = jest.requireMock("@/lib/prisma");
    __mockTx.orderPartItem.create.mockResolvedValue({ id: 5, orderId: 1, partId: 2, unitPrice: "50.00", quantity: 1, part: { id: 2, name: "Battery" } });
    __mockTx.stockMovement.create.mockResolvedValue({});
    const req = new NextRequest("http://localhost/api/orders/1/parts", {
      method: "POST",
      body: JSON.stringify({ partId: 2, unitPrice: 50, quantity: 1 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await postPart(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(201);
    expect(__mockTx.stockMovement.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: "OUT", orderPartItemId: 5 }) })
    );
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/orders/1/parts", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    expect((await postPart(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});

describe("DELETE /api/orders/[id]/parts", () => {
  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/orders/1/parts?itemId=5", { method: "DELETE" });
    expect((await deletePart(req)).status).toBe(401);
  });

  it("removes a part and deletes the stock movement atomically", async () => {
    const { __mockTx } = jest.requireMock("@/lib/prisma");
    __mockTx.stockMovement.deleteMany.mockResolvedValue({});
    __mockTx.orderPartItem.delete.mockResolvedValue({});
    const req = new NextRequest("http://localhost/api/orders/1/parts?itemId=5", { method: "DELETE" });
    const res = await deletePart(req);
    expect(res.status).toBe(204);
    expect(__mockTx.stockMovement.deleteMany).toHaveBeenCalledWith({ where: { orderPartItemId: 5 } });
  });

  it("returns 400 when itemId is missing", async () => {
    const req = new NextRequest("http://localhost/api/orders/1/parts", { method: "DELETE" });
    expect((await deletePart(req)).status).toBe(400);
  });
});

describe("PATCH /api/orders/[id]/parts", () => {
  it("updates part item and syncs the stock movement", async () => {
    const { __mockTx } = jest.requireMock("@/lib/prisma");
    __mockTx.orderPartItem.update.mockResolvedValue({ id: 5, quantity: 2, unitPrice: "50.00", part: { id: 2, name: "Battery" } });
    __mockTx.stockMovement.updateMany.mockResolvedValue({});
    const req = new NextRequest("http://localhost/api/orders/1/parts?itemId=5", {
      method: "PATCH",
      body: JSON.stringify({ quantity: 2 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await patchPart(req)).status).toBe(200);
    expect(__mockTx.stockMovement.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { orderPartItemId: 5 } })
    );
  });

  it("syncs only unitPrice when quantity is omitted", async () => {
    const { __mockTx } = jest.requireMock("@/lib/prisma");
    __mockTx.orderPartItem.update.mockResolvedValue({ id: 5, quantity: 1, unitPrice: "75.00", part: { id: 2, name: "Battery" } });
    __mockTx.stockMovement.updateMany.mockResolvedValue({});
    const req = new NextRequest("http://localhost/api/orders/1/parts?itemId=5", {
      method: "PATCH",
      body: JSON.stringify({ unitPrice: 75 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await patchPart(req);
    expect(res.status).toBe(200);
    expect(__mockTx.stockMovement.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ quantity: undefined }) })
    );
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/orders/1/parts?itemId=5", {
      method: "PATCH",
      body: JSON.stringify({ quantity: 2 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await patchPart(req)).status).toBe(401);
  });

  it("returns 400 when itemId is missing", async () => {
    const req = new NextRequest("http://localhost/api/orders/1/parts", {
      method: "PATCH",
      body: JSON.stringify({ quantity: 2 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await patchPart(req)).status).toBe(400);
  });

  it("returns 400 for invalid update data", async () => {
    const req = new NextRequest("http://localhost/api/orders/1/parts?itemId=5", {
      method: "PATCH",
      body: JSON.stringify({ quantity: 0 }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await patchPart(req)).status).toBe(400);
  });
});

describe("POST /api/orders/[id]/comments", () => {
  it("adds a comment with session user as author", async () => {
    (prisma.comment.create as jest.Mock).mockResolvedValue({ id: 1, orderId: 1, authorId: 1, text: "Fixed!", createdAt: new Date(), author: { id: 1, name: "Admin" } });
    const req = new NextRequest("http://localhost/api/orders/1/comments", {
      method: "POST",
      body: JSON.stringify({ text: "Fixed!" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await postComment(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(201);
    expect((prisma.comment.create as jest.Mock).mock.calls[0][0].data.authorId).toBe(1);
  });

  it("returns 400 for empty comment text", async () => {
    const req = new NextRequest("http://localhost/api/orders/1/comments", {
      method: "POST",
      body: JSON.stringify({ text: "" }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await postComment(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(400);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/orders/1/comments", {
      method: "POST",
      body: JSON.stringify({ text: "test" }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await postComment(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});
