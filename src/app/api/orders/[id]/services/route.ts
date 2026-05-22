import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";

const addSchema = z.object({
  serviceId: z.coerce.number().int(),
  unitPrice: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(1).default(1),
});

const updateSchema = z.object({
  unitPrice: z.coerce.number().min(0).optional(),
  quantity: z.coerce.number().int().min(1).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const item = await prisma.orderServiceItem.create({
    data: { orderId: Number(id), ...parsed.data },
    include: { service: { select: { id: true, name: true } } },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const item = await prisma.orderServiceItem.update({
    where: { id: Number(itemId) },
    data: parsed.data,
    include: { service: { select: { id: true, name: true } } },
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });

  await prisma.orderServiceItem.delete({ where: { id: Number(itemId) } });
  return new NextResponse(null, { status: 204 });
}
