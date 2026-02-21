import { BranchPage } from "@/components/modules/Branches/BranchPage";
import { generateMeta } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = generateMeta({
  title: "Branches",
  description: "Manage branches and their details.",
});

export default function Page() {
  return <BranchPage />;
}
