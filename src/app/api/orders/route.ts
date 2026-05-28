import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";

const createSchema = z.object({
  customerId: z.coerce.number().int(),
  deviceId: z.coerce.number().int(),
  problemDescription: z.string().min(1).max(200),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Number(searchParams.get("pageSize") ?? "10");

  const [orders, total] = await Promise.all([
    prisma.serviceOrder.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        customer: { select: { name: true } },
        device: { select: { brand: true, model: true } },
        status: { select: { name: true, color: true } },
        services: { select: { unitPrice: true, quantity: true } },
        parts: { select: { unitPrice: true, quantity: true } },
      },
    }),
    prisma.serviceOrder.count(),
  ]);

  return NextResponse.json({ orders, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const openStatus = await prisma.orderStatus.findFirst({ where: { name: "Open" } });
  if (!openStatus) return NextResponse.json({ error: "Default status 'Open' not found. Run the seed." }, { status: 500 });

  const order = await prisma.serviceOrder.create({
    data: { ...parsed.data, createdById: Number(session.user!.id), statusId: openStatus.id },
    include: {
      customer: true,
      device: true,
      status: true,
    },
  });
  return NextResponse.json(order, { status: 201 });
}
