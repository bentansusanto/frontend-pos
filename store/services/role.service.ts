import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const roleService = createApi({
  reducerPath: "roleService",
  baseQuery,
  tagTypes: ["Roles", "Permissions", "RolePermissions"],
  endpoints: (builder) => ({
    // Roles
    getAllRoles: builder.query<any, void>({
      query: () => ({
        url: "/roles/find-all",
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response.datas || [],
      providesTags: ["Roles"]
    }),
    getRoleById: builder.query<any, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response.datas || response,
      providesTags: ["Roles"]
    }),
    createRole: builder.mutation<any, any>({
      query: (data) => ({
        url: "/roles/create",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Roles"]
    }),
    updateRole: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Roles"]
    }),
    deleteRole: builder.mutation<any, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Roles"]
    }),

    // Permissions
    getAllPermissions: builder.query<any, void>({
      query: () => ({
        url: "/permissions/find-all",
        method: "GET"
      }),
      transformResponse: (response: any) => response.data || response.datas || [],
      providesTags: ["Permissions"]
    }),
    createPermission: builder.mutation<any, any>({
      query: (data) => ({
        url: "/permissions/create",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Permissions"]
    }),
    updatePermission: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/permissions/update/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Permissions"]
    }),
    deletePermission: builder.mutation<any, string>({
      query: (id) => ({
        url: `/permissions/delete/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Permissions"]
    }),

    // Role Permissions
    assignPermissions: builder.mutation<any, { role_id: string; permission_ids: string[] }>({
      query: (data) => ({
        url: "/role-permissions/assign-permissions",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["RolePermissions", "Roles"] // Invalidate Roles as well if permissions are part of role object (though currently they aren't directly)
    })
  })
});

export const {
  useGetAllRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetAllPermissionsQuery,
  useAssignPermissionsMutation,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation
} = roleService;
