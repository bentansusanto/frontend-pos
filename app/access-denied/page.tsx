import { AccessDeniedPage } from "@/components/modules/AccessDenied/AccessDeniedPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Denied | POS System",
  description: "You do not have permission to access this page."
};

export default function Page() {
  return <AccessDeniedPage />;
}
