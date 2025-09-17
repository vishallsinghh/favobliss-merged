import { Product, ProductApiResponse } from "@/types";
import axios from "axios";

const URL = process.env.NEXT_PUBLIC_STORE_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;

export const getProductById = async (id: string): Promise<Product> => {
  const res = await fetch(`${URL}/api/admin/${STORE_ID}/products/${id}`, {
    cache: "no-store",
  });
  return res.json();
};

export const getProductBySlug = async (
  slug: string
): Promise<ProductApiResponse> => {
  const res = await fetch(
    `${URL}/api/admin/${STORE_ID}/products?slug=${slug}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("Product not found");
  }
  return res.json();
};

export const getRecentlyViewedProducts = async (
  productIds: string[],
  locationId?: string
): Promise<Product[]> => {
  try {
    const response = await axios.post(
      `${URL}/api/admin/${STORE_ID}/products/recently-viewed`,
      { productIds, locationId },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("[GET_RECENTLY_VIEWED_PRODUCTS]", error);
    throw new Error("Failed to fetch recently viewed products");
  }
};
