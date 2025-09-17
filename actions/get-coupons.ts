import { Coupons } from "@/types";

const URL = process.env.NEXT_PUBLIC_STORE_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;

export const getCoupons = async (): Promise<Coupons[]> => {
  const res = await fetch(`${URL}/api/admin/${STORE_ID}/coupons`);
  return res.json();
};
