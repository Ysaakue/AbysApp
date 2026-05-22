"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      name: form.get("name"),
      email: form.get("email"),
    };
    if (modal === "create" || form.get("password")) {
      body.password = form.get("password");
    }
    if (modal === "edit") body.active = form.get("active") === "true";

    const url = modal === "edit" ? `/api/users/${selected!.id}` : "/api/users";
    const method = modal === "edit" ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) {
      setModal(null);
      load();
    } else {
      const data = await res.json();
      setError(data.error ?? "An error occurred");
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`Delete user "${user.name}"?`)) return;
    await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    load();
  }

  function openEdit(user: User) {
    setSelected(user);
    setModal("edit");
    setError("");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <Button onClick={() => { setModal("create"); setError(""); }}>
          + New User
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Email</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-2 text-gray-600">{u.email}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {u.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(u)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(u)}>Delete</Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === "create" ? "New User" : "Edit User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" name="name" label="Name" required defaultValue={modal === "edit" ? selected?.name : ""} />
          <Input id="email" name="email" type="email" label="Email" required defaultValue={modal === "edit" ? selected?.email : ""} />
          <Input
            id="password"
            name="password"
            type="password"
            label={modal === "edit" ? "New Password (leave blank to keep current)" : "Password"}
            required={modal === "create"}
            minLength={6}
          />
          {modal === "edit" && (
            <div className="space-y-1">
              <label htmlFor="active" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="active"
                name="active"
                defaultValue={selected?.active ? "true" : "false"}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          )}
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
