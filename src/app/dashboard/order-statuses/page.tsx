"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

interface OrderStatus {
  id: number;
  name: string;
  color: string | null;
}

export default function OrderStatusesPage() {
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/order-statuses");
    if (res.ok) setStatuses(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      color: form.get("color") || null,
    };
    const url = modal === "edit" ? `/api/order-statuses/${selected!.id}` : "/api/order-statuses";
    const method = modal === "edit" ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setLoading(false);
    if (res.ok) { setModal(null); load(); }
    else { const d = await res.json(); setError(d.error ?? "Error"); }
  }

  async function handleDelete(s: OrderStatus) {
    if (!confirm(`Delete status "${s.name}"?`)) return;
    await fetch(`/api/order-statuses/${s.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Order Statuses</h1>
        <Button onClick={() => { setModal("create"); setSelected(null); setError(""); }}>+ New Status</Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Color</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {statuses.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">
                  <span className="inline-flex items-center gap-2">
                    {s.color && <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: s.color }} />}
                    {s.name}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-500">{s.color ?? "—"}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => { setSelected(s); setModal("edit"); setError(""); }}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(s)}>Delete</Button>
                </td>
              </tr>
            ))}
            {statuses.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">No statuses found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === "create" ? "New Status" : "Edit Status"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" name="name" label="Name" required defaultValue={modal === "edit" ? selected?.name : ""} />
          <div className="space-y-1">
            <label htmlFor="color" className="block text-sm font-medium text-gray-700">Color (hex, e.g. #3B82F6)</label>
            <div className="flex gap-2 items-center">
              <input type="color" name="color-picker" defaultValue={selected?.color ?? "#3B82F6"}
                onChange={(e) => { const inp = document.getElementById("color") as HTMLInputElement; if (inp) inp.value = e.target.value; }}
                className="h-9 w-10 border border-gray-300 rounded cursor-pointer" />
              <input id="color" name="color" type="text" pattern="^#[0-9A-Fa-f]{6}$"
                defaultValue={modal === "edit" ? (selected?.color ?? "") : "#3B82F6"}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
