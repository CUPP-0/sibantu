import { redirect } from "next/navigation";
import AdminWorkspace from "@/components/admin-workspace";
import ClaimHistory from "@/components/claim-history";
import DatabaseSetupNotice from "@/components/database-setup-notice";
import { getSession } from "@/lib/auth";
import { getDatabaseUnavailableMessage } from "@/lib/http";

export const metadata = { title: "Riwayat Pengambilan" };

export default async function ClaimHistoryPage() {
  let user;
  try {
    user = await getSession();
  } catch (error) {
    const message = getDatabaseUnavailableMessage(error);
    if (message) return <DatabaseSetupNotice message={message} />;
    throw error;
  }
  if (!user) redirect("/login");
  if (user.role !== "admin_daerah") redirect("/admin/dashboard");
  return <AdminWorkspace user={user} title="Riwayat pengambilan"><ClaimHistory /></AdminWorkspace>;
}
