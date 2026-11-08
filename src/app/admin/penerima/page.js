import { redirect } from "next/navigation";
import AdminWorkspace from "@/components/admin-workspace";
import BeneficiaryManagement from "@/components/beneficiary-management";
import DatabaseSetupNotice from "@/components/database-setup-notice";
import { getSession } from "@/lib/auth";
import { getDatabaseUnavailableMessage } from "@/lib/http";

export const metadata = { title: "Akun Warga" };

export default async function BeneficiariesPage() {
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
  return <AdminWorkspace user={user} title="Akun warga"><BeneficiaryManagement /></AdminWorkspace>;
}
