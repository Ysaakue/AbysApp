"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useFormatter } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Combobox } from "@/components/ui/Combobox";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { calculateOrderTotal, formatCurrency } from "@/lib/utils";

interface ServiceItem { id: number; unitPrice: string; quantity: number; service: { id: number; name: string } }
interface PartItem { id: number; unitPrice: string; quantity: number; part: { id: number; name: string } }
interface Comment { id: number; text: string; important: boolean; createdAt: string; author: { id: number; name: string } }

interface Order {
  id: number;
  problemDescription: string;
  createdAt: string;
  completedAt: string | null;
  customer: { id: number; name: string; phone: string; email: string | null };
  device: { id: number; brand: string; model: string; notes: string | null };
  status: { id: number; name: string; color: string | null };
  createdBy: { id: number; name: string };
  services: ServiceItem[];
  parts: PartItem[];
  comments: Comment[];
}

interface ServiceCatalog { id: number; name: string; price: string }
interface PartCatalog { id: number; name: string; price: string }
interface OrderStatus { id: number; name: string }

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("orderDetail");
  const tc = useTranslations("common");
  const format = useFormatter();
  const [order, setOrder] = useState<Order | null>(null);
  const [services, setServices] = useState<ServiceCatalog[]>([]);
  const [parts, setParts] = useState<PartCatalog[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [commentText, setCommentText] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [addServiceModal, setAddServiceModal] = useState(false);
  const [addPartModal, setAddPartModal] = useState(false);
  const [editItem, setEditItem] = useState<{ type: "service" | "part"; item: ServiceItem | PartItem } | null>(null);

  const loadOrder = useCallback(async () => {
    const res = await fetch(`/api/orders/${id}`);
    if (res.ok) setOrder(await res.json());
    else router.push("/dashboard/orders");
  }, [id, router]);

  useEffect(() => {
    loadOrder();
    Promise.all([fetch("/api/services"), fetch("/api/parts"), fetch("/api/order-statuses")]).then(
      async ([sr, pr, str]) => {
        if (sr.ok) setServices(await sr.json());
        if (pr.ok) setParts(await pr.json());
        if (str.ok) setStatuses(await str.json());
      }
    );
  }, [loadOrder]);

  async function updateStatus(statusId: string) {
    await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statusId: Number(statusId) }) });
    loadOrder();
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSavingComment(true);
    await fetch(`/api/orders/${id}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: commentText }) });
    setSavingComment(false);
    setCommentText("");
    loadOrder();
  }

  async function addService(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const svcId = Number(form.get("serviceId"));
    await fetch(`/api/orders/${id}/services`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId: svcId, unitPrice: Number(form.get("unitPrice")), quantity: Number(form.get("quantity")) }),
    });
    setAddServiceModal(false);
    loadOrder();
  }

  async function addPart(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await fetch(`/api/orders/${id}/parts`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partId: Number(form.get("partId")), unitPrice: Number(form.get("unitPrice")), quantity: Number(form.get("quantity")) }),
    });
    setAddPartModal(false);
    loadOrder();
  }

  async function saveEditItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editItem) return;
    const form = new FormData(e.currentTarget);
    const endpoint = editItem.type === "service" ? `/api/orders/${id}/services` : `/api/orders/${id}/parts`;
    await fetch(`${endpoint}?itemId=${editItem.item.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitPrice: Number(form.get("unitPrice")), quantity: Number(form.get("quantity")) }),
    });
    setEditItem(null);
    loadOrder();
  }

  async function toggleImportant(comment: Comment) {
    const next = !comment.important;
    setOrder((prev) => prev ? {
      ...prev,
      comments: prev.comments.map((c) => c.id === comment.id ? { ...c, important: next } : c),
    } : prev);
    await fetch(`/api/orders/${id}/comments/${comment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ important: next }),
    });
  }

  async function removeItem(type: "service" | "part", itemId: number) {
    if (!confirm(t("removeConfirm"))) return;
    const endpoint = type === "service" ? `/api/orders/${id}/services` : `/api/orders/${id}/parts`;
    await fetch(`${endpoint}?itemId=${itemId}`, { method: "DELETE" });
    loadOrder();
  }

  if (!order) return <div className="text-gray-500 py-8">{tc("loading")}</div>;

  const total = calculateOrderTotal(
    order.services.map((s) => ({ unitPrice: s.unitPrice, quantity: s.quantity })),
    order.parts.map((p) => ({ unitPrice: p.unitPrice, quantity: p.quantity }))
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>{tc("back")}</Button>
        <h1 className="text-2xl font-semibold text-gray-900">{t("title", { id: order.id })}</h1>
        <span className="text-xs font-semibold px-2 py-1 rounded-full text-white"
          style={{ backgroundColor: order.status.color ?? "#6B7280" }}>
          {order.status.name}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4 space-y-2">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{t("sectionCustomer")}</h2>
          <p className="font-medium text-gray-900">{order.customer.name}</p>
          <p className="text-sm text-gray-500">{order.customer.phone}</p>
          {order.customer.email && <p className="text-sm text-gray-500">{order.customer.email}</p>}
        </div>
        <div className="bg-white rounded-lg shadow p-4 space-y-2">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{t("sectionDevice")}</h2>
          <p className="font-medium text-gray-900">{order.device.brand} {order.device.model}</p>
          {order.device.notes && <p className="text-sm text-gray-500">{order.device.notes}</p>}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-2">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{t("sectionProblem")}</h2>
        <p className="text-gray-800">{order.problemDescription}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-3">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{t("sectionStatus")}</h2>
        <Combobox
          value={order.status.id}
          onValueChange={(value) => updateStatus(value)}
          options={statuses.map((s) => ({ value: s.id, label: s.name }))}
          className="max-w-xs"
        />
        <div className="text-xs text-gray-400">
          {t("createdBy", { date: format.dateTime(new Date(order.createdAt), { dateStyle: "short", timeStyle: "short" }), name: order.createdBy.name })}
          {order.completedAt && " " + t("completedAt", { date: format.dateTime(new Date(order.completedAt), { dateStyle: "short", timeStyle: "short" }) })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{t("sectionServices")}</h2>
          <Button size="sm" onClick={() => setAddServiceModal(true)}>{t("addBtn")}</Button>
        </div>
        {order.services.length > 0 ? (
          <table className="min-w-full text-sm divide-y divide-gray-100">
            <thead><tr>
              <th className="text-left py-1 text-gray-500 font-medium">{t("colService")}</th>
              <th className="text-right py-1 text-gray-500 font-medium">{t("colQty")}</th>
              <th className="text-right py-1 text-gray-500 font-medium">{t("colUnitPrice")}</th>
              <th className="text-right py-1 text-gray-500 font-medium">{t("colSubtotal")}</th>
              <th className="py-1"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {order.services.map((s) => (
                <tr key={s.id}>
                  <td className="py-1.5 text-gray-900">{s.service.name}</td>
                  <td className="text-right py-1.5">{s.quantity}</td>
                  <td className="text-right py-1.5">{formatCurrency(s.unitPrice)}</td>
                  <td className="text-right py-1.5 font-medium">{formatCurrency(Number(s.unitPrice) * s.quantity)}</td>
                  <td className="py-1.5 pl-3 flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditItem({ type: "service", item: s })}>✏️</Button>
                    <Button variant="ghost" size="sm" onClick={() => removeItem("service", s.id)}>🗑</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-sm text-gray-400">{t("noServices")}</p>}
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{t("sectionParts")}</h2>
          <Button size="sm" onClick={() => setAddPartModal(true)}>{t("addBtn")}</Button>
        </div>
        {order.parts.length > 0 ? (
          <table className="min-w-full text-sm divide-y divide-gray-100">
            <thead><tr>
              <th className="text-left py-1 text-gray-500 font-medium">{t("colPart")}</th>
              <th className="text-right py-1 text-gray-500 font-medium">{t("colQty")}</th>
              <th className="text-right py-1 text-gray-500 font-medium">{t("colUnitPrice")}</th>
              <th className="text-right py-1 text-gray-500 font-medium">{t("colSubtotal")}</th>
              <th className="py-1"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {order.parts.map((p) => (
                <tr key={p.id}>
                  <td className="py-1.5 text-gray-900">{p.part.name}</td>
                  <td className="text-right py-1.5">{p.quantity}</td>
                  <td className="text-right py-1.5">{formatCurrency(p.unitPrice)}</td>
                  <td className="text-right py-1.5 font-medium">{formatCurrency(Number(p.unitPrice) * p.quantity)}</td>
                  <td className="py-1.5 pl-3 flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditItem({ type: "part", item: p })}>✏️</Button>
                    <Button variant="ghost" size="sm" onClick={() => removeItem("part", p.id)}>🗑</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-sm text-gray-400">{t("noParts")}</p>}
        <div className="text-right font-bold text-lg text-gray-900 pt-2 border-t">
          {t("total", { amount: formatCurrency(total) })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-3">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{t("sectionComments")}</h2>
        <form onSubmit={submitComment} className="flex gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t("commentPlaceholder")}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" disabled={savingComment || !commentText.trim()}>
            {savingComment ? "..." : t("postBtn")}
          </Button>
        </form>
        <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
          {order.comments.length === 0 && <p className="text-sm text-gray-400">{t("noComments")}</p>}
          {order.comments.map((c) => (
            <div key={c.id} className={`rounded-md p-3 text-sm ${c.important ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50"}`}>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span className="flex items-center gap-1">
                  {c.important && <span className="text-yellow-500" aria-hidden>★</span>}
                  <span className="font-medium text-gray-600">{c.author.name}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span>{format.dateTime(new Date(c.createdAt), { dateStyle: "short", timeStyle: "short" })}</span>
                  <button
                    type="button"
                    onClick={() => toggleImportant(c)}
                    title={c.important ? t("unmarkImportant") : t("markImportant")}
                    className={`text-base leading-none transition-colors ${c.important ? "text-yellow-400 hover:text-gray-400" : "text-gray-300 hover:text-yellow-400"}`}
                  >
                    ★
                  </button>
                </div>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{c.text}</p>
            </div>
          ))}
        </div>
      </div>

      <Modal open={addServiceModal} onClose={() => setAddServiceModal(false)} title={t("addServiceTitle")}>
        <form onSubmit={addService} className="space-y-4">
          <Combobox id="serviceId" name="serviceId" label={t("colService")} required placeholder={t("selectService")}
            options={services.map((s) => ({ value: s.id, label: s.name }))}
            onValueChange={(value) => { const svc = services.find((s) => s.id === Number(value)); if (svc) { const inp = document.getElementById("svc-price") as HTMLInputElement; if (inp) inp.value = svc.price; } }} />
          <Input id="svc-price" name="unitPrice" type="number" step="0.01" min="0" label={t("fieldUnitPrice")} required />
          <Input id="svc-qty" name="quantity" type="number" min="1" label={t("fieldQty")} required defaultValue="1" />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setAddServiceModal(false)}>{tc("cancel")}</Button>
            <Button type="submit">{tc("add")}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={addPartModal} onClose={() => setAddPartModal(false)} title={t("addPartTitle")}>
        <form onSubmit={addPart} className="space-y-4">
          <Combobox id="partId" name="partId" label={t("colPart")} required placeholder={t("selectPart")}
            options={parts.map((p) => ({ value: p.id, label: p.name }))}
            onValueChange={(value) => { const prt = parts.find((p) => p.id === Number(value)); if (prt) { const inp = document.getElementById("prt-price") as HTMLInputElement; if (inp) inp.value = prt.price; } }} />
          <Input id="prt-price" name="unitPrice" type="number" step="0.01" min="0" label={t("fieldUnitPrice")} required />
          <Input id="prt-qty" name="quantity" type="number" min="1" label={t("fieldQty")} required defaultValue="1" />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setAddPartModal(false)}>{tc("cancel")}</Button>
            <Button type="submit">{tc("add")}</Button>
          </div>
        </form>
      </Modal>

      {editItem && (
        <Modal open={!!editItem} onClose={() => setEditItem(null)} title={t("editItemTitle")}>
          <form onSubmit={saveEditItem} className="space-y-4">
            <p className="text-sm text-gray-600 font-medium">
              {editItem.type === "service" ? (editItem.item as ServiceItem).service.name : (editItem.item as PartItem).part.name}
            </p>
            <Input name="unitPrice" type="number" step="0.01" min="0" label={t("fieldUnitPrice")} required defaultValue={editItem.item.unitPrice} />
            <Input name="quantity" type="number" min="1" label={t("fieldQty")} required defaultValue={String(editItem.item.quantity)} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditItem(null)}>{tc("cancel")}</Button>
              <Button type="submit">{tc("save")}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
