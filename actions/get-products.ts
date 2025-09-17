import { Product } from "@/types";
import qs from "query-string";

const URL = `${process.env.NEXT_PUBLIC_STORE_URL}/api/admin/684315296fa373b59468f387/products`;
const HOT_DEALS_URL = `${process.env.STORE_URL}/api/admin/684315296fa373b59468f387/products/hot-deals`;

interface Query {
  categoryId?: string;
  subCategoryId?: string;
  brandId?: string;
  colorId?: string;
  sizeId?: string;
  isFeatured?: boolean;
  limit?: string;
  page?: string;
  type?: "MEN" | "WOMEN" | "KIDS" | "BEAUTY" | "ELECTRONICS";
  price?: string;
  variantIds?: string;
  pincode?: number;
  rating?: string;
  discount?: string;
}

interface HotDealsQuery extends Query {
  timeFrame?: "7 days" | "30 days" | "90 days" | "all time";
}

export const getProducts = async (
  query?: Query
): Promise<{ products: Product[]; totalCount: number }> => {
  const url = qs.stringifyUrl({
    url: URL,
    query: {
      ...(query?.colorId && { colorId: query.colorId }),
      ...(query?.sizeId && { sizeId: query.sizeId }),
      ...(query?.categoryId && { categoryId: query.categoryId }),
      ...(query?.brandId && { brandId: query.brandId }),
      ...(query?.isFeatured && { isFeatured: query.isFeatured }),
      ...(query?.limit && { limit: query.limit }),
      ...(query?.type && { type: query.type }),
      ...(query?.price && { price: query.price }),
      ...(query?.page && { page: query.page }),
      ...(query?.variantIds && { variantIds: query.variantIds }),
      ...(query?.pincode && { pincode: query.pincode }),
      ...(query?.subCategoryId && { subCategoryId: query.subCategoryId }),
      ...(query?.rating && { rating: query.rating }),
      ...(query?.discount && { discount: query.discount }),
    },
  });

  try {
    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("getProducts fetch error:", res.status, res.statusText);
      return { products: [], totalCount: 0 };
    }

    const text = await res.text();

    if (!text) {
      console.warn("getProducts: empty response");
      return { products: [], totalCount: 0 };
    }

    const data = JSON.parse(text);
    return {
      products: data.products,
      totalCount: data.totalCount,
    };
  } catch (error) {
    console.error("getProducts JSON parse or network error:", error);
    return { products: [], totalCount: 0 };
  }
};

export const getHotDeals = async (query: HotDealsQuery): Promise<Product[]> => {
  const url = qs.stringifyUrl({
    url: HOT_DEALS_URL,
    query: {
      categoryId: query.categoryId,
      limit: query.limit,
      page: query.page,
      timeFrame: query.timeFrame,
    },
  });

  try {
    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("getHotDeals fetch error:", res.status, res.statusText);
      return [];
    }

    const text = await res.text();

    if (!text) {
      console.warn("getHotDeals: empty response");
      return [];
    }

    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error("getHotDeals JSON parse or network error:", error);
    return [];
  }
};
