import { redirect } from "next/navigation";
import CitizenProfile from "@/components/citizen-profile";
import { getSession } from "@/lib/auth";
import DatabaseSetupNotice from "@/components/database-setup-notice";
import { getDatabaseUnavailableMessage } from "@/lib/http";

export const metadata = { title: "Profil Warga" };

export default async function CitizenProfilePage() {
  let user;
  try {
    user = await getSession();
  } catch (error) {
    const message = getDatabaseUnavailableMessage(error);
    if (message) return <DatabaseSetupNotice message={message} />;
    throw error;
  }
  if (!user) redirect("/login");
  if (user.role !== "masyarakat") redirect("/admin/dashboard");

  return <CitizenProfile user={user} />;
}
