"use client";

import { useEffect, useState } from "react";
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
    else { const d = await res.json(); setError(d.error ?? "Error"); }
  }

  async function handleDelete(d: Device) {
    if (!confirm(`Delete device "${d.brand} ${d.model}"?`)) return;
    await fetch(`/api/devices/${d.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Devices</h1>
        <Button onClick={() => { setModal("create"); setSelected(null); setError(""); }}>+ New Device</Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Brand</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Model</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Notes</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {devices.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{d.brand}</td>
                <td className="px-4 py-2 text-gray-700">{d.model}</td>
                <td className="px-4 py-2 text-gray-500 max-w-xs truncate">{d.notes ?? "—"}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => { setSelected(d); setModal("edit"); setError(""); }}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(d)}>Delete</Button>
                </td>
              </tr>
            ))}
            {devices.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No devices found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === "create" ? "New Device" : "Edit Device"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="brand" name="brand" label="Brand" required defaultValue={modal === "edit" ? selected?.brand : ""} />
          <Input id="model" name="model" label="Model" required defaultValue={modal === "edit" ? selected?.model : ""} />
          <Textarea id="notes" name="notes" label="Notes (optional)" rows={3} defaultValue={modal === "edit" ? (selected?.notes ?? "") : ""} />
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
