/** @jest-environment node */
import { GET } from "@/app/api/orders/[id]/export/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

jest.mock("@react-pdf/renderer", () => ({
  renderToBuffer: jest.fn().mockResolvedValue(Buffer.from("%PDF-1.4 mock")),
  Document: ({ children }: { children: unknown }) => children,
  Page: ({ children }: { children: unknown }) => children,
  View: ({ children }: { children: unknown }) => children,
  Text: ({ children }: { children: unknown }) => children,
  StyleSheet: { create: (s: unknown) => s },
}));

jest.mock("@/lib/pdf/OrderPdf", () => ({
  OrderPdf: () => null,
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    serviceOrder: { findUnique: jest.fn() },
  },
}));

jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
const { auth } = jest.requireMock("@/lib/auth");
const { renderToBuffer } = jest.requireMock("@react-pdf/renderer");

const mockOrder = {
  id: 1,
  problemDescription: "Screen cracked",
  createdAt: "2026-05-28T00:00:00.000Z",
  completedAt: null,
  customer: { name: "John", phone: "123", email: null },
  device: { brand: "Apple", model: "iPhone 14", type: "PHONE" },
  status: { name: "Open" },
  createdBy: { name: "Admin" },
  services: [],
  parts: [],
  comments: [
    { id: 1, text: "Note", important: false, createdAt: "2026-05-28T01:00:00.000Z", author: { name: "Admin" } },
    { id: 2, text: "Important!", important: true, createdAt: "2026-05-28T02:00:00.000Z", author: { name: "Admin" } },
  ],
};

function makeReq(orderId: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return new NextRequest(`http://localhost/api/orders/${orderId}/export${qs ? "?" + qs : ""}`);
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  jest.clearAllMocks();
  auth.mockResolvedValue({ user: { id: "1" } });
  (prisma.serviceOrder.findUnique as jest.Mock).mockResolvedValue(mockOrder);
  renderToBuffer.mockResolvedValue(Buffer.from("%PDF-1.4 mock"));
});

describe("GET /api/orders/[id]/export", () => {
  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const res = await GET(makeReq("1"), makeParams("1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when order not found", async () => {
    (prisma.serviceOrder.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await GET(makeReq("99"), makeParams("99"));
    expect(res.status).toBe(404);
  });

  it("returns 200 with PDF content-type and filename header", async () => {
    const res = await GET(makeReq("1"), makeParams("1"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="OS-1.pdf"');
  });

  it("calls renderToBuffer with includeComments=true when requested", async () => {
    await GET(makeReq("1", { includeComments: "true" }), makeParams("1"));
    expect(renderToBuffer).toHaveBeenCalledWith(
      expect.objectContaining({ props: expect.objectContaining({ includeComments: true }) })
    );
  });

  it("calls renderToBuffer with includeComments=false by default", async () => {
    await GET(makeReq("1"), makeParams("1"));
    expect(renderToBuffer).toHaveBeenCalledWith(
      expect.objectContaining({ props: expect.objectContaining({ includeComments: false }) })
    );
  });

  it("passes pt locale when locale=pt", async () => {
    await GET(makeReq("1", { locale: "pt" }), makeParams("1"));
    expect(renderToBuffer).toHaveBeenCalledWith(
      expect.objectContaining({ props: expect.objectContaining({ locale: "pt" }) })
    );
  });

  it("returns 200 for unknown locale (falls back to en messages)", async () => {
    const res = await GET(makeReq("1", { locale: "xx" }), makeParams("1"));
    expect(res.status).toBe(200);
    expect(renderToBuffer).toHaveBeenCalled();
  });

  it("returns 200 for order with no important comments and includeComments=true", async () => {
    (prisma.serviceOrder.findUnique as jest.Mock).mockResolvedValue({
      ...mockOrder,
      comments: [{ id: 1, text: "Normal", important: false, createdAt: "2026-05-28T01:00:00.000Z", author: { name: "Admin" } }],
    });
    const res = await GET(makeReq("1", { includeComments: "true" }), makeParams("1"));
    expect(res.status).toBe(200);
    expect(renderToBuffer).toHaveBeenCalled();
  });
});
