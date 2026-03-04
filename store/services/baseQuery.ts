import { getCookie } from "@/utils/cookies";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseQuery = fetchBaseQuery({
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
