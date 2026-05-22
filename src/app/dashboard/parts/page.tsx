"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Pagination } from "@/components/ui/Pagination";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface Part {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
}

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Part | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/parts");
    if (res.ok) setParts(await res.json());
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
    const url = modal === "edit" ? `/api/parts/${selected!.id}` : "/api/parts";
    const method = modal === "edit" ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setLoading(false);
    if (res.ok) { setModal(null); load(); }
    else { const d = await res.json(); setError(d.error ?? "Error"); }
  }

  async function handleDelete(p: Part) {
    if (!confirm(`Delete part "${p.name}"?`)) return;
    await fetch(`/api/parts/${p.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Parts</h1>
        <Button onClick={() => { setModal("create"); setSelected(null); setError(""); }}>+ New Part</Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Description</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Price</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Stock</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {parts.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-2 text-gray-500 max-w-xs truncate">{p.description ?? "—"}</td>
                <td className="px-4 py-2 font-medium">{formatCurrency(p.price)}</td>
                <td className="px-4 py-2">
                  <span className={`font-semibold ${p.stock > 0 ? "text-green-600" : "text-red-500"}`}>{p.stock}</span>
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <Link href={`/dashboard/parts/${p.id}/stock`}>
                    <Button variant="ghost" size="sm">Stock</Button>
                  </Link>
                  <Button variant="secondary" size="sm" onClick={() => { setSelected(p); setModal("edit"); setError(""); }}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(p)}>Delete</Button>
                </td>
              </tr>
            ))}
            {parts.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No parts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === "create" ? "New Part" : "Edit Part"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" name="name" label="Name" required defaultValue={modal === "edit" ? selected?.name : ""} />
          <Textarea id="description" name="description" label="Description (optional)" rows={2} defaultValue={modal === "edit" ? (selected?.description ?? "") : ""} />
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
