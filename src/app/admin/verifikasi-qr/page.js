import { redirect } from "next/navigation";
import AdminWorkspace from "@/components/admin-workspace";
import DatabaseSetupNotice from "@/components/database-setup-notice";
import QrDistributionScanner from "@/components/qr-distribution-scanner";
import { getSession } from "@/lib/auth";
import { getDatabaseUnavailableMessage } from "@/lib/http";

export const metadata = { title: "Verifikasi QR" };

export default async function VerifyQrPage() {
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
  return <AdminWorkspace user={user} title="Verifikasi QR"><QrDistributionScanner /></AdminWorkspace>;
}
