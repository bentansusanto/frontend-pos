import { LoginPage } from "@/components/modules/Login/LoginPage";
import { generateMeta } from "@/lib/utils";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Login Page",
    description:
      "A login form with email and password. There's an option to login with Google and a link to sign up if you don't have an account."
  });
}

export default function LoginPageV1() {
  return <LoginPage />;
}
