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

    return headers;
  },
  credentials: "include"
});

export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQueryRaw(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // try to get a new token
    const refreshResult = await baseQueryRaw(
      {
        url: "/auth/refresh-token",
        method: "POST",
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const data = (refreshResult.data as any).data || refreshResult.data;
      const newToken = data.token;
      if (newToken) {
        setCookie("pos_token", newToken, { expires: 1 });
        // retry the initial query
        result = await baseQueryRaw(args, api, extraOptions);
      }
    } else {
      // refresh failed - logout
      removeCookie("pos_token");
      removeCookie("pos_branch_id");
      // Only redirect if we are not already on login page
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  }
  return result;
};
