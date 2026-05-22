import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { auth } from "./lib/auth";
import type { NextRequest } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);

// Combine NextAuth session check with next-intl locale routing.
// auth() wraps the handler and injects req.auth (session or null).
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoginPage = /^\/[a-z]{2}\/login(\/.*)?$/.test(pathname);

  if (!req.auth && !isLoginPage) {
    const locale = pathname.match(/^\/([a-z]{2})(\/|$)/)?.[1] ?? routing.defaultLocale;
    return Response.redirect(new URL(`/${locale}/login`, req.url));
  }

  if (req.auth && /^\/(([a-z]{2})\/?)?$/.test(pathname)) {
    const locale = (req.auth.user?.locale as string | undefined) ?? routing.defaultLocale;
    return Response.redirect(new URL(`/${locale}/dashboard`, req.url));
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
