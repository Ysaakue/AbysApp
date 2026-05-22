import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";

const updateSchema = z.object({
  customerId: z.coerce.number().int().optional(),
  deviceId: z.coerce.number().int().optional(),
  problemDescription: z.string().min(1).max(200).optional(),
  statusId: z.coerce.number().int().optional(),
  completedAt: z.string().datetime().optional().nullable(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.serviceOrder.findUnique({
    where: { id: Number(id) },
    include: {
      customer: true,
      device: true,
      status: true,
      createdBy: { select: { id: true, name: true } },
      services: { include: { service: { select: { id: true, name: true } } } },
      parts: { include: { part: { select: { id: true, name: true } } } },
      comments: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, name: true } } },
      },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const order = await prisma.serviceOrder.update({
    where: { id: Number(id) },
    data: parsed.data,
    include: { customer: true, device: true, status: true },
  });
  return NextResponse.json(order);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.serviceOrder.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}
