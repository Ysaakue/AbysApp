/** @jest-environment node */
import { GET, POST } from "@/app/api/devices/route";
import { PATCH, DELETE } from "@/app/api/devices/[id]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const mockSession = { user: { id: "1" } };
const mockDevice = { id: 1, brand: "Apple", model: "iPhone 14", type: null, notes: null };

jest.mock("@/lib/prisma", () => ({
  prisma: {
    device: {
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

describe("GET /api/devices", () => {
  it("returns device list", async () => {
    (prisma.device.findMany as jest.Mock).mockResolvedValue([mockDevice]);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    expect((await GET()).status).toBe(401);
  });
});

describe("POST /api/devices", () => {
  it("creates a device without type", async () => {
    (prisma.device.create as jest.Mock).mockResolvedValue(mockDevice);
    const req = new NextRequest("http://localhost/api/devices", {
      method: "POST",
      body: JSON.stringify({ brand: "Apple", model: "iPhone 14" }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await POST(req)).status).toBe(201);
  });

  it("creates a device with a valid type", async () => {
    (prisma.device.create as jest.Mock).mockResolvedValue({ ...mockDevice, type: "PHONE" });
    const req = new NextRequest("http://localhost/api/devices", {
      method: "POST",
      body: JSON.stringify({ brand: "Apple", model: "iPhone 14", type: "PHONE" }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await POST(req)).status).toBe(201);
  });

  it("returns 400 for invalid type value", async () => {
    const req = new NextRequest("http://localhost/api/devices", {
      method: "POST",
      body: JSON.stringify({ brand: "Apple", model: "iPhone 14", type: "SMARTWATCH" }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("returns 400 when brand is missing", async () => {
    const req = new NextRequest("http://localhost/api/devices", {
      method: "POST",
      body: JSON.stringify({ model: "iPhone 14" }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/devices", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    expect((await POST(req)).status).toBe(401);
  });
});

describe("PATCH /api/devices/[id]", () => {
  it("returns 400 for invalid data", async () => {
    const req = new NextRequest("http://localhost/api/devices/1", {
      method: "PATCH",
      body: JSON.stringify({ brand: "" }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await PATCH(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(400);
  });

  it("updates a device", async () => {
    (prisma.device.update as jest.Mock).mockResolvedValue({ ...mockDevice, model: "iPhone 15" });
    const req = new NextRequest("http://localhost/api/devices/1", {
      method: "PATCH",
      body: JSON.stringify({ model: "iPhone 15" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    expect((await res.json()).model).toBe("iPhone 15");
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/devices/1", {
      method: "PATCH",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    expect((await PATCH(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});

describe("DELETE /api/devices/[id]", () => {
  it("deletes a device and returns 204", async () => {
    (prisma.device.delete as jest.Mock).mockResolvedValue(mockDevice);
    const req = new NextRequest("http://localhost/api/devices/1", { method: "DELETE" });
    expect((await DELETE(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(204);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/devices/1", { method: "DELETE" });
    expect((await DELETE(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});
