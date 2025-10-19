"use client";

import Image from "next/image";
import { Product, ProductApiResponse, Variant, VariantImage } from "@/types";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { GalleryTab } from "./gallery-tab";
import { useShareModal } from "@/hooks/use-share-modal";
import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { ActionButtons } from "../store/ActionButton";
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { PiShareFatFill } from "react-icons/pi";
import { VideoPlayer } from "../store/VideoPlayer";

interface GalleryProps {
  images: VariantImage[];
  product: ProductApiResponse;
  selectedVariant: Variant;
  locationPrice: {
    price: number;
    mrp: number;
  };
  isProductAvailable: boolean;
  selectedLocationGroupId: string | null;
  locationPinCode: string | null;
  deliveryInfo: {
    location: string;
    estimatedDelivery: number;
    isCodAvailable: boolean;
  } | null;
}

interface VideoState {
  isPlaying: boolean;
  showControls: boolean;
  isLoading: boolean;
  isMuted: boolean;
  duration: number;
  currentTime: number;
}

export const Gallery = ({
  images,
  product,
  selectedLocationGroupId,
  selectedVariant,
  isProductAvailable,
  locationPrice,
  deliveryInfo,
  locationPinCode,
}: GalleryProps) => {
  const { onOpen } = useShareModal();
  const [activeTab, setActiveTab] = useState(images[0]?.id || "");
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [videoStates, setVideoStates] = useState<Record<string, VideoState>>(
    {}
  );
  const controlsTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const [activeIndex, setActiveIndex] = useState(0);

  const placeholder = `data:image/svg+xml;base64,Cjxzdmcgd2lkdGg9IjYwMCIgaGVpZ2h0PSI2MDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjZjZmNGY0IiBvZmZzZXQ9IjIwJSIgLz4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iI2VkZWJlYiIgb2Zmc2V0PSI1MCUiIC8+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNmNmY0ZjQiIG9mZnNldD0iNzAlIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiNmNmY0ZjQiIC8+CiAgPHJlY3QgaWQ9InIiIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2cpIiAvPgogIDxhbmltYXRlIHhsaW5rOmhyZWY9IiNyIiBhdHRyaWJ1dGVOYW1lPSJ4IiBmcm9tPSItNjAwIiB0bz0iNjAwIiBkdXI9IjFzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgIC8+Cjwvc3ZnPg==`;

  useEffect(() => {
    if (images.length > 0) {
      setActiveTab(images[0].id);
      setActiveIndex(0);

      // Initialize video states
      const initialStates: Record<string, VideoState> = {};
      images.forEach((media) => {
        if (media.mediaType === "VIDEO") {
          initialStates[media.id] = {
            isPlaying: false,
            showControls: true,
            isLoading: false,
            isMuted: true,
            duration: 0,
            currentTime: 0,
          };
        }
      });
      setVideoStates(initialStates);
    }
  }, [images]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(controlsTimeoutRef.current).forEach(clearTimeout);
    };
  }, []);

  const updateVideoState = (mediaId: string, updates: Partial<VideoState>) => {
    setVideoStates((prev) => ({
      ...prev,
      [mediaId]: { ...prev[mediaId], ...updates },
    }));
  };

  const handleVideoClick = (index: number, mediaId: string) => {
    const video = videoRefs.current[index];
    if (!video) return;

    const currentState = videoStates[mediaId];

    if (currentState?.isPlaying) {
      video.pause();
      updateVideoState(mediaId, { isPlaying: false, showControls: true });
      // Clear existing timeout
      if (controlsTimeoutRef.current[mediaId]) {
        clearTimeout(controlsTimeoutRef.current[mediaId]);
      }
    } else {
      updateVideoState(mediaId, { isLoading: true });

      video
        .play()
        .then(() => {
          updateVideoState(mediaId, {
            isPlaying: true,
            showControls: true,
            isLoading: false,
          });

          // Hide controls after 3 seconds when playing
          controlsTimeoutRef.current[mediaId] = setTimeout(() => {
            updateVideoState(mediaId, { showControls: false });
          }, 3000);
        })
        .catch((error) => {
          console.error("Video play failed:", error);
          updateVideoState(mediaId, { isLoading: false });
        });
    }
  };

  const handleVideoMouseEnter = (mediaId: string) => {
    updateVideoState(mediaId, { showControls: true });

    // Clear existing timeout
    if (controlsTimeoutRef.current[mediaId]) {
      clearTimeout(controlsTimeoutRef.current[mediaId]);
    }
  };

  const handleVideoMouseLeave = (mediaId: string) => {
    // Only hide controls if video is playing
    if (videoStates[mediaId]?.isPlaying) {
      controlsTimeoutRef.current[mediaId] = setTimeout(() => {
        updateVideoState(mediaId, { showControls: false });
      }, 2000);
    }
  };

  const handleVideoEnded = (mediaId: string) => {
    updateVideoState(mediaId, { isPlaying: false, showControls: true });

    // Clear timeout
    if (controlsTimeoutRef.current[mediaId]) {
      clearTimeout(controlsTimeoutRef.current[mediaId]);
    }
  };

  const handleTimeUpdate = (index: number, mediaId: string) => {
    const video = videoRefs.current[index];
    if (video) {
      updateVideoState(mediaId, {
        currentTime: video.currentTime,
        duration: video.duration || 0,
      });
    }
  };

  const handleSeek = (index: number, percentage: number) => {
    const video = videoRefs.current[index];
    if (video && video.duration) {
      video.currentTime = (percentage / 100) * video.duration;
    }
  };

  const toggleMute = (index: number, mediaId: string) => {
    const video = videoRefs.current[index];
    if (video) {
      video.muted = !video.muted;
      updateVideoState(mediaId, { isMuted: video.muted });
    }
  };

  if (!images.length) {
    return (
      <div className="w-full aspect-[3/4] relative bg-gray-50">
        <Image
          src="/placeholder-image.jpg"
          alt="Placeholder Image"
          fill
          className="object-cover aspect-[3/4]"
          onLoad={() => console.log("Placeholder image loaded")}
        />
      </div>
    );
  }

  const VideoControls = ({
    mediaId,
    index,
    isMobile = false,
  }: {
    mediaId: string;
    index: number;
    isMobile?: boolean;
  }) => {
    const state = videoStates[mediaId];
    if (!state) return null;

    const progress =
      state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

    return (
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          state.showControls
            ? "bg-black/20 opacity-100"
            : "bg-transparent opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Center Play/Pause Button */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          onClick={() => handleVideoClick(index, mediaId)}
        >
          {state.isLoading ? (
            <div className="bg-black/70 rounded-full p-4">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div
              className={`bg-black/70 rounded-full p-4 transition-all duration-200 ${
                isMobile ? "active:scale-95" : "hover:scale-110"
              }`}
            >
              {state.isPlaying ? (
                <FaPause className="text-white text-2xl" />
              ) : (
                <FaPlay className="text-white text-2xl ml-1" />
              )}
            </div>
          )}
        </div>

        {/* Bottom Controls Bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${
            state.showControls ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {/* Progress Bar */}
          <div className="mb-3">
            <div
              className="h-1 bg-white/30 rounded-full cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percentage = ((e.clientX - rect.left) / rect.width) * 100;
                handleSeek(index, percentage);
              }}
            >
              <div
                className="h-full bg-white rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleVideoClick(index, mediaId)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isMobile ? "active:bg-white/20" : "hover:bg-white/20"
                }`}
              >
                {state.isPlaying ? (
                  <FaPause className="text-sm" />
                ) : (
                  <FaPlay className="text-sm" />
                )}
              </button>

              <button
                onClick={() => toggleMute(index, mediaId)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isMobile ? "active:bg-white/20" : "hover:bg-white/20"
                }`}
              >
                {state.isMuted ? (
                  <FaVolumeMute className="text-sm" />
                ) : (
                  <FaVolumeUp className="text-sm" />
                )}
              </button>
            </div>

            {/* Time Display */}
            <div className="text-xs font-medium">
              {Math.floor(state.currentTime / 60)}:
              {Math.floor(state.currentTime % 60)
                .toString()
                .padStart(2, "0")}{" "}
              /&nbsp;
              {Math.floor(state.duration / 60)}:
              {Math.floor(state.duration % 60)
                .toString()
                .padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const isNearActive = (index: number) => Math.abs(index - activeIndex) <= 1;

  const MobileGallery = () => (
    <div className="block md:hidden relative mt-2 pb-4 md:pb-12">
      <Swiper
        spaceBetween={10}
        pagination={{ clickable: true }}
        modules={[Pagination]}
        className="w-full swiper-pagination-bottom"
        style={{ height: "auto", minHeight: "400px", maxHeight: "500px" }}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
      >
        {images.map((media, index) => {
          const shouldLoad = isNearActive(index);

          return (
            <SwiperSlide key={media.id}>
              <div
                className="relative w-full bg-[#f6f4f4] rounded-2xl"
                style={{ height: "400px", maxHeight: "500px" }}
              >
                {media.mediaType === "IMAGE" ? (
                  <>
                    <Image
                      src={media.url}
                      alt="Variant Image"
                      width={600}
                      height={600}
                      className="object-contain rounded-2xl"
                      priority={index === 0}
                      loading={index > 0 ? "lazy" : "eager"}
                      placeholder="blur"
                      blurDataURL={placeholder}
                    />
                    <div
                      className="absolute h-10 w-10 top-4 right-4 bg-white rounded-full flex items-center justify-center cursor-pointer"
                      onClick={onOpen}
                    >
                      <PiShareFatFill className="text-zinc-700 h-6 w-6" />
                    </div>
                  </>
                ) : (
                  <div
                    className="relative w-full h-full flex items-center justify-center bg-[#f6f4f4]"
                    onTouchStart={() => handleVideoMouseEnter(media.id)}
                    onTouchEnd={() => handleVideoMouseLeave(media.id)}
                  >
                    <video
                      // ref={(el) => (videoRefs.current[index] = el)}
                      src={shouldLoad ? media.url : undefined}
                      // poster={placeholder}
                      className="object-contain max-h-full w-full rounded-2xl"
                      // muted={videoStates[media.id]?.isMuted}
                      muted
                      controls

                      // loop
                      // playsInline
                      // onEnded={() => handleVideoEnded(media.id)}
                      // onError={(e) =>
                      //   console.error(`Video ${media.id} error:`, e)
                      // }
                      // onLoadStart={() =>
                      //   updateVideoState(media.id, { isLoading: true })
                      // }
                      // onCanPlay={() => {
                      //   updateVideoState(media.id, { isLoading: false });
                      // }}
                      // onTimeUpdate={() => handleTimeUpdate(index, media.id)}
                      // onLoadedMetadata={() => {
                      //   const video = videoRefs.current[index];
                      //   if (video) {
                      //     updateVideoState(media.id, {
                      //       duration: video.duration,
                      //     });
                      //   }
                      // }}
                    />

                    {/* <VideoControls
                      mediaId={media.id}
                      index={index}
                      isMobile={true}
                    /> */}
                    {/* <VideoPlayer videoUrl={media.url} controls={true} /> */}
                    <div
                      className="absolute h-10 w-10 top-4 right-4 bg-white rounded-full flex items-center justify-center cursor-pointer"
                      onClick={onOpen}
                    >
                      <PiShareFatFill className="text-zinc-700 h-6 w-6" />
                    </div>
                  </div>
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );

  const DesktopGallery = () => (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="hidden md:flex flex-col-reverse md:px-24 lg:px-20 xl:px-28 relative"
      role="div"
    >
      <div className="mx-auto mt-6 lg:mt-2 w-full max-w-2xl lg:max-w-none lg:absolute top-0 left-0 lg:w-16">
        <TabsList className="grid grid-cols-4 lg:grid-cols-1 gap-4 md:gap-6 lg:gap-4 h-auto bg-white overflow-x-scroll md:overflow-y-scroll max-h-[60vh] scrollbar-hide">
          {images.map((media) => (
            <GalleryTab key={media.id} image={media} />
          ))}
        </TabsList>
      </div>
      {images.map((media, index) => {
        if (activeTab !== media.id) return null;

        return (
          <TabsContent
            key={media.id}
            value={media.id}
            className="relative overflow-hidden bg-[#f6f4f4] h-auto min-h-[500px] max-h-[600px] rounded-2xl"
          >
            {media.mediaType === "IMAGE" ? (
              <>
                <Image
                  src={media.url}
                  alt="Variant Image"
                  width={600}
                  height={600}
                  className="w-full h-auto object-contain object-top max-h-full rounded-2xl"
                  priority={index === 0}
                  loading={index > 0 ? "lazy" : "eager"}
                  placeholder="blur"
                  blurDataURL={placeholder}
                />
                <div
                  className="absolute h-10 w-10 top-4 right-4 bg-white rounded-full flex items-center justify-center md:cursor-pointer"
                  onClick={onOpen}
                >
                  <PiShareFatFill className="text-zinc-700 h-6 w-6" />
                </div>
              </>
            ) : (
              <div
                className="relative w-full h-full flex items-center justify-center bg-[#f6f4f4] min-h-[500px]"
                // onMouseEnter={() => handleVideoMouseEnter(media.id)}
                // onMouseLeave={() => handleVideoMouseLeave(media.id)}
              >
                {/* <VideoPlayer videoUrl={media.url} controls={true} /> */}
                <video
                  // ref={(el) => (videoRefs.current[index] = el)}
                  src={media.url}
                  // poster={placeholder}
                  className="object-contain max-h-full w-full h-auto rounded-2xl"
                  // muted={videoStates[media.id]?.isMuted}
                  muted
                  controls
                  // playsInline
                  // onEnded={() => handleVideoEnded(media.id)}
                  // onError={(e) => console.error(`Video ${media.id} error:`, e)}
                  // onLoadStart={() =>
                  //   updateVideoState(media.id, { isLoading: true })
                  // }
                  // onCanPlay={() => {
                  //   updateVideoState(media.id, { isLoading: false });
                  // }}
                  // onTimeUpdate={() => handleTimeUpdate(index, media.id)}
                  // onLoadedMetadata={() => {
                  //   const video = videoRefs.current[index];
                  //   if (video) {
                  //     updateVideoState(media.id, {
                  //       duration: video.duration,
                  //     });
                  //   }
                  // }}
                />

                {/* <VideoControls mediaId={media.id} index={index} /> */}
                <div
                  className="absolute h-10 w-10 top-4 right-4 bg-white rounded-full flex items-center justify-center md:cursor-pointer"
                  // onClick={onOpen}
                >
                  <PiShareFatFill className="text-zinc-700 h-6 w-6" />
                </div>
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );

  return (
    <div className="w-full">
      <MobileGallery />
      <DesktopGallery />
      <div className="mt-4 max-w-sm mx-auto hidden md:block">
        <ActionButtons
          productData={product}
          selectedVariant={selectedVariant}
          locationPrice={locationPrice}
          selectedLocationGroupId={selectedLocationGroupId}
          isProductAvailable={isProductAvailable}
          className="w-full"
          deliveryInfo={deliveryInfo}
          locationPinCode={locationPinCode}
        />
      </div>
    </div>
  );
};

const swiperStyles = `
  .swiper-pagination-bottom .swiper-pagination {
    bottom: -10px !important;
  }
  .swiper-pagination-bullet {
    background: rgba(0, 0, 0, 0.5) !important;
    opacity: 0.5 !important;
  }
  .swiper-pagination-bullet-active {
    background: #000 !important;
    opacity: 1 !important;
  }
`;
