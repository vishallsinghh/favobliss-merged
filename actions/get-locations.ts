import { Location } from "@/types";

const URL = process.env.NEXT_PUBLIC_STORE_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;

export const getLocations = async (
  storeId: string,
  pincode?: string
): Promise<Location[]> => {
  let res;
  if (pincode) {
    res = await fetch(
      `${URL}/api/admin/${STORE_ID}/location/pincode=${pincode}`,
      { cache: "no-store" }
    );
  } else {
    res = await fetch(`${URL}/api/admin/${STORE_ID}/location`, {
      cache: "no-store",
    });
  }

  if (!res.ok) {
    throw new Error("Failed to fetch locations");
  }
  return res.json();
};

export const getLocationById = async (id: string): Promise<Location> => {
  const res = await fetch(`${URL}/api/admin/${STORE_ID}/location/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch locations");
  }
  return res.json();
};
