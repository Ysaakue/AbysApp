"use client";

import { useEffect, useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  createdAt: string;
}

export default function CustomersPage() {
  const t = useTranslations("customers");
  const tc = useTranslations("common");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/customers");
    if (res.ok) setCustomers(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      phone: form.get("phone"),
      email: form.get("email") || null,
    };
    const url = modal === "edit" ? `/api/customers/${selected!.id}` : "/api/customers";
    const method = modal === "edit" ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setLoading(false);
    if (res.ok) { setModal(null); load(); }
    else { const d = await res.json(); setError(d.error ?? tc("error")); }
  }

  async function handleDelete(c: Customer) {
    if (!confirm(t("confirmDelete", { name: c.name }))) return;
    await fetch(`/api/customers/${c.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <Button onClick={() => { setModal("create"); setSelected(null); setError(""); }}>{t("newBtn")}</Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colName")}</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colPhone")}</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colEmail")}</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">{tc("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-2 text-gray-600">{c.phone}</td>
                <td className="px-4 py-2 text-gray-500">{c.email ?? "—"}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => { setSelected(c); setModal("edit"); setError(""); }}>{tc("edit")}</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(c)}>{tc("delete")}</Button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">{t("empty")}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === "create" ? t("modalCreate") : t("modalEdit")}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" name="name" label={t("fieldName")} required defaultValue={modal === "edit" ? selected?.name : ""} />
          <Input id="phone" name="phone" label={t("fieldPhone")} required defaultValue={modal === "edit" ? selected?.phone : ""} />
          <Input id="email" name="email" type="email" label={t("fieldEmail")} defaultValue={modal === "edit" ? (selected?.email ?? "") : ""} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>{tc("cancel")}</Button>
            <Button type="submit" disabled={loading}>{loading ? tc("saving") : tc("save")}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
