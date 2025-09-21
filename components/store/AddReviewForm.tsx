"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaStar, FaCamera, FaTimes, FaVideo } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { useOrder } from "@/hooks/use-order";
import { getSubCategoryById } from "@/actions/get-subcategory"; // Adjust import path
import { Order, OrderProduct } from "@prisma/client";

interface AddReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
  subCategoryId: string;
}

export const AddReviewForm = ({
  productId,
  onReviewSubmitted,
  subCategoryId,
}: AddReviewFormProps) => {
  const { data: session, status } = useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [customUserName, setCustomUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [categoryRatings, setCategoryRatings] = useState<
    { categoryName: string; rating: number }[]
  >([]);
  const { data: orders, isLoading: isOrderLoading } = useOrder();

  const isAuthenticated = status === "authenticated";
  const userId = session?.user?.id;
  const userName = session?.user?.name || "Anonymous User";
  const isAdmin = session?.user?.email === "favoblis@gmail.com";

  const isVerifiedBuyer =
    isAuthenticated &&
    orders?.some(
      (order) =>
        order.isPaid &&
        order.userId === userId &&
        order.orderProducts.some(
          (product: any) => product.productId === productId
        )
    );

  const canSubmitReview = isAdmin || isVerifiedBuyer;

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validImages: File[] = [];
      let hasInvalid = false;

      for (let file of newFiles) {
        if (file.size > MAX_FILE_SIZE) {
          hasInvalid = true;
        } else {
          validImages.push(file);
        }
      }

      if (images.length + validImages.length > 5) {
        toast.error("Maximum 5 images allowed");
        return;
      }

      setImages([...images, ...validImages]);

      if (hasInvalid) {
        toast.error("Some images exceed 10MB limit and were not added.");
      }
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validVideos: File[] = [];
      let hasInvalid = false;

      for (let file of newFiles) {
        if (file.size > MAX_FILE_SIZE) {
          hasInvalid = true;
        } else {
          validVideos.push(file);
        }
      }

      if (videos.length + validVideos.length > 5) {
        toast.error("Maximum 5 videos allowed");
        return;
      }

      setVideos([...videos, ...validVideos]);

      if (hasInvalid) {
        toast.error("Some videos exceed 10MB limit and were not added.");
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please log in to submit a review.");
      return;
    }

    if (!canSubmitReview) {
      toast.error("You must purchase this product to submit a review.");
      return;
    }

    if (rating === 0) {
      toast.error("Please select an overall rating.");
      return;
    }

    if (isAdmin && !customUserName.trim()) {
      toast.error("Please enter a username for the review.");
      return;
    }

    setIsLoading(true);

    try {
      let imageUrls: string[] = [];
      let videoUrls: string[] = [];

      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((image) => formData.append("images", image));

        const uploadResponse = await fetch("/api/v1/image-upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload images");
        }

        const uploadData = await uploadResponse.json();
        imageUrls = uploadData.imageUrls;
      }

      if (videos.length > 0) {
        const formData = new FormData();
        videos.forEach((video) => formData.append("videos", video));

        const uploadResponse = await fetch("/api/v1/video-upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload videos");
        }

        const uploadData = await uploadResponse.json();
        videoUrls = uploadData.videoUrls;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STORE_URL}/api/admin/684315296fa373b59468f387/products/${productId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "omit",
          body: JSON.stringify({
            userName: isAdmin ? customUserName : userName,
            rating,
            text,
            images: imageUrls,
            videos: videoUrls,
            userId,
            categoryRatings,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      toast.success("Review submitted successfully!");

      setRating(0);
      setText("");
      setImages([]);
      setVideos([]);
      setCustomUserName("");
      setCategoryRatings([]);
      setShowForm(false);
      onReviewSubmitted();
    } catch (error) {
      console.error("[ADD_REVIEW_FORM]", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const ratingLabels: Record<number, string> = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  // const fetchSubCategoryId = async () => {
  //   try {
  //     const productResponse = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`
  //     );
  //     if (productResponse.ok) {
  //       const productData = await productResponse.json();
  //       setSubCategoryId(productData.subCategoryId);
  //     }
  //   } catch (error) {
  //     console.error("[FETCH_SUBCATEGORY_ID]", error);
  //   }
  // };

  const fetchSubCategory = async () => {
    if (subCategoryId) {
      try {
        const data = await getSubCategoryById(subCategoryId);
        setCategoryRatings(
          //@ts-ignores
          data.reviewCategories.map((rc: { name: string }) => ({
            categoryName: rc.name,
            rating: 0,
          }))
        );
      } catch (error) {
        console.error("[FETCH_SUBCATEGORY]", error);
      }
    }
  };

  // useEffect(() => {
  //   fetchSubCategoryId();
  // }, [productId]);

  useEffect(() => {
    fetchSubCategory();
  }, [subCategoryId]);

  return (
    <div className="w-full">
      {isOrderLoading ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">Loading order data...</p>
        </div>
      ) : !showForm ? (
        <div className="text-center py-4">
          {canSubmitReview ? (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-orange-400 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              disabled={!isAuthenticated}
            >
              Write a Review
            </Button>
          ) : (
            <p className="text-sm text-gray-500">
              {isAuthenticated ? (
                "You must purchase this product to write a review."
              ) : (
                <>
                  <Link
                    href="/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Sign in
                  </Link>{" "}
                  to write a review after purchasing the product.
                </>
              )}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Write Your Review
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username for Review *
                </label>
                <Input
                  value={customUserName}
                  onChange={(e) => setCustomUserName(e.target.value)}
                  placeholder="Enter username for the review"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating *
              </label>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`h-8 w-8 cursor-pointer transition-colors ${
                        (hoverRating || rating) >= star
                          ? (hoverRating || rating) >= 4
                            ? "text-green-500"
                            : (hoverRating || rating) >= 3
                            ? "text-yellow-400"
                            : "text-red-500"
                          : "text-gray-300"
                      }`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>
                {(hoverRating || rating) > 0 && (
                  <span className="text-sm font-medium text-gray-700 ml-2">
                    {ratingLabels[hoverRating || rating]}
                  </span>
                )}
              </div>
            </div>

            {categoryRatings.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Ratings *
                </label>
                <div className="space-y-4">
                  {categoryRatings.map((cr, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 w-24">
                        {cr.categoryName}:
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={`h-6 w-6 cursor-pointer transition-colors ${
                              cr.rating >= star
                                ? cr.rating >= 4
                                  ? "text-green-500"
                                  : cr.rating >= 3
                                  ? "text-yellow-400"
                                  : "text-red-500"
                                : "text-gray-300"
                            }`}
                            onClick={() => {
                              const newRatings = [...categoryRatings];
                              newRatings[index] = {
                                ...cr,
                                rating: star,
                              };
                              setCategoryRatings(newRatings);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your experience with this product..."
                className="min-h-[120px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {text.length}/1000 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Photos (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  disabled={images.length >= 5}
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer ${
                    images.length >= 5 ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  <FaCamera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {images.length >= 5
                      ? "Maximum 5 images"
                      : "Click to upload images"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG, PNG up to 10MB each
                  </p>
                </label>
              </div>
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {images.map((image, index) => (
                    <div key={`image-${index}`} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <FaTimes className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Videos (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoChange}
                  className="hidden"
                  id="video-upload"
                  disabled={videos.length >= 5}
                />
                <label
                  htmlFor="video-upload"
                  className={`cursor-pointer ${
                    videos.length >= 5 ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  <FaVideo className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {videos.length >= 5
                      ? "Maximum 5 videos"
                      : "Click to upload videos"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    MP4, WebM up to 10MB each
                  </p>
                </label>
              </div>
              {videos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {videos.map((video, index) => (
                    <div key={`video-${index}`} className="relative group">
                      <video
                        src={URL.createObjectURL(video)}
                        className="h-24 w-24 object-cover rounded-lg border"
                        muted
                      />
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <FaTimes className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  rating === 0 ||
                  !text.trim() ||
                  (isAdmin && !customUserName.trim()) ||
                  categoryRatings.some((cr) => cr.rating === 0)
                }
                className="bg-[#ee8c1d] hover:bg-[#ee8c1d] text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Submitting...
                  </div>
                ) : (
                  "Submit Review"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-lg border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
