import React from "react";
import { Document, Page, View, Text, StyleSheet, Svg, G, Path } from "@react-pdf/renderer";

const STORE_NAME = "ABYS Assistência Técnica";

function AbysPdfLogo({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 2001 2001">
      <G transform="translate(0,2001) scale(0.1,-0.1)" fill="#2563eb">
        <Path d="M9600 17839 c-961 -68 -1859 -396 -2579 -940 -351 -264 -690 -605
-941 -943 -575 -776 -902 -1710 -939 -2679 -32 -838 139 -1642 508 -2384 54
-107 92 -197 87 -199 -22 -7 -323 -55 -746 -119 -239 -36 -538 -83 -665 -105
-1050 -186 -1671 -443 -2101 -874 -345 -344 -570 -808 -651 -1336 -21 -142
-24 -500 -5 -635 81 -565 312 -1035 697 -1420 122 -122 285 -255 418 -338 249
-158 558 -253 930 -286 54 -4 100 -10 102 -13 3 -3 -10 -38 -29 -79 -163 -354
-202 -896 -100 -1359 105 -470 338 -896 682 -1243 202 -205 392 -342 647 -468
346 -170 676 -242 1115 -243 225 -1 268 5 466 69 398 129 871 419 1388 849
552 459 1344 1265 1921 1955 80 95 115 120 182 127 80 9 119 -19 267 -191
1293 -1505 2392 -2440 3194 -2719 136 -47 235 -65 437 -77 453 -26 820 41
1190 220 658 317 1161 949 1335 1676 51 213 64 329 64 570 1 302 -25 463 -120
763 -24 78 -42 147 -39 152 3 6 26 10 50 10 64 0 264 28 375 51 296 65 550
190 818 406 386 310 686 774 813 1257 63 240 74 336 74 631 0 236 -3 286 -23
395 -48 265 -109 454 -222 685 -323 658 -849 1045 -1765 1300 -332 92 -701
163 -1345 259 -401 60 -823 127 -828 131 -2 2 33 75 77 164 396 790 577 1670
521 2526 -44 656 -203 1256 -485 1830 -369 750 -906 1367 -1588 1824 -699 469
-1519 742 -2402 801 -174 11 -618 11 -785 -1z m940 -1189 c553 -73 1014 -230
1453 -494 844 -509 1443 -1375 1641 -2376 51 -257 61 -373 61 -705 0 -341 -10
-451 -66 -730 -98 -481 -268 -888 -563 -1344 -76 -118 -160 -257 -186 -308
-155 -300 -142 -511 43 -709 121 -130 265 -212 517 -294 270 -89 555 -146
1290 -256 829 -123 1140 -183 1490 -286 222 -65 445 -164 590 -261 203 -137
361 -374 436 -655 36 -134 45 -375 19 -519 -58 -324 -232 -608 -490 -800 -93
-70 -173 -108 -276 -133 -425 -101 -1132 -24 -2609 285 -593 124 -644 134
-647 131 -2 -1 34 -35 80 -76 321 -285 1005 -963 1316 -1305 411 -452 593
-702 635 -875 69 -286 31 -602 -109 -897 -130 -275 -358 -509 -593 -608 -125
-53 -203 -69 -332 -69 -102 0 -123 3 -190 28 -374 142 -966 585 -1780 1332
-716 659 -1562 1540 -1910 1989 -112 145 -247 293 -283 312 -39 20 -102 22
-143 5 -50 -21 -199 -199 -443 -531 -626 -848 -1116 -1430 -1617 -1921 -488
-477 -891 -780 -1309 -986 -286 -140 -528 -209 -775 -221 -252 -12 -456 63
-663 242 -213 184 -391 508 -443 805 -20 118 -14 362 11 455 24 88 95 228 168
328 205 283 860 1006 1278 1411 80 78 154 157 164 176 23 43 24 124 2 165 -17
33 -61 77 -94 94 -40 20 -112 11 -456 -58 -934 -189 -1504 -262 -1932 -248
-284 10 -413 44 -566 148 -88 59 -221 189 -291 284 -71 94 -169 291 -198 395
-84 305 -60 615 70 887 142 299 324 457 702 609 329 132 786 230 1703 364
1192 175 1570 287 1822 539 187 187 212 402 77 681 -54 113 -84 163 -225 381
-140 214 -224 369 -309 565 -152 355 -246 714 -291 1114 -17 149 -17 581 0
730 95 849 434 1582 1001 2164 609 625 1392 985 2320 1065 58 5 247 8 420 6
254 -2 347 -7 480 -25z" />
        <Path d="M8847 14581 c-118 -48 -225 -170 -322 -366 -258 -524 -331 -1245
-195 -1925 98 -489 297 -875 512 -991 56 -30 72 -34 138 -34 62 0 85 5 132 28
115 56 232 208 330 429 65 146 72 204 33 283 -16 34 -42 67 -64 83 -21 15
-140 70 -264 122 -125 52 -227 97 -227 100 0 3 84 41 188 84 340 143 395 178
474 300 59 92 78 166 78 310 0 363 -102 836 -245 1143 -160 342 -380 510 -568
434z" />
        <Path d="M11080 14591 c-179 -59 -335 -282 -460 -660 -156 -470 -190 -1003
-100 -1541 92 -543 303 -972 540 -1096 46 -24 67 -29 130 -29 62 0 85 5 132
28 111 55 233 212 331 430 46 100 51 120 52 182 0 59 -4 77 -28 118 -15 26
-45 58 -65 71 -20 13 -137 66 -259 117 -123 52 -223 96 -223 99 0 3 89 43 198
89 286 122 327 144 397 215 136 137 165 267 134 596 -60 648 -303 1223 -573
1355 -59 29 -159 42 -206 26z" />
      </G>
    </Svg>
  );
}

type DeviceType = "PHONE" | "TABLET" | "NOTEBOOK" | "DESKTOP";

interface PdfOrder {
  id: number;
  problemDescription: string;
  createdAt: Date | string;
  completedAt: Date | string | null;
  customer: { name: string; phone: string; email: string | null };
  device: { brand: string; model: string; type: DeviceType | null };
  status: { name: string };
  createdBy: { name: string };
  services: { id: number; unitPrice: string; quantity: number; service: { name: string } }[];
  parts: { id: number; unitPrice: string; quantity: number; part: { name: string } }[];
  comments: { id: number; text: string; important: boolean; createdAt: Date | string; author: { name: string } }[];
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
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  brandName: {
    marginLeft: 6,
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
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

function fmtDate(dateStr: Date | string, locale: string): string {
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
        {/* Brand */}
        <View style={styles.brandRow}>
          <AbysPdfLogo />
          <Text style={styles.brandName}>{STORE_NAME}</Text>
        </View>

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
