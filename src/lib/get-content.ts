import "server-only";
import { cache } from "react";
import { content, productContent, company, images, customCategories, DEFAULT_COMPANY, type Company, journal, projects, customPages } from "./admin-store";
import type { CustomCategory } from "./categories";
import { sortPosts, type JournalPost } from "./journal";
import { sortProjects, type Project } from "./projects";
import { sortCustomPages, type CustomPage } from "./custom-pages";
import { resolve } from "./content-registry";
import type { ProductOverrides } from "./product-content";

/** Published custom categories only - drafts never reach the public page HTML. */
export const getPublishedCategories = cache(async (): Promise<CustomCategory[]> => {
  try {
    return (await customCategories.list()).filter((c) => c.published);
  } catch {
    return [];
  }
});

export const getPublishedPosts = cache(async (): Promise<JournalPost[]> => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    return sortPosts((await journal.list()).filter((p) => p.published && p.publishedAt <= today));
  } catch {
    return [];
  }
});

export const getPublishedProjects = cache(async (): Promise<Project[]> => {
  try {
    return sortProjects((await projects.list()).filter((p) => p.published));
  } catch {
    return [];
  }
});

export const getPublishedCustomPages = cache(async (): Promise<CustomPage[]> => {
  try {
    return sortCustomPages((await customPages.list()).filter((p) => p.published));
  } catch {
    return [];
  }
});

export const getImages = cache(async (): Promise<Record<string, string>> => {
  try {
    return await images.get();
  } catch {
    return {};
  }
});

export const getCompany = cache(async (): Promise<Company> => {
  try {
    return await company.get();
  } catch {
    return DEFAULT_COMPANY;
  }
});

// Per-request cached content getter for server components.
// Usage:  const t = await getContent();  ...  t("home.about.headline")
export const getContent = cache(async (): Promise<(key: string) => string> => {
  let overrides: Record<string, string> = {};
  try {
    overrides = await content.get();
  } catch {
    overrides = {};
  }
  return (key: string) => resolve(overrides, key);
});

export const getContentOverrides = cache(async (): Promise<Record<string, string>> => {
  try {
    return await content.get();
  } catch {
    return {};
  }
});

export const getProductOverrides = cache(async (): Promise<ProductOverrides> => {
  try {
    return (await productContent.get()) as ProductOverrides;
  } catch {
    return {};
  }
});
