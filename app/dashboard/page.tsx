import { Metadata } from "next";
import { generateMeta } from "@/lib/utils";
import { DashboardPage } from "@/components/modules/Dashboard/DashboardPage";

export async function generateMetadata(): Promise<Metadata>{
  return generateMeta({
    title: "Dashboard",
    description: "POS Dashboard Overview",
  });
}

export default function Page() {
  return <DashboardPage />
}
