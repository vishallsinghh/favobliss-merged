import { Category } from "@/types";

const URL = process.env.NEXT_PUBLIC_STORE_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;

export const getCategoryById = async (id: string): Promise<Category> => {
  const res = await fetch(`${URL}/api/admin/${STORE_ID}/categories/${id}`);
  return res.json();
};

export const getCategoryBySlug = async (slug: string): Promise<Category> => {
  const res = await fetch(`${URL}/api/admin/${STORE_ID}/categories?slug=${slug}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Category not found");
  }
  return res.json();
};
