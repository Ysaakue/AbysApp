"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher({ userId }: { userId?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  async function switchLocale(next: string) {
    if (userId) {
      fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
    }
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex gap-0.5" aria-label="Language">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
            locale === loc
              ? "bg-blue-900 text-white"
              : "text-blue-200 hover:text-white hover:bg-blue-800"
          }`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
