"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("users");
  const tc = useTranslations("common");
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
    const body: Record<string, unknown> = { name: form.get("name"), email: form.get("email") };
    if (modal === "create" || form.get("password")) body.password = form.get("password");
    if (modal === "edit") body.active = form.get("active") === "true";

    const url = modal === "edit" ? `/api/users/${selected!.id}` : "/api/users";
    const method = modal === "edit" ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setLoading(false);
    if (res.ok) { setModal(null); load(); }
    else { const d = await res.json(); setError(d.error ?? tc("error")); }
  }

  async function handleDelete(user: User) {
    if (!confirm(t("confirmDelete", { name: user.name }))) return;
    await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <Button onClick={() => { setModal("create"); setError(""); }}>{t("newBtn")}</Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colName")}</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colEmail")}</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colStatus")}</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">{tc("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-2 text-gray-600">{u.email}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {u.active ? t("statusActive") : t("statusInactive")}
                  </span>
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => { setSelected(u); setModal("edit"); setError(""); }}>{tc("edit")}</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(u)}>{tc("delete")}</Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">{t("empty")}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === "create" ? t("modalCreate") : t("modalEdit")}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" name="name" label={t("fieldName")} required defaultValue={modal === "edit" ? selected?.name : ""} />
          <Input id="email" name="email" type="email" label={t("fieldEmail")} required defaultValue={modal === "edit" ? selected?.email : ""} />
          <Input id="password" name="password" type="password"
            label={modal === "edit" ? t("fieldPasswordEdit") : t("fieldPassword")}
            required={modal === "create"} minLength={6} />
          {modal === "edit" && (
            <div className="space-y-1">
              <label htmlFor="active" className="block text-sm font-medium text-gray-700">{t("fieldStatus")}</label>
              <select id="active" name="active" defaultValue={selected?.active ? "true" : "false"}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="true">{t("statusActive")}</option>
                <option value="false">{t("statusInactive")}</option>
              </select>
            </div>
          )}
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
