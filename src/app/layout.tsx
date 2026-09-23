import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import BasketProvider from "./components/BasketProvider";
import { Analytics } from "@vercel/analytics/next";
import PageViews from "./components/PageViews";
import { ContentProvider } from "./components/ContentProvider";
import { ProductOverridesProvider } from "./components/ProductOverridesProvider";
import { CompanyProvider } from "./components/CompanyProvider";
import { ImagesProvider } from "./components/ImagesProvider";
import { CategoriesProvider } from "./components/CategoriesProvider";
import { CustomPagesProvider } from "./components/CustomPagesProvider";
import JsonLd from "./components/JsonLd";
import { rootMetadata, organizationLd, websiteLd } from "@/lib/seo";
import { getContentOverrides, getProductOverrides, getCompany, getImages, getPublishedCategories, getPublishedCustomPages } from "@/lib/get-content";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const jost = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export async function generateMetadata(): Promise<Metadata> {
  return rootMetadata();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [overrides, productOverrides, companyInfo, imageSlots, categories, customPages] = await Promise.all([getContentOverrides(), getProductOverrides(), getCompany(), getImages(), getPublishedCategories(), getPublishedCustomPages()]);
  const orgLd = await organizationLd();
  return (
    <html lang="en-AU" className={`${cormorant.variable} ${jost.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col"><JsonLd data={[orgLd, websiteLd()]} /><CompanyProvider company={companyInfo}><ImagesProvider images={imageSlots}><CategoriesProvider categories={categories}><CustomPagesProvider pages={customPages}><ContentProvider overrides={overrides}><ProductOverridesProvider overrides={productOverrides}><BasketProvider>{children}</BasketProvider></ProductOverridesProvider></ContentProvider></CustomPagesProvider></CategoriesProvider></ImagesProvider></CompanyProvider><Analytics /><PageViews /></body>
    </html>
  );
}
