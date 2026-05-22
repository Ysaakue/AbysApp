import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/orders", label: "Service Orders" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/devices", label: "Devices" },
  { href: "/dashboard/services", label: "Services" },
  { href: "/dashboard/parts", label: "Parts" },
  { href: "/dashboard/order-statuses", label: "Statuses" },
  { href: "/dashboard/users", label: "Users" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-700 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <span className="font-bold text-lg tracking-tight">AbysApp</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="text-sm text-blue-200 hover:text-white transition-colors"
              >
                Sign out ({session.user?.name})
              </button>
            </form>
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
