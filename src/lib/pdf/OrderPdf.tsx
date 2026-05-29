import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

type DeviceType = "PHONE" | "TABLET" | "NOTEBOOK" | "DESKTOP";

interface PdfOrder {
  id: number;
  problemDescription: string;
  createdAt: string;
  completedAt: string | null;
  customer: { name: string; phone: string; email: string | null };
  device: { brand: string; model: string; type: DeviceType | null };
  status: { name: string };
  createdBy: { name: string };
  services: { id: number; unitPrice: string; quantity: number; service: { name: string } }[];
  parts: { id: number; unitPrice: string; quantity: number; part: { name: string } }[];
  comments: { id: number; text: string; important: boolean; createdAt: string; author: { name: string } }[];
}

export interface PdfLabels {
  pdfTitle: string;
  sectionCustomer: string;
  sectionDevice: string;
  sectionProblem: string;
  sectionStatus: string;
  sectionServices: string;
  sectionParts: string;
  sectionComments: string;
  colService: string;
  colPart: string;
  colQty: string;
  colUnitPrice: string;
  colSubtotal: string;
  pdfTotal: string;
  pdfCreatedBy: string;
  pdfCreatedAt: string;
  pdfCompletedAt: string;
  deviceType: string;
  typePHONE: string;
  typeTABLET: string;
  typeNOTEBOOK: string;
  typeDESKTOP: string;
  typeUnknown: string;
}

export interface OrderPdfProps {
  order: PdfOrder;
  includeComments: boolean;
  labels: PdfLabels;
  locale: string;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontSize: 10,
    color: "#1f2937",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#1e40af",
  },
  headerStatus: {
    fontSize: 9,
    color: "#4b5563",
  },
  twoCol: {
    flexDirection: "row",
    marginBottom: 14,
  },
  col: {
    flex: 1,
    marginRight: 12,
  },
  colLast: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 5,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  infoText: {
    color: "#111827",
    marginBottom: 2,
  },
  infoMuted: {
    color: "#6b7280",
    fontSize: 9,
    marginBottom: 2,
  },
  section: {
    marginBottom: 14,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  thName: {
    flex: 3,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#6b7280",
  },
  thNum: {
    width: 40,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#6b7280",
  },
  thAmt: {
    width: 80,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#6b7280",
  },
  tdName: { flex: 3 },
  tdNum: { width: 40, textAlign: "right" },
  tdAmt: { width: 80, textAlign: "right" },
  emptyText: { color: "#9ca3af", fontSize: 9 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 8,
    marginTop: 2,
    borderTopWidth: 2,
    borderTopColor: "#e5e7eb",
    marginBottom: 14,
  },
  totalLabel: {
    fontFamily: "Helvetica-Bold",
    marginRight: 8,
  },
  totalValue: {
    width: 80,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: "#1e40af",
  },
  commentCard: {
    backgroundColor: "#fefce8",
    padding: 8,
    marginBottom: 5,
    borderLeftWidth: 3,
    borderLeftColor: "#fbbf24",
  },
  commentMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  commentAuthor: {
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    fontSize: 9,
  },
  commentDate: {
    color: "#9ca3af",
    fontSize: 9,
  },
  commentText: {
    color: "#4b5563",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#9ca3af",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 5,
  },
});

function fmtCurrency(val: string | number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(val));
}

