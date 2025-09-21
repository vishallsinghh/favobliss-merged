"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  categoryChange: (id: string) => void;
}

const CategoryButtons = ({ categories, categoryChange }: Props) => {
  return (
    <div className="w-full max-w-7xl ml-[10px]">
      <Swiper
        className="w-full"
        modules={[FreeMode, Mousewheel]}
        freeMode={true}
        mousewheel={true}
        slidesPerView="auto"
        spaceBetween={12} // Increased spacing from 1 to 12 for better visual separation
        grabCursor={true}
        simulateTouch={true}
        touchStartPreventDefault={false}
        preventClicks={false}
        preventClicksPropagation={false}
      >
        {categories.map((category, index) => (
          <SwiperSlide
            key={index}
            className="flex-shrink-0 w-auto min-w-fit max-w-fit md:max-w-[180px]"
          >
            <button
              className="bg-white rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-2 text-gray-800 font-medium hover:bg-gray-100 transition-colors duration-200 shadow-sm border border-gray-200 text-sm sm:text-base truncate w-full"
              onClick={() => categoryChange(category.id)}
              title={category.name}
            >
              {category.name}
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CategoryButtons;
