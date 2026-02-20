import { VerifyAccountPage } from "@/components/modules/VerifyAccount/VerifyAccountPage";
import { generateMeta } from "@/lib/utils";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Verify Account Page",
    description:
      "A verify account form with email and verification code. There's an option to verify account with Google and a link to sign up if you don't have an account.",
  });
}

export default function VerifyAccount() {
  return <VerifyAccountPage />;
}
