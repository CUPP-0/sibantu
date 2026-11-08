import { redirect } from "next/navigation";
import AdminWorkspace from "@/components/admin-workspace";
import BranchProgress from "@/components/branch-progress";
import DatabaseSetupNotice from "@/components/database-setup-notice";
import { getSession } from "@/lib/auth";
import { getDatabaseUnavailableMessage } from "@/lib/http";

export const metadata = { title: "Progres Penyaluran Cabang" };

export default async function BranchProgressPage() {
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
  return <AdminWorkspace user={user} title="Progres penyaluran"><BranchProgress /></AdminWorkspace>;
}
