import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const session = await getIronSession<SessionData>(
    request,
    NextResponse.next(),
    {
      password: process.env.SESSION_SECRET as string,
      cookieName: "money-app-session",
      cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60,
      },
    }
  );

  const isLoggedIn = session.isLoggedIn;
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");

  // If user is on auth page and already logged in, redirect to home
  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // If user is not logged in and trying to access protected route, redirect to signin
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
