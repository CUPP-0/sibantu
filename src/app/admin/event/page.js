import { redirect } from "next/navigation";
import AdminDistributionEvents from "@/components/admin-distribution-events";
import AdminWorkspace from "@/components/admin-workspace";
import DatabaseSetupNotice from "@/components/database-setup-notice";
import { getSession } from "@/lib/auth";
import { getDatabaseUnavailableMessage } from "@/lib/http";

export const metadata = { title: "Jadwal Penyaluran" };

export default async function DistributionEventsPage() {
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

  return <AdminWorkspace user={user} title="Jadwal bantuan"><AdminDistributionEvents /></AdminWorkspace>;
}
