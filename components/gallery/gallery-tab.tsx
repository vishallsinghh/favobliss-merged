import Image from "next/image";
import { VariantImage } from "@/types";
import { TabsTrigger } from "../ui/tabs";
import { FaPlay } from "react-icons/fa";

interface GalleryTabProps {
  image: VariantImage;
}

export const GalleryTab = ({ image }: GalleryTabProps) => {
  const placeholder = `data:image/svg+xml;base64,Cjxzdmcgd2lkdGg9IjYwMCIgaGVpZ2h0PSI2MDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjZjZmNGY0IiBvZmZzZXQ9IjIwJSIgLz4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iI2VkZWJlYiIgb2Zmc2V0PSI1MCUiIC8+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNmNmY0ZjQiIG9mZnNldD0iNzAlIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiNmNmY0ZjQiIC8+CiAgPHJlY3QgaWQ9InIiIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2cpIiAvPgogIDxhbmltYXRlIHhsaW5rOmhyZWY9IiNyIiBhdHRyaWJ1dGVOYW1lPSJ4IiBmcm9tPSItNjAwIiB0bz0iNjAwIiBkdXI9IjFzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgIC8+Cjwvc3ZnPg==`;

  return (
    <TabsTrigger
      value={image.id}
      className="relative flex aspect-square md:cursor-pointer overflow-hidden"
    >
      {image.mediaType === "IMAGE" ? (
        <Image
          src={image.url}
          alt="Image"
          fill
          className="object-cover aspect-square overflow-hidden"
          placeholder="blur"
          blurDataURL={placeholder}
        />
      ) : (
        <div className="relative w-full h-full flex items-center justify-center bg-black/80">
          <FaPlay className="text-white text-xl" />
        </div>
      )}
    </TabsTrigger>
  );
};
