import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin-dashboard";
import DatabaseSetupNotice from "@/components/database-setup-notice";
import { getSession } from "@/lib/auth";
import { getDatabaseUnavailableMessage } from "@/lib/http";

export const metadata = { title: "Dashboard Pengelola" };

export default async function AdminDashboardPage() {
  let user;
  try {
    user = await getSession();
  } catch (error) {
    const message = getDatabaseUnavailableMessage(error);
    if (message) return <DatabaseSetupNotice message={message} />;
    throw error;
  }
  if (!user) redirect("/login");
  if (user.role === "masyarakat") redirect("/");
  return <AdminDashboard user={user} />;
}
