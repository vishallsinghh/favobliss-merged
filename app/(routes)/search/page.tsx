import { getColors } from "@/actions/get-colors";
import { getProducts } from "@/actions/get-products";
import { getSizes } from "@/actions/get-sizes";
import { getBrands } from "@/actions/get-brands";
import { getLocationGroups } from "@/actions/get-location-group";
import { Container } from "@/components/ui/container";
import { Filter } from "./_components/filter";
import { NoResults } from "@/components/store/no-results";
import { ProductCard } from "@/components/store/product-card";
import { MobileFilters } from "./_components/mobile-filters";
import { PaginationComponent } from "./_components/pagination";
import { Metadata, ResolvingMetadata } from "next";
import { PriceRange, Brand } from "@/types";
import Image from "next/image";
import Breadcrumb from "@/components/store/Breadcrumbs";
import { getSearchItem } from "@/actions/get-search-item";
import { SearchProductCard } from "@/components/store/search-product";

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 100
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 1) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

interface CategoryPageProps {
  params: {
    storeId: string;
    slug: string;
  };
  searchParams: {
    colorId?: string;
    sizeId?: string;
    limit?: string;
    category?: "MEN" | "WOMEN";
    page?: string;
    price?: string;
    sub?: string;
    childsub?: string;
    brandId?: string;
    rating?: string;
    discount?: string;
    query?: string;
  };
}

export async function generateMetadata(
  { params, searchParams }: CategoryPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: "Search Result | Get Deals, Shop Now!",
    description:
      "Discover the newest styles & trends for every occasion. Shop Latest Launches products.",
    openGraph: {
      type: "website",
      images: [
        "https://res.cloudinary.com/dgcksrb1n/image/upload/v1749465423/qoujpnmfjabip1yrllvs.jpg",
        ...previousImages,
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Latest Launches | Get Deals, Shop Now!",
      description:
        "Discover the newest styles & trends for every occasion. Shop Latest Launches products.",
      images: [
        "https://res.cloudinary.com/dgcksrb1n/image/upload/v1749465423/qoujpnmfjabip1yrllvs.jpg",
      ],
    },
    category: "ecommerce",
  };
}

const Search = async ({ params, searchParams }: CategoryPageProps) => {
  const query = searchParams.query || "";
  const page = searchParams.page || "1";
  const limit = "12";
  if (!query) {
    return (
      <div className="bg-white">
        <Container>
          <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-24">
            <NoResults />
          </div>
        </Container>
      </div>
    );
  }
  const keyword = {
    query,
    colorId: searchParams.colorId,
    sizeId: searchParams.sizeId,
    price: searchParams.price,
    brandId: searchParams.brandId,
    rating: searchParams.rating,
    discount: searchParams.discount,
    page,
    limit,
  };

  // Fetch data in parallel
  const [searchResults, sizes, colors, brands, locationGroups] =
    await Promise.all([
      withRetry(() => getSearchItem(keyword, Number(page), 12)),
      withRetry(() => getSizes()),
      withRetry(() => getColors()),
      withRetry(() => getBrands()),
      withRetry(() => getLocationGroups(params.storeId)),
    ]);

  const sizeMap: { [key: string]: string[] } = {
    TOPWEAR: ["S", "M", "L", "XL", "XXL"],
    BOTTOMWEAR: ["S", "M", "L", "XL", "XXL"],
    FOOTWEAR: ["6", "7", "8", "9", "10", "11"],
    INNERWEARANDSLEEPWEAR: ["S", "M", "L", "XL"],
    MAKEUP: [],
    SKINCARE: [],
    HAIRCARE: [],
    FRAGRANCES: [],
    TELEVISION: [],
  };

  const classification =
    searchResults.products[0]?.category?.classification || "TOPWEAR";
  const validSizes = sizeMap[classification] || [];
  const filteredSizes = sizes.filter((size) => validSizes.includes(size.name));

  const priceRange: PriceRange[] = [
    { id: "0-5000", name: "Rs. 0 to Rs. 5000", value: "0-5000" },
    { id: "5000-10000", name: "Rs. 5000 to Rs. 10000", value: "5000-10000" },
    { id: "10000-30000", name: "Rs. 10000 to Rs. 30000", value: "10000-30000" },
    { id: "30000-80000", name: "Rs. 30000 to Rs. 80000", value: "30000-80000" },
    { id: "80000", name: "Above Rs. 80000", value: "80000" },
  ];

  const ratingRanges = [
    { id: "4", name: "4★ & above", value: "4" },
    { id: "3", name: "3★ & above", value: "3" },
    { id: "2", name: "2★ & above", value: "2" },
    { id: "1", name: "1★ & above", value: "1" },
  ];

  const discountRanges = [
    { id: "70", name: "70% and above", value: "70" },
    { id: "60", name: "60% and above", value: "60" },
    { id: "50", name: "50% and above", value: "50" },
    { id: "40", name: "40% and above", value: "40" },
    { id: "30", name: "30% and above", value: "30" },
    { id: "20", name: "20% and above", value: "20" },
    { id: "10", name: "10% and above", value: "10" },
  ];

  const totalPages = Math.ceil(
    searchResults.pagination.totalProducts / parseInt(limit)
  );

  const breadcrumbItems = [
    // { label: "Home", href: "/" },
    { label: query.toUpperCase(), href: `/search?query=${query}&page=1` },
  ];

  return (
    <div className="bg-white">
      <Breadcrumb items={breadcrumbItems} />
      <Container>
        <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-24">
          <div className="lg:grid lg:grid-cols-5 lg:gap-x-8 mt-14">
            {/* <MobileFilters
              sizes={filteredSizes}
              colors={colors}
              brands={brands}
              priceRanges={priceRange}
              ratingRanges={ratingRanges}
              discountRanges={discountRanges}
            /> */}
            {/* <div className="hidden lg:block lg:border-r">
              <h3 className="mb-5 text-lg font-bold">Filters</h3>
              <Filter valueKey="colorId" name="Colors" data={colors} />
              <Filter valueKey="price" name="Price" data={priceRange} />
              <Filter valueKey="brandId" name="Brands" data={brands} />
              <Filter valueKey="rating" name="Ratings" data={ratingRanges} />
              <Filter
                valueKey="discount"
                name="Discount"
                data={discountRanges}
              />
            </div> */}
            <div className="mt-6 lg:col-span-4 lg:mt-4 min-w-[90vw]">
              {searchResults.products.length === 0 ? (
                <NoResults />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
                  {searchResults?.products?.map((product: any) => (
                    <ProductCard
                      key={product.id}
                      data={product}
                      locationGroups={locationGroups}
                    />
                  ))}
                </div>
              )}
              <div className="w-full flex items-center justify-center pt-12">
                <PaginationComponent
                  currentPage={parseInt(page)}
                  totalPages={totalPages}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Search;
