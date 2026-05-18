import { requireAdminSession } from "@/lib/auth/require-admin-session";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdminSession();
  return children;
}
