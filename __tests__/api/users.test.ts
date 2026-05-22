/** @jest-environment node */
import { GET, POST } from "@/app/api/users/route";
import { PATCH, DELETE } from "@/app/api/users/[id]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const mockSession = { user: { id: "1", name: "Admin", email: "admin@test.com" } };
const mockUser = { id: 1, name: "Alice", email: "alice@test.com", active: true, createdAt: new Date() };

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
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

describe("GET /api/users", () => {
  it("returns user list", async () => {
    (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser]);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });
});

describe("POST /api/users", () => {
  it("creates a user and hashes the password", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

    const req = new NextRequest("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ name: "Alice", email: "alice@test.com", password: "secret123" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect((prisma.user.create as jest.Mock).mock.calls[0][0].data.password).not.toBe("secret123");
  });

  it("returns 409 when email already in use", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const req = new NextRequest("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ name: "Alice", email: "alice@test.com", password: "secret123" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(409);
  });

  it("returns 400 for invalid data", async () => {
    const req = new NextRequest("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ name: "", email: "bad", password: "123" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    expect((await POST(req)).status).toBe(401);
  });
});

describe("PATCH /api/users/[id]", () => {
  it("returns 400 for invalid data", async () => {
    const req = new NextRequest("http://localhost/api/users/1", {
      method: "PATCH",
      body: JSON.stringify({ name: "" }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await PATCH(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(400);
  });

  it("updates a user", async () => {
    (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, name: "Updated" });
    const req = new NextRequest("http://localhost/api/users/1", {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    expect((await res.json()).name).toBe("Updated");
  });

  it("hashes password on update", async () => {
    (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
    const req = new NextRequest("http://localhost/api/users/1", {
      method: "PATCH",
      body: JSON.stringify({ password: "newpassword" }),
      headers: { "Content-Type": "application/json" },
    });
    await PATCH(req, { params: Promise.resolve({ id: "1" }) });
    const data = (prisma.user.update as jest.Mock).mock.calls[0][0].data;
    expect(data.password).not.toBe("newpassword");
    expect(data.password).toMatch(/^\$2[aby]\$/);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/users/1", {
      method: "PATCH",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    expect((await PATCH(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});

describe("DELETE /api/users/[id]", () => {
  it("deletes a user and returns 204", async () => {
    (prisma.user.delete as jest.Mock).mockResolvedValue(mockUser);
    const req = new NextRequest("http://localhost/api/users/1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(204);
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/users/1", { method: "DELETE" });
    expect((await DELETE(req, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});
