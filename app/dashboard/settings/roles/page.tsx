import { RolesPage } from "@/components/modules/Roles/RolesPage";
import { generateMeta } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = generateMeta({
  title: "Roles & Permissions",
  description: "Manage system roles and their permissions."
});

export default function Page() {
  return <RolesPage />;
}
