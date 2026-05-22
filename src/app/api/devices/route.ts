import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";

const schema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const devices = await prisma.device.findMany({ orderBy: [{ brand: "asc" }, { model: "asc" }] });
  return NextResponse.json(devices);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const device = await prisma.device.create({ data: parsed.data });
  return NextResponse.json(device, { status: 201 });
}
