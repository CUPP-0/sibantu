import { getSession } from "@/lib/auth";
import { ok, serverError } from "@/lib/http";

export async function GET() {
  try {
    const user = await getSession();
    return ok({ user });
  } catch (error) {
    return serverError(error);
  }
}
