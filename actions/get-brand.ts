import { Brand } from "@/types";

const URL = process.env.NEXT_PUBLIC_STORE_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;

export const getBrandBySlug = async (slug: string): Promise<Brand> => {
  const res = await fetch(`${URL}/api/admin/${STORE_ID}/brands?slug=${slug}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Product not found");
  }
  return res.json();
};
