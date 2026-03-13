import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Decode JWT payload tanpa library eksternal
function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string, bufferSeconds = 0): boolean {
  const payload = parseJwt(token);
  // Jika payload invalid atau tdak ada exp, anggap saja token sudah expired
  if (!payload || !payload.exp) return true;
  const currentTime = Math.floor(Date.now() / 1000);
  // Mengecek apakah expiration time lebih kecil dari waktu sekarang + buffer
  return payload.exp < currentTime + bufferSeconds;
}

const LOGIN_URL = "/login";
const DASHBOARD_URL = "/dashboard";

// Path public yang tidak butuh token
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/verify-account",
  "/resend-verify-account",
  "/forgot-password",
  "/reset-password"
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("pos_token")?.value;
  const sessionToken = request.cookies.get("session_pos")?.value;
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8082/api/v1";

  // ─── 0. API Proxy ────────────────────────────────────────────────────────────
  if (pathname.startsWith("/api")) {
    const targetPath = pathname.replace(/^\/api/, "");
    const targetUrl = `${backendUrl}${targetPath}${request.nextUrl.search}`;
    return NextResponse.rewrite(new URL(targetUrl));
  }

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isRoot = pathname === "/";

  // ─── 1. Root "/" ─────────────────────────────────────────────────────────────
  if (isRoot) {
    if (token && !isTokenExpired(token)) {
      return NextResponse.redirect(new URL(DASHBOARD_URL, request.url));
    }
    return NextResponse.redirect(new URL(LOGIN_URL, request.url));
  }

  // ─── 2. Public path + sudah punya token valid → ke dashboard ─────────────────
  if (isPublicPath) {
    if (token && !isTokenExpired(token)) {
      return NextResponse.redirect(new URL(DASHBOARD_URL, request.url));
    }
    return NextResponse.next();
  }

  // ─── 3. Protected path: tidak ada token → redirect login ─────────────────────
  if (!token) {
    const loginUrl = new URL(LOGIN_URL, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── 4. Protected path: token expired atau waktu hidup sisa < 2 menit (120 detik) → coba refresh, gagal → redirect login ─
  if (isTokenExpired(token, 120)) {
    if (sessionToken) {
      try {
        const refreshResponse = await fetch(`${backendUrl}/auth/refresh-token`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Cookie: `session_pos=${sessionToken}`
          }
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const newToken = data?.data?.token;

          if (newToken) {
            const response = NextResponse.next();

            response.cookies.set("pos_token", newToken, {
              httpOnly: false,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 // 1 jam
            });

            // Forward Set-Cookie dari backend (session_pos baru)
            const setCookieHeader = refreshResponse.headers.get("set-cookie");
            if (setCookieHeader) {
              response.headers.append("Set-Cookie", setCookieHeader);
            }

            return response;
          }
        }
      } catch {
        // Refresh gagal → redirect ke login
      }
    }

    // Token expired & refresh gagal atau tidak ada sessionToken → paksa login
    const loginUrl = new URL(LOGIN_URL, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    // Hapus cookie yang sudah tidak valid
    response.cookies.delete("pos_token");
    response.cookies.delete("session_pos");
    return response;
  }

  // ─── 5. Token valid → lanjut ─────────────────────────────────────────────────
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"]
};
