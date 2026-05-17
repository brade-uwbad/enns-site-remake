import { AdminSessionGuard } from "@/components/admin/admin-session-guard";
import { isAdminAuthBypassEnabled } from "@/lib/auth/admin-bypass";
import { requireAdminSession } from "@/lib/auth/require-admin-session";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdminSession();

  if (isAdminAuthBypassEnabled()) {
    return <AdminSessionGuard enabled={false}>{children}</AdminSessionGuard>;
  }

  return <AdminSessionGuard enabled>{children}</AdminSessionGuard>;
}
