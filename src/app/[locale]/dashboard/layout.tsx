import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { AbysIcon } from "@/components/ui/AbysIcon";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const t = await getTranslations("nav");
  const locale = await getLocale();

  const navLinks = [
    { href: "/dashboard" as const, label: t("dashboard") },
    { href: "/dashboard/orders" as const, label: t("orders") },
    { href: "/dashboard/customers" as const, label: t("customers") },
    { href: "/dashboard/devices" as const, label: t("devices") },
    { href: "/dashboard/services" as const, label: t("services") },
    { href: "/dashboard/parts" as const, label: t("parts") },
    { href: "/dashboard/order-statuses" as const, label: t("statuses") },
    { href: "/dashboard/users" as const, label: t("users") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <AbysIcon className="h-7 w-7 text-white" />
              <span className="font-brand font-extrabold text-xl tracking-tight">ABYS</span>
            </div>
            <div className="flex items-center gap-4">
              <LocaleSwitcher userId={session.user?.id} />
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: `/${locale}/login` });
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-blue-200 hover:text-white transition-colors"
                >
                  {t("signOut")} ({session.user?.name})
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b shadow-sm overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 h-10 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm rounded text-gray-600 hover:bg-gray-100 hover:text-gray-900 whitespace-nowrap transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
