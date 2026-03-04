import { PermissionsPage } from "@/components/modules/Permissions/PermissionsPage";
import { generateMeta } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = generateMeta({
  title: "Permissions",
  description: "Manage system permissions."
});

export default function Page() {
  return <PermissionsPage />;
}
