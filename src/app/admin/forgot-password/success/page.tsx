import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { AuthHeading, AuthLogo } from "@/components/auth/auth-ui";

export default function ForgotPasswordSuccessPage() {
  return (
    <AuthShell>
      <AuthLogo />
      <AuthHeading title="Your password has been reset" />
      <p className="text-center">
        <Link href="/admin/login" className="text-sm font-medium text-[#4a6d95] hover:underline">
          Back to login
        </Link>
      </p>
    </AuthShell>
  );
}
