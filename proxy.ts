import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/f(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/create(.*)",
  "/(en|ar|fr|es)",
  "/(en|ar|fr|es)/f(.*)",
  "/(en|ar|fr|es)/sign-in(.*)",
  "/(en|ar|fr|es)/sign-up(.*)",
  "/(en|ar|fr|es)/create(.*)",
]);

const LOCALES = ["en", "ar", "fr", "es"] as const;
const DEFAULT_LOCALE = "en";

function resolveLocale(value: string | null): string {
  if (!value) return DEFAULT_LOCALE;
  const lowered = value.toLowerCase();
  return LOCALES.includes(lowered as (typeof LOCALES)[number])
    ? lowered
    : DEFAULT_LOCALE;
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (first && LOCALES.includes(first as (typeof LOCALES)[number])) {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
    const rewritten = req.nextUrl.clone();
    rewritten.pathname = `/${segments.slice(1).join("/")}`;
    if (rewritten.pathname === "/") {
      rewritten.pathname = "/";
    }
    const res = NextResponse.rewrite(rewritten);
    res.cookies.set("APP_LOCALE", first, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;
  }

  const cookieLocale = resolveLocale(req.cookies.get("APP_LOCALE")?.value ?? null);
  const localeRes = NextResponse.next();
  localeRes.cookies.set("APP_LOCALE", cookieLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  return localeRes;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
