import { InvoiceData } from "@/types";

const URL = process.env.NEXT_PUBLIC_STORE_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;

export const getInvoice = async (id: string): Promise<InvoiceData> => {
  const res = await fetch(`${URL}/api/admin/${STORE_ID}/orders/invoice/${id}`);
  return res.json();
};