function fmtDate(dateStr: string, locale: string): string {
  const intlLocale = locale === "pt" ? "pt-BR" : "en-US";
  return new Intl.DateTimeFormat(intlLocale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function deviceTypeLabel(type: DeviceType | null, labels: PdfLabels): string {
  if (!type) return labels.typeUnknown;
  const map: Record<DeviceType, string> = {
    PHONE: labels.typePHONE,
    TABLET: labels.typeTABLET,
    NOTEBOOK: labels.typeNOTEBOOK,
    DESKTOP: labels.typeDESKTOP,
  };
  return map[type];
}

export function OrderPdf({ order, includeComments, labels, locale }: OrderPdfProps) {
  const importantComments = order.comments.filter((c) => c.important);
  const showComments = includeComments && importantComments.length > 0;

  const total = [
    ...order.services.map((s) => Number(s.unitPrice) * s.quantity),
    ...order.parts.map((p) => Number(p.unitPrice) * p.quantity),
  ].reduce((a, b) => a + b, 0);

  return (
    <Document title={`${labels.pdfTitle} #${order.id}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{labels.pdfTitle} #{order.id}</Text>
          <Text style={styles.headerStatus}>{order.status.name}</Text>
        </View>

        {/* Customer + Device */}
        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>{labels.sectionCustomer}</Text>
            <Text style={styles.infoText}>{order.customer.name}</Text>
            <Text style={styles.infoMuted}>{order.customer.phone}</Text>
            {order.customer.email ? <Text style={styles.infoMuted}>{order.customer.email}</Text> : null}
          </View>
          <View style={styles.colLast}>
            <Text style={styles.sectionTitle}>{labels.sectionDevice}</Text>
            <Text style={styles.infoText}>{order.device.brand} {order.device.model}</Text>
            <Text style={styles.infoMuted}>{labels.deviceType}: {deviceTypeLabel(order.device.type, labels)}</Text>
          </View>
        </View>

        {/* Problem */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.sectionProblem}</Text>
          <Text>{order.problemDescription}</Text>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.sectionServices}</Text>
          {order.services.length > 0 ? (
            <View>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.thName}>{labels.colService}</Text>
                <Text style={styles.thNum}>{labels.colQty}</Text>
                <Text style={styles.thAmt}>{labels.colUnitPrice}</Text>
                <Text style={styles.thAmt}>{labels.colSubtotal}</Text>
              </View>
              {order.services.map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={styles.tdName}>{item.service.name}</Text>
                  <Text style={styles.tdNum}>{item.quantity}</Text>
                  <Text style={styles.tdAmt}>{fmtCurrency(item.unitPrice)}</Text>
                  <Text style={styles.tdAmt}>{fmtCurrency(Number(item.unitPrice) * item.quantity)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>—</Text>
          )}
        </View>

        {/* Parts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.sectionParts}</Text>
          {order.parts.length > 0 ? (
            <View>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.thName}>{labels.colPart}</Text>
                <Text style={styles.thNum}>{labels.colQty}</Text>
                <Text style={styles.thAmt}>{labels.colUnitPrice}</Text>
                <Text style={styles.thAmt}>{labels.colSubtotal}</Text>
              </View>
              {order.parts.map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={styles.tdName}>{item.part.name}</Text>
                  <Text style={styles.tdNum}>{item.quantity}</Text>
                  <Text style={styles.tdAmt}>{fmtCurrency(item.unitPrice)}</Text>
                  <Text style={styles.tdAmt}>{fmtCurrency(Number(item.unitPrice) * item.quantity)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>—</Text>
          )}
        </View>

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{labels.pdfTotal}</Text>
          <Text style={styles.totalValue}>{fmtCurrency(total)}</Text>
        </View>

        {/* Important Comments (conditional) */}
        {showComments ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.sectionComments}</Text>
            {importantComments.map((c) => (
              <View key={c.id} style={styles.commentCard}>
                <View style={styles.commentMeta}>
                  <Text style={styles.commentAuthor}>{c.author.name}</Text>
                  <Text style={styles.commentDate}>{fmtDate(c.createdAt, locale)}</Text>
                </View>
                <Text style={styles.commentText}>{c.text}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>{labels.pdfCreatedAt}: {fmtDate(order.createdAt, locale)} — {labels.pdfCreatedBy}: {order.createdBy.name}</Text>
          {order.completedAt ? (
            <Text>{labels.pdfCompletedAt}: {fmtDate(order.completedAt, locale)}</Text>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
