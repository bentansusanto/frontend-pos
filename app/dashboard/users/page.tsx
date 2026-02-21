import { UserPage } from "@/components/modules/Users/UserPage";
import { generateMeta } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = generateMeta({
  title: "Users",
  description: "Manage users and their roles.",
});

export default function Page() {
  return <UserPage />;
}
