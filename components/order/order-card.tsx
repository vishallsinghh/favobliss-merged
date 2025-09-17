// Updated frontend: app/order/order-card.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Comment, OrderProduct } from "@prisma/client";
import { format } from "date-fns";
import { formatter } from "@/lib/utils";
import axios from "axios";
import { cn, formatDeliveryDate } from "@/lib/utils";
import {
  Package,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Rating } from "./rating";
import { Review } from "./review";
import { toast } from "sonner";
import { CancelOrderButton } from "../store/CancelOrderButton";
import { useState, useRef } from "react";
import { InvoiceData } from "@/types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Invoice from "../store/Invoice";
import { getInvoice } from "@/actions/get-invoice";

interface OrderCardProps {
  data: OrderProduct & {
    color: string;
    comment: Comment | null;
  };
  date: Date;
  paid: boolean;
  status: string;
  orderNumber: string | null;
  estimatedDeliveryDays: number | null;
  orderId: string;
  mrp: number | null;
  noOfProducts: number;
  price: number | null;
  paymentMethod: string | null;
  onCancel: () => void;
}

export const OrderCard = ({
  data,
  date,
  paid,
  status,
  orderNumber,
  estimatedDeliveryDays,
  orderId,
  noOfProducts,
  mrp,
  price,
  paymentMethod,
  onCancel,
}: OrderCardProps) => {
  const router = useRouter();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          icon: Clock,
          label: "Pending",
        };
      case "PROCESSING":
        return {
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          icon: Package,
          label: "Processing",
        };
      case "SHIPPED":
        return {
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
          icon: Truck,
          label: "Shipped",
        };
      case "OUTOFDELIVERY":
        return {
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          icon: Truck,
          label: "Out for Delivery",
        };
      case "DELIVERED":
        return {
          color: "text-emerald-600",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          icon: CheckCircle,
          label: "Delivered",
        };
      case "CANCELLED":
      case "RETURNED":
      case "REFUNDED":
        return {
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          icon: XCircle,
          label:
            status === "CANCELLED"
              ? "Cancelled"
              : status === "RETURNED"
              ? "Returned"
              : "Refunded",
        };
      default:
        return {
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          icon: Package,
          label: "Unknown",
        };
    }
  };

  const handleDownloadInvoice = async () => {
    setIsLoading(true);
    try {
      const data = await getInvoice(orderId);
      setInvoiceData(data);

      // Wait for the component to render with the new data
      setTimeout(() => {
        if (invoiceRef.current) {
          html2canvas(invoiceRef.current, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 0;
            pdf.addImage(
              imgData,
              "PNG",
              imgX,
              imgY,
              imgWidth * ratio,
              imgHeight * ratio
            );
            pdf.save(`invoice_${data.soldBy.invoiceNo}.pdf`);
            setInvoiceData(null); // Clear invoice data after download
          });
        }
      }, 100); // Small delay to ensure rendering
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast.error("Failed to generate invoice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const statusInfo = getStatusInfo(status);
  const StatusIcon = statusInfo.icon;

  return (
    <>
      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Header */}
        <div
          className={cn(
            "px-4 md:px-6 py-3 md:py-4 border-b border-gray-100",
            statusInfo.bgColor
          )}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="mb-2 md:mb-0">
              <h3 className="font-bold text-gray-900 text-base md:text-lg">
                Order #{orderNumber || "Pending"}
              </h3>
              <p className="text-gray-600 text-sm">
                {format(date, "MMM dd, yyyy")}
              </p>
            </div>

            <div
              className={cn(
                "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium",
                statusInfo.bgColor,
                statusInfo.color,
                statusInfo.borderColor,
                "border"
              )}
            >
              <StatusIcon className="w-4 h-4 mr-2" />
              {statusInfo.label}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* Order Info */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 mb-4 md:mb-6 text-xs md:text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span>Placed {format(date, "MMM dd, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className={paid ? "text-emerald-600" : "text-amber-600"}>
                {paid ? "Paid" : "Payment Pending"}
              </span>
            </div>
            {estimatedDeliveryDays &&
              ["PENDING", "PROCESSING", "SHIPPED"].includes(status) && (
                <div className="flex items-center gap-2">
                  <Truck className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                  <span className="break-words">
                    Delivery by {formatDeliveryDate(estimatedDeliveryDays)}
                  </span>
                </div>
              )}
          </div>

          {/* Product Details */}
          <div
            className="flex gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
            onClick={() => router.push(`/orders/${data.id}`)}
          >
            <div className="relative flex-shrink-0">
              <div className="w-16 h-20 md:w-20 md:h-24 rounded-lg overflow-hidden bg-white shadow-sm">
                <Image
                  src={data.productImage || ""}
                  alt="Product"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm md:text-base group-hover:text-blue-600 transition-colors line-clamp-2 md:truncate">
                    {data.name}
                  </h4>
                  {data.about && !data?.about.startsWith("{") && (
                    <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">
                      {data.about}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 mt-2 md:mt-3 text-xs md:text-sm">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-gray-500">Total Products:</span>
                      <span className="font-medium text-gray-700 ml-1">
                        {noOfProducts}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-gray-500">Total Price:</span>
                      <span className="font-medium text-gray-900 ml-1">
                        {formatter.format(price || 0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap sm:w-full md:w-auto">
                      <span className="text-gray-500">Payment:</span>
                      <span className="font-medium text-gray-900 ml-1">
                        {paymentMethod === "cod"
                          ? "Cash On Delivery"
                          : "Payment Online"}
                      </span>
                    </div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Invoice Component for PDF Generation */}
      {invoiceData && (
        <div style={{ position: "absolute", left: "-9999px" }}>
          <Invoice invoiceData={invoiceData} invoiceRef={invoiceRef} />
        </div>
      )}
    </>
  );
};
