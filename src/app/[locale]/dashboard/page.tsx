import { prisma } from "@/lib/prisma";
import { getTranslations, getFormatter } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const format = await getFormatter();

  const [customers, orders, parts] = await Promise.all([
    prisma.customer.count(),
    prisma.serviceOrder.count(),
    prisma.part.count(),
  ]);

  const recentOrders = await prisma.serviceOrder.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { customer: true, status: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={t("customers")} value={customers} href="/dashboard/customers" />
        <StatCard label={t("serviceOrders")} value={orders} href="/dashboard/orders" />
        <StatCard label={t("parts")} value={parts} href="/dashboard/parts" />
      </div>

      <div>
        <h2 className="text-lg font-medium text-gray-700 mb-3">{t("recentOrders")}</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-sm">{t("noOrders")}</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colId")}</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colCustomer")}</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colStatus")}</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">{t("colCreated")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <Link href={`/dashboard/orders/${order.id}`} className="text-blue-600 hover:underline font-medium">
                        #{order.id}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-gray-700">{order.customer.name}</td>
                    <td className="px-4 py-2">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: order.status.color ?? "#6B7280" }}
                      >
                        {order.status.name}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {format.dateTime(order.createdAt, { dateStyle: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href as Parameters<typeof Link>[0]["href"]} className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow block">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </Link>
  );
}
