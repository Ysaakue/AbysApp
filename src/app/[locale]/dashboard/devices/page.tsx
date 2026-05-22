"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface Device {
  id: number;
  brand: string;
  model: string;
  notes: string | null;
}

export default function DevicesPage() {
  const t = useTranslations("devices");
  const tc = useTranslations("common");
  const [devices, setDevices] = useState<Device[]>([]);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Device | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/devices");
    if (res.ok) setDevices(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = {
      brand: form.get("brand"),
      model: form.get("model"),
      notes: form.get("notes") || null,
    };
    const url = modal === "edit" ? `/api/devices/${selected!.id}` : "/api/devices";
    const method = modal === "edit" ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setLoading(false);
    if (res.ok) { setModal(null); load(); }
    else { const d = await res.json(); setError(d.error ?? tc("error")); }
  }

  async function handleDelete(d: Device) {
    if (!confirm(t("confirmDelete", { brand: d.brand, model: d.model }))) return;
    await fetch(`/api/devices/${d.id}`, { method: "DELETE" });
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
              <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colBrand")}</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colModel")}</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colNotes")}</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">{tc("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {devices.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{d.brand}</td>
                <td className="px-4 py-2 text-gray-700">{d.model}</td>
                <td className="px-4 py-2 text-gray-500 max-w-xs truncate">{d.notes ?? "—"}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => { setSelected(d); setModal("edit"); setError(""); }}>{tc("edit")}</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(d)}>{tc("delete")}</Button>
                </td>
              </tr>
            ))}
            {devices.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">{t("empty")}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === "create" ? t("modalCreate") : t("modalEdit")}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="brand" name="brand" label={t("fieldBrand")} required defaultValue={modal === "edit" ? selected?.brand : ""} />
          <Input id="model" name="model" label={t("fieldModel")} required defaultValue={modal === "edit" ? selected?.model : ""} />
          <Textarea id="notes" name="notes" label={t("fieldNotes")} rows={3} defaultValue={modal === "edit" ? (selected?.notes ?? "") : ""} />
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
