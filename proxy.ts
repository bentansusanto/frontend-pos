import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Helper untuk decode JWT payload tanpa library eksternal
function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("pos_token")?.value;
  const sessionToken = request.cookies.get("session_pos")?.value;
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8080/api/v1";

  // 0. Handle API Proxy
  // Jika request diawali dengan /api, rewrite ke backend
  if (pathname.startsWith("/api")) {
    const targetPath = pathname.replace(/^\/api/, "");
    // Pastikan backendUrl tidak memiliki trailing slash jika targetPath dimulai dengan slash, atau sebaliknya
    // BACKEND_URL di env sudah termasuk /api/v1, jadi kita gabungkan dengan hati-hati
    // pathname: /api/auth/login -> targetPath: /auth/login
    // backendUrl: http://.../api/v1
    // result: http://.../api/v1/auth/login
    const targetUrl = `${backendUrl}${targetPath}${request.nextUrl.search}`;
    return NextResponse.rewrite(new URL(targetUrl));
  }

  // Path public yang tidak butuh proteksi
  const publicPaths = [
    "/login",
    "/register",
    "/verify-account",
    "/resend-verify-account",
    "/forgot-password",
    "/reset-password"
  ];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isRoot = pathname === "/";

  // 1. Handle Root Path
  if (isRoot) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Handle Public Paths (Login/Register) saat sudah login
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Handle Protected Paths (Dashboard, etc)
  if (!isPublicPath && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Auto Refresh Token Logic
  // Jika ada token dan user berada di protected route, cek expiry
  if (token && !isPublicPath) {
    const payload = parseJwt(token);

    // Jika token valid dan punya exp
    if (payload && payload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;

      // Jika token akan expired dalam waktu kurang dari 5 menit (300 detik)
      // Atau sudah expired, coba refresh
      // NOTE: Tambahkan logging untuk debugging
      // UBAH DARI 300 KE ANGKA BESAR (MISAL 1 HARI = 86400) UNTUK TESTING AGAR SELALU REFRESH
      // const REFRESH_THRESHOLD = 30; // Testing mode: Selalu refresh jika umur token < 1 hari
      console.log(`[Middleware] Token Expiry Check: ${timeUntilExpiry}s remaining`);

      console.log("[Middleware] Token expiring soon, attempting refresh...");

      // Kita butuh sessionToken untuk refresh
      if (sessionToken) {
        try {
          // Panggil endpoint refresh token backend
          // Gunakan backendUrl langsung karena kita di server side
          const refreshResponse = await fetch(`${backendUrl}/auth/refresh-token`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Cookie: `session_pos=${sessionToken}`
            }
          });

          console.log(`[Middleware] Refresh Response Status: ${refreshResponse.status}`);

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            const newToken = data?.data?.token;

            if (newToken) {
              console.log("[Middleware] Refresh successful, setting new token");

              // Update token di cookie response
              const response = NextResponse.next();

              // Set Access Token (pos_token)
              response.cookies.set("pos_token", newToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 // 1 hari
              });

              // Forward Set-Cookie header from backend response (session_pos)
              // Backend sudah mengatur HttpOnly, Secure, SameSite, MaxAge, dll.
              const setCookieHeader = refreshResponse.headers.get("set-cookie");
              if (setCookieHeader) {
                response.headers.append("Set-Cookie", setCookieHeader);
              }

              return response;
            }
          } else {
            console.error("[Middleware] Refresh failed with status:", refreshResponse.status);
          }
        } catch (error) {
          console.error("Auto refresh token failed:", error);
          // Opsional: Redirect ke login jika refresh gagal total?
          // return NextResponse.redirect(new URL("/auth/login", request.url));
        }
      } else {
        console.log("[Middleware] No session token found, cannot refresh");
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    "/((?!_next/static|_next/image|favicon.ico|images).*)"
  ]
};
