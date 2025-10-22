"use client";
import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, ShoppingCart, ChevronDown, Plus } from "lucide-react";
import { MdArrowRight, MdArrowDropUp, MdArrowDropDown } from "react-icons/md";
import Link from "next/link";
import useMediaQuery from "@/hooks/use-mediaquery";
import { Popover, Transition } from "@headlessui/react";
import { Address, LocationGroup, MenuCategory, MenuItem } from "@/types";
import { useRouter } from "next/navigation";
import { Account } from "@/components/account";
import { useCart } from "@/hooks/use-cart";
import { formatter } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { useSession } from "next-auth/react";
import { useAddress } from "@/hooks/use-address";
import PincodeDialog from "./PincodeDialog";
import { getLocationGroups } from "@/actions/get-location-group";
import Image from "next/image";

const searchCategories = [
  "All",
  "Air Conditioners",
  "Boat Speakers",
  "Bosch Washing Machines",
  "Carrier Air Conditioners",
  "Daikin Air Conditioners",
  "Electronics",
  "Food Processors",
  "Hair Dryers",
  "Home Appliances",
  "Kitchen Appliances",
  "Personal Care",
  "Television",
  "Washing Machine",
];

interface DynamicHeaderProps {
  categories: any[];
  locationGroups: LocationGroup[];
}

