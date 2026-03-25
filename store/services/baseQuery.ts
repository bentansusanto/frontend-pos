import { getCookie, setCookie, removeCookie } from "@/utils/cookies";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

const baseQueryRaw = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers) => {
    const token = getCookie("pos_token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    const branchId = getCookie("pos_branch_id");
    if (branchId) {
      headers.set("x-branch-id", branchId);
    }

    const csrfToken = getCookie("pos_csrf_token");
    if (csrfToken && !headers.has("x-csrf-token")) {
      headers.set("x-csrf-token", csrfToken);
    }

    return headers;
  },
  credentials: "include"
});

/** Fetch a fresh CSRF token from the server and cache it. Returns the token string or null. */
async function fetchFreshCsrfToken(api: any, extraOptions: any): Promise<string | null> {
  removeCookie("pos_csrf_token");
  const csrfResult = await baseQueryRaw("/auth/csrf-token", api, extraOptions);
  if (csrfResult.data) {
    const token = (csrfResult.data as any).csrfToken as string | undefined;
    if (token) {
      setCookie("pos_csrf_token", token);
      return token;
    }
  }
  return null;
}

/** Build a FetchArgs object with the CSRF token injected into headers. */
function withCsrfHeader(args: string | FetchArgs, csrfToken: string): FetchArgs {
  const base: FetchArgs = typeof args === "string" ? { url: args } : { ...args };
  return {
    ...base,
    headers: {
      ...(base.headers as Record<string, string> | undefined),
      "x-csrf-token": csrfToken,
    },
  };
}

export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const method = typeof args === "string" ? "GET" : args.method || "GET";
  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());

  // Ensure we have a CSRF token for state-changing requests
  if (isMutating) {
    let csrfToken = getCookie("pos_csrf_token");
    if (!csrfToken) {
      csrfToken = await fetchFreshCsrfToken(api, extraOptions);
    }
    // Inject the fresh token directly into the args headers
    if (csrfToken) {
      args = withCsrfHeader(args, csrfToken);
    }
  }

  let result = await baseQueryRaw(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to refresh the access token
    const refreshResult = await baseQueryRaw(
      { url: "/auth/refresh-token", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const data = (refreshResult.data as any).data || refreshResult.data;
      const newToken = data.token;
      if (newToken) {
        setCookie("pos_token", newToken, { expires: 1 });
        result = await baseQueryRaw(args, api, extraOptions);
      }
    } else {
      removeCookie("pos_token");
      removeCookie("pos_branch_id");
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  } else if (result.error && result.error.status === 403) {
    // CSRF token is stale — fetch a fresh one and retry once
    const freshToken = await fetchFreshCsrfToken(api, extraOptions);
    if (freshToken && isMutating) {
      result = await baseQueryRaw(withCsrfHeader(args, freshToken), api, extraOptions);
    }
  }

  return result;
};

