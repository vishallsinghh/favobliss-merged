import { Size } from "@/types";

const URL = process.env.NEXT_PUBLIC_STORE_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;

export const getSizes = async (): Promise<Size[]> => {
  const res = await fetch(`${URL}/api/admin/${STORE_ID}/sizes`, {
    next: { revalidate: 600 },
  });
  return res.json();
};
