import { redirect } from "next/navigation";

/** SEO now lives with the thing it describes: each page, product and category
 *  has its own Search listing, and the site-wide defaults sit under Pages. */
export default function SeoAdmin() {
  redirect("/admin/content");
}
