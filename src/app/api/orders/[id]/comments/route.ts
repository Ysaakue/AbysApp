import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";

const schema = z.object({ text: z.string().min(1) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const comment = await prisma.comment.create({
    data: {
      orderId: Number(id),
      authorId: Number(session.user!.id),
      text: parsed.data.text,
    },
    include: { author: { select: { id: true, name: true } } },
  });
  return NextResponse.json(comment, { status: 201 });
}
