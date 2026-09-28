import { redirect } from "next/navigation";

/** Accounts moved in with the team; keep old links and bookmarks working. */
export default function AdminsRedirect() {
  redirect("/admin/team?tab=accounts");
}
