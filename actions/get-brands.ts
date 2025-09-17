import { Brand } from "@/types";

const URL = process.env.NEXT_PUBLIC_STORE_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;

export const getBrands = async (): Promise<Brand[]> => {
  const res = await fetch(`${URL}/api/admin/${STORE_ID}/brands`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Brands not found");
  }
  return res.json();
};
