import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parts = await prisma.part.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { movements: true } },
      movements: { select: { type: true, quantity: true } },
    },
  });

  const result = parts.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    stock: p.movements.reduce(
      (acc, m) => acc + (m.type === "IN" ? m.quantity : -m.quantity),
      0
    ),
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const part = await prisma.part.create({ data: parsed.data });
  return NextResponse.json(part, { status: 201 });
}
