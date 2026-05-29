import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { OrderPdf, type PdfLabels } from "@/lib/pdf/OrderPdf";
import { loadMessages } from "@/lib/pdfMessages";
import React from "react";

const orderInclude = {
  customer: { select: { name: true, phone: true, email: true } },
  device: { select: { brand: true, model: true, type: true } },
  status: { select: { name: true } },
  createdBy: { select: { name: true } },
  services: { include: { service: { select: { name: true } } } },
  parts: { include: { part: { select: { name: true } } } },
  comments: {
    orderBy: { createdAt: "desc" as const },
    include: { author: { select: { name: true } } },
  },
};

function buildLabels(messages: Record<string, Record<string, string>>): PdfLabels {
  const od = messages.orderDetail;
  const dv = messages.devices;
  return {
    pdfTitle: od.pdfTitle,
    sectionCustomer: od.sectionCustomer,
    sectionDevice: od.sectionDevice,
    sectionProblem: od.sectionProblem,
    sectionStatus: od.sectionStatus,
    sectionServices: od.sectionServices,
    sectionParts: od.sectionParts,
    sectionComments: od.sectionComments,
    colService: od.colService,
    colPart: od.colPart,
    colQty: od.colQty,
    colUnitPrice: od.colUnitPrice,
    colSubtotal: od.colSubtotal,
    pdfTotal: od.pdfTotal,
    pdfCreatedBy: od.pdfCreatedBy,
    pdfCreatedAt: od.pdfCreatedAt,
    pdfCompletedAt: od.pdfCompletedAt,
    deviceType: dv.colType,
    typePHONE: dv.typePHONE,
    typeTABLET: dv.typeTABLET,
    typeNOTEBOOK: dv.typeNOTEBOOK,
    typeDESKTOP: dv.typeDESKTOP,
    typeUnknown: dv.typeUnknown,
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const url = new URL(req.url);
  const includeComments = url.searchParams.get("includeComments") === "true";
  const locale = url.searchParams.get("locale") ?? "en";

  const order = await prisma.serviceOrder.findUnique({
    where: { id: Number(id) },
    include: orderInclude,
  });
  if (!order) return new Response("Not found", { status: 404 });

  const messages = await loadMessages(locale);
  const labels = buildLabels(messages as Record<string, Record<string, string>>);

  const buffer = await renderToBuffer(
    React.createElement(OrderPdf, { order, includeComments, labels, locale })
  );

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="OS-${id}.pdf"`,
    },
  });
}
