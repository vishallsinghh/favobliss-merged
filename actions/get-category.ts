import { Category } from "@/types";
import { notFound } from "next/navigation";

const URL = process.env.NEXT_PUBLIC_STORE_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;

export const getCategoryById = async (id: string): Promise<Category> => {
  const res = await fetch(`${URL}/api/admin/${STORE_ID}/categories/${id}`, {
    next: { revalidate: 600 },
  });
  return res.json();
};

export const getCategoryBySlug = async (slug: string): Promise<Category> => {
  const res = await fetch(
    `${URL}/api/admin/${STORE_ID}/categories?slug=${slug}`,
    {
      next: { revalidate: 600 },
    }
  );
  if (!res.ok) {
    notFound();
  }
  return res.json();
};
