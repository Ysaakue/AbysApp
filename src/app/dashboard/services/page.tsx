"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { formatCurrency } from "@/lib/utils";

interface Service {
  id: number;
  name: string;
  description: string | null;
  price: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/services");
    if (res.ok) setServices(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      description: form.get("description") || null,
      price: Number(form.get("price")),
    };
    const url = modal === "edit" ? `/api/services/${selected!.id}` : "/api/services";
    const method = modal === "edit" ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setLoading(false);
    if (res.ok) { setModal(null); load(); }
    else { const d = await res.json(); setError(d.error ?? "Error"); }
  }

  async function handleDelete(s: Service) {
    if (!confirm(`Delete service "${s.name}"?`)) return;
    await fetch(`/api/services/${s.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Services</h1>
        <Button onClick={() => { setModal("create"); setSelected(null); setError(""); }}>+ New Service</Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Description</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Price</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-2 text-gray-500 max-w-xs truncate">{s.description ?? "—"}</td>
                <td className="px-4 py-2 font-medium text-gray-900">{formatCurrency(s.price)}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => { setSelected(s); setModal("edit"); setError(""); }}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(s)}>Delete</Button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No services found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === "create" ? "New Service" : "Edit Service"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" name="name" label="Name" required defaultValue={modal === "edit" ? selected?.name : ""} />
          <Textarea id="description" name="description" label="Description (optional)" rows={3} defaultValue={modal === "edit" ? (selected?.description ?? "") : ""} />
          <Input id="price" name="price" type="number" step="0.01" min="0" label="Price (R$)" required defaultValue={modal === "edit" ? selected?.price : ""} />
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
