import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { routing } from "@/i18n/routing";

export default async function HomePage() {
  const session = await auth();
  const locale = session?.user?.locale ?? routing.defaultLocale;
  if (session) redirect(`/${locale}/dashboard`);
  redirect(`/${routing.defaultLocale}/login`);
}
