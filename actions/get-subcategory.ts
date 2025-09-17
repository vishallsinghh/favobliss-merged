import { Category } from "@/types";

const URL = `${process.env.NEXT_PUBLIC_STORE_URL}/api/admin/684315296fa373b59468f387/subcategories`;
const categoryURL = `${process.env.NEXT_PUBLIC_STORE_URL}/api/admin/684315296fa373b59468f387/categories`;

export const getSubCategoryById = async (id: string): Promise<Category> => {
  const res = await fetch(`${URL}/${id}`);
  return res.json();
};

export const getSubCategories = async (id: string): Promise<Category[]> => {
  const res = await fetch(`${categoryURL}/${id}/subcategories`);
  return res.json();
};

export const getSubCategoryBySlug = async (slug: string): Promise<Category> => {
  const cleanSlug = slug.split("?")[0];
  const res = await fetch(`${URL}?slug=${cleanSlug}`);

  if (!res.ok) {
    throw new Error("Category not found");
  }
  return res.json();
};
