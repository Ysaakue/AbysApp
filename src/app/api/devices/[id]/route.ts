import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";

const schema = z.object({
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  type: z.enum(["PHONE", "TABLET", "NOTEBOOK", "DESKTOP"]).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const device = await prisma.device.update({ where: { id: Number(id) }, data: parsed.data });
  return NextResponse.json(device);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.device.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}
