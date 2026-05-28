import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";

const schema = z.object({ important: z.boolean() });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { commentId } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const comment = await prisma.comment.update({
    where: { id: Number(commentId) },
    data: { important: parsed.data.important },
    include: { author: { select: { id: true, name: true } } },
  });
  return NextResponse.json(comment);
}
