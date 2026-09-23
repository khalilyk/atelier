import { redirect } from "next/navigation";

/** Images moved into the Media Library, on the Picture slots tab. */
export default function ImagesAdmin() {
  redirect("/admin/media?tab=slots");
}
