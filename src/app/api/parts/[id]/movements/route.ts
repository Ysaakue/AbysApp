import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";

const createSchema = z.object({
  type: z.enum(["IN", "OUT"]),
  quantity: z.coerce.number().int().min(1),
  price: z.coerce.number().min(0),
  notes: z.string().max(50).optional().nullable(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Number(searchParams.get("pageSize") ?? "5");

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where: { partId: Number(id) },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.stockMovement.count({
      where: { partId: Number(id) },
    }),
  ]);

  return NextResponse.json({ movements, total, page, pageSize });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const movement = await prisma.stockMovement.create({
    data: { ...parsed.data, partId: Number(id) },
  });
  return NextResponse.json(movement, { status: 201 });
}
