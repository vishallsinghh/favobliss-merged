"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";

const defaultCategoryImages = {
  "air conditioners": "/assets/category/air-conditioner.png",
  television: "/assets/category/television.png",
  "washing machine": "/assets/category/washing-machine.png",
  "home appliances": "/assets/category/air-conditioner.png",
  "kitchen appliances": "/assets/category/kitchen-appliance.png",
  laptop: "/assets/category/computer-printer.png",
  "personal care": "/assets/category/personal-care.png",
  "air purifier": "/assets/category/air-purifier.png",
  "water purifiers": "/assets/category/water-purifier.png",
  "home audio": "/assets/category/home-audio.png",
  "air coolers": "/assets/category/air-cooler.png",
  watch: "/assets/category/watch.png",
  refrigerator: "/assets/category/refrigerator.png",
  mobiles: "/assets/category/mobiles.png",
  "gas stove": "/assets/category/gas-stove.png",
  chimney: "/assets/category/chimney.png",
  printers: "/assets/category/printer.png",
};

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
}

export function CategorySlider(props: Props) {
  const { categories } = props;
  const router = useRouter();

  const handleCategoryClick = (slug: string) => {
    router.push(`/category/${slug}?page=1`);
  };

  const getImageSrc = (category: Category) => {
    const lowerCaseName = category.name.toLowerCase();
    if (defaultCategoryImages.hasOwnProperty(lowerCaseName)) {
      return defaultCategoryImages[
        lowerCaseName as keyof typeof defaultCategoryImages
      ];
    }
    return "/assets/category/air-conditioner.png";
  };

  // Mobile/Tablet Swiper Layout
  const MobileSwiperLayout = () => (
    <div className="block md:hidden w-full bg-white py-5 md:py-8 pb-0">
      <div className="px-4">
        <Swiper
          className="w-full"
          modules={[FreeMode, Mousewheel]}
          freeMode={true}
          mousewheel={true}
          slidesPerView="auto"
          spaceBetween={2}
          grabCursor={true}
        >
          {categories.map((category) => (
            <SwiperSlide
              key={category.id}
              className="flex-shrink-0 w-[100px] max-w-fit"
            >
              <div
                className="group cursor-pointer flex flex-col items-center"
                onClick={() => handleCategoryClick(category.slug)}
              >
                <div className="relative w-20 h-20 sm:w-20 sm:h-20 mx-auto mb-2 overflow-hidden transition-all duration-300 bg-gray-50 rounded-lg">
                  <Image
                    src={getImageSrc(category)}
                    alt={category.name}
                    fill
                    className="object-cover p-1 group-hover:opacity-90 transition-opacity duration-300"
                    sizes="56px"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/assets/category/air-conditioner.png";
                    }}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );

  // Desktop Swiper Layout
  const DesktopSwiperLayout = () => (
    <div className="hidden md:block w-full bg-white py-8 max-w-7xl mx-auto">
      <Swiper
        className="w-full px-4"
        modules={[FreeMode, Mousewheel]}
        freeMode={true}
        mousewheel={true}
        slidesPerView="auto"
        spaceBetween={1}
        grabCursor={true}
      >
        {categories.map((category) => (
          <SwiperSlide
            key={category.id}
            className="flex-shrink-0 w-[12.5%] min-w-[120px] max-w-[160px]"
          >
            <div
              className="group cursor-pointer"
              onClick={() => handleCategoryClick(category.slug)}
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 mx-auto mb-3 overflow-hidden transition-all duration-300">
                <Image
                  src={getImageSrc(category)}
                  alt={category.name}
                  fill
                  className="object-cover p-2 group-hover:opacity-90 transition-opacity duration-300"
                  sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                  onError={(e) => {
                    e.currentTarget.src =
                      "/assets/category/air-conditioner.png";
                  }}
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );

  return (
    <>
      <MobileSwiperLayout />
      <DesktopSwiperLayout />
    </>
  );
}
