import { Color } from "@/types";

const URL = process.env.NEXT_PUBLIC_STORE_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;

export const getColors = async (): Promise<Color[]> => {
  const res = await fetch(`${URL}/api/admin/${STORE_ID}/colors`, {
    next: { revalidate: 600 },
  });
  return res.json();
};
