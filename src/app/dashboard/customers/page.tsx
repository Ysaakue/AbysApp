"use client";

import { useEffect, useState } from "react";
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
    else { const d = await res.json(); setError(d.error ?? "Error"); }
  }

  async function handleDelete(c: Customer) {
    if (!confirm(`Delete customer "${c.name}"?`)) return;
    await fetch(`/api/customers/${c.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        <Button onClick={() => { setModal("create"); setSelected(null); setError(""); }}>+ New Customer</Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Phone</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Email</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-2 text-gray-600">{c.phone}</td>
                <td className="px-4 py-2 text-gray-500">{c.email ?? "—"}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => { setSelected(c); setModal("edit"); setError(""); }}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(c)}>Delete</Button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === "create" ? "New Customer" : "Edit Customer"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" name="name" label="Name" required defaultValue={modal === "edit" ? selected?.name : ""} />
          <Input id="phone" name="phone" label="Phone" required defaultValue={modal === "edit" ? selected?.phone : ""} />
          <Input id="email" name="email" type="email" label="Email (optional)" defaultValue={modal === "edit" ? (selected?.email ?? "") : ""} />
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
