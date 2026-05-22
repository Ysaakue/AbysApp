"use client";

import { useEffect, useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Pagination } from "@/components/ui/Pagination";
import { formatCurrency } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

interface Order {
  id: number;
  problemDescription: string;
  createdAt: string;
  completedAt: string | null;
  customer: { name: string };
  device: { brand: string; model: string };
  status: { name: string; color: string | null };
  services: { unitPrice: string; quantity: number }[];
  parts: { unitPrice: string; quantity: number }[];
}

interface Customer { id: number; name: string }
interface Device { id: number; brand: string; model: string }
interface OrderStatus { id: number; name: string; color: string | null }

export default function OrdersPage() {
  const t = useTranslations("orders");
  const tc = useTranslations("common");
  const format = useFormatter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal, setModal] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadOrders() {
    const res = await fetch(`/api/orders?page=${page}&pageSize=${pageSize}`);
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders);
      setTotal(data.total);
    }
  }

  async function loadLookups() {
    const [cRes, dRes, sRes] = await Promise.all([
      fetch("/api/customers"),
      fetch("/api/devices"),
      fetch("/api/order-statuses"),
    ]);
    if (cRes.ok) setCustomers(await cRes.json());
    if (dRes.ok) setDevices(await dRes.json());
    if (sRes.ok) setStatuses(await sRes.json());
  }

  useEffect(() => { loadOrders(); }, [page, pageSize]);
  useEffect(() => { loadLookups(); }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = {
      customerId: Number(form.get("customerId")),
      deviceId: Number(form.get("deviceId")),
      statusId: Number(form.get("statusId")),
      problemDescription: form.get("problemDescription"),
    };
    const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setLoading(false);
    if (res.ok) { setModal(false); loadOrders(); }
    else { const d = await res.json(); setError(d.error ?? tc("error")); }
  }

  function calcTotal(o: Order): number {
    const s = o.services.reduce((a, i) => a + Number(i.unitPrice) * i.quantity, 0);
    const p = o.parts.reduce((a, i) => a + Number(i.unitPrice) * i.quantity, 0);
    return s + p;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <Button onClick={() => { setModal(true); setError(""); }}>{t("newBtn")}</Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colId")}</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colCustomer")}</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colDevice")}</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colStatus")}</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colTotal")}</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colCreated")}</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-bold text-blue-600">
                  <Link href={`/dashboard/orders/${o.id}`} className="hover:underline">#{o.id}</Link>
                </td>
                <td className="px-4 py-2 text-gray-900">{o.customer.name}</td>
                <td className="px-4 py-2 text-gray-600">{o.device.brand} {o.device.model}</td>
                <td className="px-4 py-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: o.status.color ?? "#6B7280" }}>
                    {o.status.name}
                  </span>
                </td>
                <td className="px-4 py-2 font-medium">{formatCurrency(calcTotal(o))}</td>
                <td className="px-4 py-2 text-gray-500">
                  {format.dateTime(new Date(o.createdAt), { dateStyle: "short" })}
                </td>
                <td className="px-4 py-2">
                  <Link href={`/dashboard/orders/${o.id}`}>
                    <Button variant="secondary" size="sm">{t("viewBtn")}</Button>
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">{t("empty")}</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-4 py-3">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            pageSizeOptions={[5, 10, 30, 50]}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={t("modalTitle")} size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select id="customerId" name="customerId" label={t("fieldCustomer")} required placeholder={t("selectCustomer")}
            options={customers.map((c) => ({ value: c.id, label: c.name }))} />
          <Select id="deviceId" name="deviceId" label={t("fieldDevice")} required placeholder={t("selectDevice")}
            options={devices.map((d) => ({ value: d.id, label: `${d.brand} ${d.model}` }))} />
          <Select id="statusId" name="statusId" label={t("fieldStatus")} required placeholder={t("selectStatus")}
            options={statuses.map((s) => ({ value: s.id, label: s.name }))} />
          <Textarea id="problemDescription" name="problemDescription" label={t("fieldProblem")} required maxLength={200} rows={3} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>{tc("cancel")}</Button>
            <Button type="submit" disabled={loading}>{loading ? t("creating") : t("createBtn")}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