export default function DynamicHeader({
  categories,
  locationGroups,
}: DynamicHeaderProps) {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const router = useRouter();
  const { getItemCount, getTotalAmount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    categories: any[];
    products: any[];
    subCategories?: any[];
    brands?: any[];
    isSuggested?: any;
    pagination: {
      page: number;
      limit: number;
      totalCategories: number;
      totalProducts: number;
    };
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [defaultLocation, setDefaultLocation] = useState({
    city: "Delhi",
    pincode: "110040",
  });
  const { data: session } = useSession();
  const { data: addresses, isLoading: isAddressLoading } = useAddress();
  const [showPincodeDialog, setShowPincodeDialog] = useState(false);

  const itemCount = getItemCount() || 0;
  const totalAmount = getTotalAmount() || 0;
  const isMounted = useRef(true);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node) &&
        !isSearchDropdownOpen
      ) {
        // setSearchResults(null);
        setSearchQuery("");
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchDropdownOpen]);

  useEffect(() => {
    if (!searchQuery) {
      debouncedSearch("");
    }
  }, []);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const updateLocation = () => {
      const locationData = localStorage.getItem("locationData");

      if (locationData) {
        try {
          const parsedData = JSON.parse(locationData);
          if (parsedData.city && parsedData.pincode) {
            setDefaultLocation({
              city: parsedData.city,
              pincode: parsedData.pincode,
            });
            return;
          }
        } catch (error) {
          console.error("Error parsing locationData:", error);
        }
      }

      if (session?.user && addresses?.length && !isAddressLoading) {
        const defaultAddress = addresses.find(
          (address: Address) => address.isDefault
        );

        if (defaultAddress) {
          const addressPincode = String(defaultAddress.zipCode).trim();
          if (addressPincode) {
            const locationData = {
              city: defaultAddress.district || "Unknown",
              pincode: addressPincode,
              state: defaultAddress.state,
              country: "India",
            };

            const currentLocation = JSON.parse(
              localStorage.getItem("locationData") || "{}"
            );
            if (currentLocation.pincode !== addressPincode) {
              localStorage.setItem(
                "locationData",
                JSON.stringify(locationData)
              );
              window.dispatchEvent(new Event("locationDataUpdated"));
            }

            setDefaultLocation({
              city: locationData.city,
              pincode: locationData.pincode,
            });
            return;
          }
        } else {
          const firstAddress = addresses[0];
          const addressPincode = String(firstAddress.zipCode).trim();

          if (addressPincode) {
            const locationData = {
              city: firstAddress.district || "Unknown",
              pincode: addressPincode,
              state: firstAddress.state,
              country: "India",
            };

            const currentLocation = JSON.parse(
              localStorage.getItem("locationData") || "{}"
            );
            if (currentLocation.pincode !== addressPincode) {
              localStorage.setItem(
                "locationData",
                JSON.stringify(locationData)
              );
              window.dispatchEvent(new Event("locationDataUpdated"));
            }

            setDefaultLocation({
              city: locationData.city,
              pincode: locationData.pincode,
            });
            return;
          }
        }
      }
      const fallbackLocation = {
        city: "Delhi",
        pincode: "110040",
        state: "Delhi",
        country: "India",
      };
      localStorage.setItem("locationData", JSON.stringify(fallbackLocation));
      window.dispatchEvent(new Event("locationDataUpdated"));
      setDefaultLocation({
        city: fallbackLocation.city,
        pincode: fallbackLocation.pincode,
      });
    };

    updateLocation();
    window.addEventListener("locationDataUpdated", updateLocation);

    return () => {
      window.removeEventListener("locationDataUpdated", updateLocation);
    };
  }, [session, addresses, isAddressLoading]);

  const debouncedSearch = useDebounce(async (query: string) => {
    if (isMounted.current) {
      setIsSearching(true);
    }

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_STORE_URL
        }/api/admin/684315296fa373b59468f387/search-item?query=${encodeURIComponent(
          query
        )}&page=1&limit=10`,
        { cache: "no-store" }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }
      const data = await response.json();
      setSearchResults(data);
      if (isMounted.current) {
        setSearchResults(data);
      }
    } catch (error) {
      console.error("[SEARCH_FETCH]", error);
      if (isMounted.current) {
        setSearchResults(null);
      }
    } finally {
      if (isMounted.current) {
        setIsSearching(false);
      }
    }
  }, 800);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleResultClick = (href: string) => {
    setShowSearchResults(false);
    router.push(href);
    setSearchQuery("");
  };

  const transformCategoriesToMenuCategories = (
    apiCategories: any[]
  ): MenuCategory[] => {
    return apiCategories?.map((category) => {
      const menuCategory: MenuCategory = {
        name: category.name,
        items: [],
        subItems: undefined,
        link: `/category/${category.id}?page=1`,
        slug: `/category/${category.slug}?page=1`,
      };

      if (category.subCategories && category.subCategories.length > 0) {
        if (category.name === "HOME APPLIANCES") {
          menuCategory.items = category.subCategories.map((subCat: any) => ({
            label: subCat.name,
            href: `/category/${category.slug}?sub=${subCat.slug}?page=1`,
            count: subCat.childSubCategories?.length || 0,
          }));

          const subItemsObj: { [key: string]: MenuItem[] } = {};
          category.subCategories.forEach((subCat: any) => {
            if (
              subCat.childSubCategories &&
              subCat.childSubCategories.length > 0
            ) {
              subItemsObj[subCat.name] = subCat.childSubCategories.map(
                (childSubCat: any) => ({
                  label: childSubCat.name,
                  href: `/category/${category.slug}?sub=${subCat.slug}&childsub=${childSubCat.slug}?page=1`,
                  count: 0,
                })
              );
            }
          });
          menuCategory.subItems = subItemsObj;
        } else {
          menuCategory.items = category.subCategories.map((subCat: any) => ({
            label: subCat.name,
            href: `/category/${category.slug}?sub=${subCat.slug}?page=1`,
            count: subCat.childSubCategories?.length || 0,
          }));

          if (
            category.subCategories.some(
              (subCat: any) => subCat.childSubCategories?.length > 0
            )
          ) {
            const allChildSubCategories: MenuItem[] = [];
            category.subCategories.forEach((subCat: any) => {
              if (
                subCat.childSubCategories &&
                subCat.childSubCategories.length > 0
              ) {
                subCat.childSubCategories.forEach((childSubCat: any) => {
                  allChildSubCategories.push({
                    label: childSubCat.name,
                    href: `/category/${category.slug}?sub=${subCat.slug}&childsub=${childSubCat.slug}?page=1`,
                    count: 0,
                  });
                });
              }
            });
            if (allChildSubCategories.length > 0) {
              menuCategory.subItems = allChildSubCategories;
            }
          }
        }
      } else {
        menuCategory.items = [
          {
            label: category.name,
            href: `/category/${category.slug}`,
            count: 0,
          },
        ];
      }

      return menuCategory;
    });
  };

  const menuCategories = transformCategoriesToMenuCategories(categories);

  // if (isMobile) {
  //   return null;
  // }

  const getRightAlignedCategories = (categories: MenuCategory[]) => {
    if (categories.length >= 2) {
      return categories.slice(-2).map((cat) => cat.name);
    }
    return [];
  };

  const rightAlignedCategories = getRightAlignedCategories(menuCategories);

  function doubleMenuCategory(category: string): boolean {
    const categories = [
      "Electronics",
      "Kitchen Appliances",
      "Computer & Printer",
    ];
    return categories.includes(category);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(
        `/search?query=${encodeURIComponent(searchQuery.trim())}&page=1`
      );
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

  const renderHomeAppliancesMenu = (category: MenuCategory, close: any) => {
    return (
      <div className="py-2">
        {category.items.map((item) => (
          <div key={item.label} className="relative group w-max">
            <>
              <div className="flex items-center justify-between hover:bg-gray-50 px-4 py-2 cursor-pointer w-52">
                <div className="flex gap-2 items-center">
                  <Link
                    href={item.href}
                    className="text-xs text-black flex-1"
                    onClick={() => close()}
                  >
                    {item.label}
                  </Link>
                  <span className="bg-gray-500 text-white text-xs rounded-full text-center p-[2px] min-w-5 min-h-5 text-[10px] border border-transparent">
                    {item.count}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-lg">
                    {<MdArrowRight />}
                  </span>
                </div>
              </div>

              <div className="absolute left-full top-0 ml-1 w-max bg-white border border-gray-200 rounded-md shadow-lg z-30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  {category.subItems &&
                    typeof category.subItems === "object" &&
                    !Array.isArray(category.subItems) &&
                    category.subItems[item.label] &&
                    category.subItems[item.label].map((subItem: any) => (
                      <Link
                        key={subItem.label}
                        href={subItem.href}
                        className="flex items-center gap-2 hover:bg-gray-50 px-4 py-2 text-xs text-black hover:text-blue-800"
                        onClick={() => close()}
                      >
                        <span>{subItem.label}</span>
                        <span className="bg-gray-500 text-white text-xs rounded-full text-center p-[2px] min-w-5 min-h-5 text-[10px] border border-transparent">
                          {subItem.count}
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            </>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white hidden md:block">
      <div className="max-x-full px-4 md:px-6 m-auto pt-[18px] pb-[4px]">
        <header className="bg-black text-white py-2 px-6 flex items-center justify-between shadow-md border border-transparent rounded-2xl">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Image
                src="/assets/logo.jpg"
                width="200"
                height="60"
                alt="Favobliss"
                title="Favobliss"
                // className="max-w-full"
                loading="lazy"
              />
            </Link>
          </div>
          <div
            className="flex-1 mx-6 max-w-2xl relative"
            ref={searchDropdownRef}
          >
            <div className="relative flex bg-white rounded-md overflow-hidden">
              <div className="relative">
                <button
                  onClick={() => setIsSearchDropdownOpen(!isSearchDropdownOpen)}
                  className="flex items-center gap-1 bg-[rgb(238,140,29)] text-white px-4 py-2.5 text-sm font-medium hover:bg-[rgb(238,140,29)] transition-colors min-w-max"
                >
                  <span>{selectedCategory}</span>
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform ${
                      isSearchDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search for Product Brand..."
                  className="w-full py-2.5 px-4 text-black focus:outline-none text-sm"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSearchResults(true)}
                  onKeyDown={handleKeyDown}
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded transition-colors">
                  <Search size={24} className="text-black" />
                </button>
              </div>
            </div>

            {/* {isSearchDropdownOpen && (
              <div className="absolute top-full left-0 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-[9999] max-h-60 overflow-y-auto mt-1">
                <div className="py-1">
                  {searchCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsSearchDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )} */}
            {isSearchDropdownOpen && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-[9999] max-h-96 overflow-y-auto mt-1">
                <div className="p-4">
                  {/* All Categories Option */}
                  <div className="mb-4">
                    <button
                      onClick={() => {
                        setSelectedCategory("All");
                        setIsSearchDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors border-b border-gray-200"
                    >
                      All Categories
                    </button>
                  </div>

                  {/* Categories Grid */}
                  <div className="space-y-6">
                    {categories.map((category) => (
                      <div key={category.id} className="space-y-3">
                        {/* Category Header */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCategory(category.name);
                              setIsSearchDropdownOpen(false);
                            }}
                            className="text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                          >
                            {category.name}
                          </button>
                        </div>

                        {/* Subcategories Grid */}
                        {category.subCategories &&
                          category.subCategories.length > 0 && (
                            <div className="grid grid-cols-4 gap-3">
                              {category.subCategories.map(
                                (subCategory: any) => (
                                  <button
                                    key={subCategory.id}
                                    onClick={() => {
                                      setSelectedCategory(subCategory.name);
                                      setIsSearchDropdownOpen(false);
                                      router.push(
                                        `/category/${category.slug}?sub=${subCategory.slug}&page=1`
                                      );
                                    }}
                                    className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                                  >
                                    <div className="w-12 h-12 mb-2 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                      {subCategory.icon ? (
                                        <img
                                          src={subCategory.icon}
                                          alt={subCategory.name}
                                          className="w-full h-full object-cover"
                                          loading="lazy"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-md flex items-center justify-center">
                                          <span className="text-white text-xs font-bold">
                                            {subCategory.name
                                              .charAt(0)
                                              .toUpperCase()}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    {/* Subcategory Name */}
                                    <span className="text-xs text-gray-700 text-center leading-tight group-hover:text-gray-900">
                                      {subCategory.name}
                                    </span>
                                  </button>
                                )
                              )}

                              {/* Show more button if there are more than 8 subcategories */}
                              {category.subCategories.length > 0 && (
                                <button
                                  onClick={() => {
                                    setSelectedCategory(category.name);
                                    setIsSearchDropdownOpen(false);
                                    router.push(
                                      `/category/${category.slug}?page=1`
                                    );
                                  }}
                                  className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <div className="w-12 h-12 mb-2 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Plus size={20} className="text-gray-500" />
                                  </div>
                                  <span className="text-xs text-gray-700 text-center leading-tight">
                                    View All
                                  </span>
                                </button>
                              )}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] mt-1 overflow-hidden">
                <div className="flex min-h-[400px] max-h-[500px]">
                  {/* Left Side - Suggestions */}
                  <div className="w-1/2 border-r border-gray-200">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {searchQuery || !searchResults?.isSuggested
                          ? "Suggestions"
                          : "Explore These Categories"}
                      </h3>
                    </div>
                    <div className="overflow-y-auto max-h-[300px]">
                      {isSearching ? (
                        <div className="px-4 py-3 text-sm text-gray-700">
                          Searching...
                        </div>
                      ) : (
                        <div className="py-2">
                          {/* Categories */}
                          {(searchResults?.categories ?? []).length > 0 && (
                            <>
                              {searchResults?.categories.map((category) => (
                                <button
                                  key={category.id}
                                  onClick={() =>
                                    handleResultClick(
                                      `/category/${category.slug}?page=1`
                                    )
                                  }
                                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors border-b border-gray-100 last:border-b-0"
                                >
                                  {category.name}
                                </button>
                              ))}
                            </>
                          )}

                          {/* Subcategories */}
                          {(searchResults?.subCategories ?? []).length > 0 && (
                            <>
                              {searchResults?.subCategories?.map(
                                (subCategory) => (
                                  <button
                                    key={subCategory.id}
                                    onClick={() =>
                                      handleResultClick(
                                        `/category/${
                                          subCategory.category?.slug ||
                                          "unknown"
                                        }?sub=${subCategory.slug}?page=1`
                                      )
                                    }
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors border-b border-gray-100 last:border-b-0"
                                  >
                                    {subCategory.name}
                                  </button>
                                )
                              )}
                            </>
                          )}

                          {/* Brands */}
                          {(searchResults?.brands ?? []).length > 0 && (
                            <>
                              {searchResults?.brands?.map((brand) => (
                                <button
                                  key={brand.id}
                                  onClick={() =>
                                    handleResultClick(
                                      `/brand/${brand.slug}?page=1`
                                    )
                                  }
                                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors border-b border-gray-100 last:border-b-0"
                                >
                                  {brand.name}
                                </button>
                              ))}
                            </>
                          )}

                          {/* No results message */}
                          {searchQuery &&
                            !isSearching &&
                            (searchResults?.categories ?? []).length === 0 &&
                            (searchResults?.subCategories ?? []).length === 0 &&
                            (searchResults?.brands ?? []).length === 0 &&
                            (searchResults?.products ?? []).length === 0 && (
                              <div className="px-4 py-6 text-sm text-gray-500 text-center">
                                No suggestions found
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Products */}
                  <div className="w-1/2">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {searchQuery || !searchResults?.isSuggested
                          ? "Products"
                          : "Popular Products"}
                      </h3>
                    </div>
                    <div className="overflow-y-auto max-h-[300px]">
                      {isSearching ? (
                        <div className="px-4 py-3 text-sm text-gray-700">
                          Loading products...
                        </div>
                      ) : (
                        <div className="py-2">
                          {(searchResults?.products ?? []).length > 0 ? (
                            <>
                              {searchResults?.products.map((product) => (
                                <button
                                  key={product.id}
                                  onClick={() =>
                                    handleResultClick(
                                      `/${product?.variants[0]?.slug}`
                                    )
                                  }
                                  className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex items-center gap-3">
                                    {product.variants[0]?.images[0] ? (
                                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <img
                                          src={
                                            product.variants[0].images[0].url
                                          }
                                          alt={product.variants[0].name}
                                          className="w-10 h-10 object-contain rounded"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <div className="w-8 h-8 bg-gray-300 rounded"></div>
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                        {product.variants[0].name}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </>
                          ) : (
                            <>
                              {/* No products message */}
                              {searchQuery &&
                                !isSearching &&
                                (searchResults?.products ?? []).length ===
                                  0 && (
                                  <div className="px-4 py-6 text-sm text-gray-500 text-center">
                                    No products found
                                  </div>
                                )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-6">
            <Account />

            <div
              className="hidden md:flex items-center space-x-1 text-sm cursor-pointer"
              onClick={() => setShowPincodeDialog(true)}
            >
              <MapPin size={24} />
              <span>
                {defaultLocation?.city}, {defaultLocation?.pincode}
              </span>
            </div>

            <Link
              href="/checkout/cart"
              className="flex items-center gap-2 text-sm border border-customGray rounded-md pr-[12px]"
            >
              <div className="flex flex-col">
                <span className="text-sm p-[10px]">
                  {itemCount} item(s) - {formatter.format(totalAmount)}
                </span>
              </div>
              <ShoppingCart size={24} />
            </Link>
          </div>
        </header>
        {isSearchDropdownOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsSearchDropdownOpen(false)}
          />
        )}
        {/* <nav className="bg-black text-white py-2 px-6 flex justify-between items-center shadow-md flex-wrap gap-2 gap-y-5 max-w-7xl mx-auto">
          {menuCategories.map((category) => (
            <Popover key={category.name} className="relative">
              {({ open, close }) => (
                <>
                  <div
                    onMouseEnter={() => {
                      const button = document.getElementById(
                        `popover-button-${category.name}`
                      );
                      if (button) button.click();
                    }}
                    onMouseLeave={() => close()}
                  >
                    <button
                      onClick={() => router.push(category.slug)}
                      className="w-full h-full px-3 text-sm hover:text-gray-300 focus:outline-none text-left"
                    >
                      {category.name.toUpperCase()}
                    </button>

                    <Popover.Button
                      id={`popover-button-${category.name}`}
                      className="sr-only"
                    >
                      {category.name.toUpperCase()}
                    </Popover.Button>
                  </div>

                  <Transition
                    show={open}
                    as={React.Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Popover.Panel
                      static
                      className={`absolute mt-2 bg-white text-black rounded-md shadow-lg z-10 ${
                        rightAlignedCategories.includes(category.name)
                          ? "right-0"
                          : "left-0"
                      } ${
                        category.name === "HOME APPLIANCES" ? "w-max" : "w-96"
                      }`}
                      onMouseEnter={() => {
                        const button = document.getElementById(
                          `popover-button-${category.name}`
                        );
                        if (button) button.click();
                      }}
                      onMouseLeave={() => close()}
                    >
                      {category.name === "HOME APPLIANCES"
                        ? renderHomeAppliancesMenu(category, close)
                        : (category.items.length > 0 ||
                            (Array.isArray(category.subItems) &&
                              category.subItems.length > 0)) && (
                            <div
                              className={`p-4 ${
                                doubleMenuCategory(category.name)
                                  ? "grid grid-cols-2 gap-4"
                                  : "unset"
                              }`}
                            >
                              <div>
                                <h3 className="text-orange-600 font-semibold mb-2">
                                  {category.name === "ELECTRONICS" ||
                                  category.name === "Kitchen Appliances" ||
                                  category.name === "Computer & Printer"
                                    ? "Top Categories"
                                    : category.name}
                                </h3>
                                <div
                                  className={`w-full ${
                                    doubleMenuCategory(category.name)
                                      ? "unset"
                                      : "grid grid-cols-2 gap-x-2"
                                  }`}
                                >
                                  {category.items.map((item) => (
                                    <div key={item.label} className="relative">
                                      <Link
                                        href={item.href}
                                        className="block text-sm text-blue-600 hover:underline hover:text-blue-800 py-1"
                                        onClick={() => close()}
                                      >
                                        {item.label}{" "}
                                        {item.count !== undefined &&
                                          `(${item.count})`}
                                      </Link>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {category.subItems &&
                                Array.isArray(category.subItems) &&
                                category.subItems.length > 0 && (
                                  <div>
                                    <h3 className="text-orange-600 font-semibold mb-2">
                                      {category.name === "ELECTRONICS"
                                        ? "Air Coolers"
                                        : category.name === "Computer & Printer"
                                        ? "Computer Accessories"
                                        : "Top Categories"}
                                    </h3>
                                    {category.subItems.map((subItem) => (
                                      <Link
                                        key={subItem.label}
                                        href={subItem.href}
                                        className="block text-sm text-blue-600 hover:underline hover:text-blue-800 py-1"
                                        onClick={() => close()}
                                      >
                                        {subItem.label}{" "}
                                        {subItem.count !== undefined &&
                                          `(${subItem.count})`}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                            </div>
                          )}
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
          ))}
        </nav> */}
      </div>
      <PincodeDialog
        open={showPincodeDialog}
        onOpenChange={setShowPincodeDialog}
        locationGroups={locationGroups}
      />
    </div>
  );
}
