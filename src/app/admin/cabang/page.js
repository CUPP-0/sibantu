import { redirect } from "next/navigation";
import AdminWorkspace from "@/components/admin-workspace";
import BranchManagement from "@/components/branch-management";
import DatabaseSetupNotice from "@/components/database-setup-notice";
import { getSession } from "@/lib/auth";
import { getDatabaseUnavailableMessage } from "@/lib/http";

export const metadata = { title: "Admin Cabang" };

export default async function BranchAdminPage() {
  let user;
  try {
    user = await getSession();
  } catch (error) {
    const message = getDatabaseUnavailableMessage(error);
    if (message) return <DatabaseSetupNotice message={message} />;
    throw error;
  }
  if (!user) redirect("/login");
  if (user.role !== "super_admin") redirect("/admin/dashboard");
  return <AdminWorkspace user={user} title="Admin cabang"><BranchManagement /></AdminWorkspace>;
}
