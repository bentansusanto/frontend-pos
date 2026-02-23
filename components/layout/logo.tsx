import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "../ui/badge";

type LogoProps = {
  className?: string;
};

export default function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 px-5 py-4 font-bold", className)}>
      <img src="/logo-pos.svg" className="block h-8 w-8" alt="POS App Logo" />
      <span className="text-lg">POS App</span>
    </Link>
  );
}
