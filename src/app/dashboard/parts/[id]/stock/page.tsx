"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { formatCurrency } from "@/lib/utils";

interface Movement {
  id: number;
  type: "IN" | "OUT";
  quantity: number;
  price: string;
  notes: string | null;
  createdAt: string;
}

interface Part {
  id: number;
  name: string;
  stock: number;
}

export default function StockPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [part, setPart] = useState<Part | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadPart = useCallback(async () => {
    const res = await fetch(`/api/parts/${id}`);
    if (res.ok) setPart(await res.json());
  }, [id]);

  const loadMovements = useCallback(async () => {
    const res = await fetch(`/api/parts/${id}/movements?page=${page}&pageSize=${pageSize}`);
    if (res.ok) {
      const data = await res.json();
      setMovements(data.movements);
      setTotal(data.total);
    }
  }, [id, page, pageSize]);

  useEffect(() => { loadPart(); }, [loadPart]);
  useEffect(() => { loadMovements(); }, [loadMovements]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = {
      type: form.get("type"),
      quantity: Number(form.get("quantity")),
      price: Number(form.get("price")),
      notes: (form.get("notes") as string).substring(0, 50) || null,
    };
    const res = await fetch(`/api/parts/${id}/movements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) {
      setModal(false);
      loadPart();
      loadMovements();
    } else {
      const d = await res.json();
      setError(d.error ?? "Error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Back</Button>
        <h1 className="text-2xl font-semibold text-gray-900">
          Stock: {part?.name ?? "Loading..."}
        </h1>
        {part && (
          <span className={`text-lg font-bold ${part.stock > 0 ? "text-green-600" : "text-red-500"}`}>
            ({part.stock} units)
          </span>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => { setModal(true); setError(""); }}>+ Add Movement</Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Type</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Qty</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Unit Price</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Notes</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {movements.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.type === "IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {m.type}
                  </span>
                </td>
                <td className="px-4 py-2 font-medium">{m.quantity}</td>
                <td className="px-4 py-2">{formatCurrency(m.price)}</td>
                <td className="px-4 py-2 text-gray-500">{m.notes ?? "—"}</td>
                <td className="px-4 py-2 text-gray-500">
                  {new Date(m.createdAt).toLocaleString("en-US")}
                </td>
              </tr>
            ))}
            {movements.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No movements found.</td></tr>
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

      <Modal open={modal} onClose={() => setModal(false)} title="Add Stock Movement">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
            <select id="type" name="type" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="IN">IN (receiving stock)</option>
              <option value="OUT">OUT (manual withdrawal)</option>
            </select>
          </div>
          <Input id="quantity" name="quantity" type="number" min="1" label="Quantity" required />
          <Input id="price" name="price" type="number" step="0.01" min="0" label="Unit Price (R$)" required />
          <div className="space-y-1">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (max 50 chars)</label>
            <input id="notes" name="notes" type="text" maxLength={50} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
