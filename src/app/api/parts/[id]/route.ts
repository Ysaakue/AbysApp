import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const part = await prisma.part.findUnique({
    where: { id: Number(id) },
    include: {
      movements: { select: { type: true, quantity: true } },
    },
  });
  if (!part) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const stock = part.movements.reduce(
    (acc, m) => acc + (m.type === "IN" ? m.quantity : -m.quantity),
    0
  );
  return NextResponse.json({ ...part, stock });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const part = await prisma.part.update({ where: { id: Number(id) }, data: parsed.data });
  return NextResponse.json(part);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.part.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}
