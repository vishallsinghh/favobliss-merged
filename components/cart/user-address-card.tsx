"use client";

import { Address } from "@prisma/client";
import { AddressCard } from "./address-card";
import { useAddessModal } from "@/hooks/use-address-modal";
import { useCart } from "@/hooks/use-cart";
import { useCheckoutAddress } from "@/hooks/use-checkout-address";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { getProducts } from "@/actions/get-products";
import { useCheckout } from "@/hooks/use-checkout";

interface UserAddressCardProps {
  data: Address[];
  label?: boolean;
}

interface PricingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mismatchedCount: number;
  newPincode: string;
  isLoading: boolean;
}

const PricingDialog = ({
  isOpen,
  onClose,
  onConfirm,
  mismatchedCount,
  newPincode,
  isLoading,
}: PricingDialogProps) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-amber-100 rounded-full">
            <svg
              className="w-6 h-6 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Update Cart Prices?
          </h3>

          <p className="text-sm text-gray-600 text-center mb-6">
            <span className="font-medium">{mismatchedCount} item(s)</span> in
            your cart were added for a different pincode. Update prices for{" "}
            <span className="font-medium">{newPincode}</span>?
          </p>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-400 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </>
              ) : (
                "Update Prices"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserAddressCard = ({ data, label }: UserAddressCardProps) => {
  const { onOpen } = useAddessModal();
  const { items, updateItemPrice, removeItem } = useCart();
  const { addAddress } = useCheckoutAddress();
  const router = useRouter();
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [mismatchedItems, setMismatchedItems] = useState<any[]>([]);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const { updateItemCheckoutPrice } = useCheckout();

  const defaultAddress =
    data && data.find((address) => address.isDefault === true);
  const otherAddresses =
    data && data.filter((address) => address.isDefault === false);

  const handleAddressSelect = async (address: Address) => {
    console.log("Selected address pincode:", address.zipCode);
    console.log("Cart items:", items);
    const mismatched = items.filter((item) => {
      const isMismatch =
        String(item.pincode).trim() !== String(address.zipCode).trim();
      console.log(
        `Comparing item pincode ${item.pincode} with address pincode ${address.zipCode}: ${isMismatch}`
      );
      return isMismatch;
    });

    console.log("Mismatched items:", mismatched);

    if (mismatched.length === 0) {
      console.log("No mismatched items, adding address:", address);
      addAddress(address);
      return;
    }

    setSelectedAddress(address);
    setMismatchedItems(mismatched);
    setShowPricingDialog(true);
  };

  const handlePriceUpdate = async () => {
    if (!selectedAddress || mismatchedItems.length === 0) return;

    setIsUpdatingPrices(true);

    try {
      const { products: response } = await getProducts({
        variantIds: mismatchedItems
          .map((item) => item.selectedVariant.id)
          .join(","),
        pincode: selectedAddress.zipCode,
      });

      console.log("API response for products:", response);

      for (const item of mismatchedItems) {
        const product = response.find((p) =>
          p.variants?.some((v) => v.id === item.selectedVariant.id)
        );
        const variant = product?.variants.find(
          (v) => v.id === item.selectedVariant.id
        );
        const targetPincode = String(selectedAddress.zipCode).trim();

        const variantPrice = variant?.variantPrices?.find((vp) => {
          const apiPincode = vp?.locationGroup?.locations?.find(
            (loc) => String(loc.pincode).trim() === targetPincode
          )?.pincode;
          console.log(
            `Checking variant price for pincode ${targetPincode}:`,
            vp
          );
          return String(apiPincode).trim() === targetPincode;
        });

        console.log(`Found variant price for ${item.name}:`, variantPrice);

        if (variantPrice && variantPrice.price) {
          console.log(
            `Updating price for ${item.name}: price=${variantPrice.price}, mrp=${variantPrice.mrp}`
          );
          updateItemPrice(
            item.selectedVariant.id,
            variantPrice.price,
            variantPrice.mrp,
            String(selectedAddress.zipCode),
            variantPrice.locationGroup?.deliveryDays || 0,
            variantPrice.locationGroup?.isCodAvailable || false
          );

          updateItemCheckoutPrice(
            item.selectedVariant.id,
            variantPrice.price,
            variantPrice.mrp,
            String(selectedAddress.zipCode)
          );
          toast.success(`Updated price for ${item.name}`);
        } else {
          console.log(
            `Removing item ${item.name} because no price found for pincode ${selectedAddress.zipCode}`
          );
          toast.warning(
            `The product ${item.name} is unavailable at this location (${selectedAddress.zipCode})`
          );
          // removeItem(item.selectedVariant.id);
        }
      }

      // Only add the address if at least one item remains in the cart
      if (items.length > 0) {
        console.log("Adding address after price update:", selectedAddress);
        addAddress(selectedAddress);
      } else {
        console.log("Cart is empty after price update, not adding address");
        toast.error(
          "All items were removed from the cart. Please add items again."
        );
      }

      setShowPricingDialog(false);
    } catch (error: any) {
      console.error("Error details:", error);
      if (error?.response?.status === 404) {
        toast.error(
          "The entered pincode is invalid. Please enter a valid pincode or select a different address."
        );
        setSelectedAddress(null);
      } else {
        toast.error("Failed to update prices for selected address");
      }
      console.error(error);
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  const handleDialogClose = () => {
    console.log("Closing pricing dialog");
    setShowPricingDialog(false);
    setSelectedAddress(null);
    setMismatchedItems([]);
  };

  return (
    <>
      <div className="p-4 w-full rounded-sm space-y-6">
        {data.length > 1 && !label && (
          <h3 className="text-lg md:text-xl font-bold text-zinc-800">
            Select Address
          </h3>
        )}
        {defaultAddress && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-600">
              DEFAULT ADDRESS
            </h3>
            <AddressCard data={defaultAddress} onSelect={handleAddressSelect} />
          </div>
        )}
        {otherAddresses.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-600">
              OTHER ADDRESSES
            </h3>
            {otherAddresses.map((address) => (
              <AddressCard
                key={address.id}
                data={address}
                onSelect={handleAddressSelect}
              />
            ))}
          </div>
        )}
        <div
          className="w-full aspect-[6/1] border border-dashed rounded-md flex items-center justify-center bg-gray-100 cursor-default md:cursor-pointer"
          onClick={onOpen}
        >
          <p className="text-md font-bold">Add New Address</p>
        </div>
      </div>

      <PricingDialog
        isOpen={showPricingDialog}
        onClose={handleDialogClose}
        onConfirm={handlePriceUpdate}
        mismatchedCount={mismatchedItems.length}
        newPincode={selectedAddress ? String(selectedAddress.zipCode) : ""}
        isLoading={isUpdatingPrices}
      />
    </>
  );
};
