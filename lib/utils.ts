import { Category } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { db } from "@/lib/db";

const units = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
];
const teens = [
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];
const thousands = ["", "Thousand", "Lakh", "Crore"];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const getCategories = (
  key: string,
  type: "TOPWEAR" | "BOTTOMWEAR" | "FOOTWEAR" | "INNERWEARANDSLEEPWEAR",
  category: Category[]
) => {
  const formattedCategory = category.filter(
    (c) => c.classification.toString() === type
  );
  const categoryURL = formattedCategory.map((c) => ({
    url: `/category/${c.id}?category=${key}&page=1`,
    label: c.name,
  }));
  return categoryURL;
};

export const formatDeliveryDate = (deliveryDays: number | null): string => {
  const today = new Date();
  if (deliveryDays === null || deliveryDays === undefined) {
    return "Delivery date not available";
  }
  if (deliveryDays === 0) {
    return "Today";
  }
  if (deliveryDays === 1) {
    return "Tomorrow";
  }
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + deliveryDays);
  return deliveryDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// utils/recentlyViewed.ts
export const addToRecentlyViewed = (productId: string) => {
  if (typeof window === "undefined") return;
  const recentlyViewed = JSON.parse(
    localStorage.getItem("recentlyViewed") || "[]"
  );
  const updatedList = [
    productId,
    ...recentlyViewed.filter((id: string) => id !== productId),
  ];
  if (updatedList.length > 5) {
    updatedList.pop();
  }
  localStorage.setItem("recentlyViewed", JSON.stringify(updatedList));
};

export const getRecentlyViewed = (): string[] => {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
};

export function myNumberToWords(num: number): string {
  if (num === 0) return "Zero";

  if (num < 0) return `Minus ${myNumberToWords(Math.abs(num))}`;

  let word = "";

  // Handle crores (10^7)
  if (num >= 10000000) {
    const crore = Math.floor(num / 10000000);
    word += `${myNumberToWords(crore)} Crore `;
    num %= 10000000;
  }

  // Handle lakhs (10^5)
  if (num >= 100000) {
    const lakh = Math.floor(num / 100000);
    word += `${myNumberToWords(lakh)} Lakh `;
    num %= 100000;
  }

  // Handle thousands (10^3)
  if (num >= 1000) {
    const thousand = Math.floor(num / 1000);
    word += `${myNumberToWords(thousand)} Thousand `;
    num %= 1000;
  }

  // Handle remaining hundreds, tens, and units
  if (num > 0) {
    word += convertHundreds(num);
  }

  return word.trim();
}

function convertHundreds(num: number): string {
  if (num < 10) return units[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return `${tens[ten]}${unit ? " " + units[unit] : ""}`;
  }
  if (num < 1000) {
    return `${units[Math.floor(num / 100)]} Hundred${
      num % 100 ? " " + convertHundreds(num % 100) : ""
    }`;
  }
  return "";
}

export function wrapNumber(input: string, width: number): string {
  const words = input.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + word).length > width) {
      if (currentLine) {
        lines.push(currentLine.trim());
        currentLine = "";
      }

      if (word.length > width) {
        for (let i = 0; i < word.length; i += width) {
          lines.push(word.substring(i, i + width));
        }
      } else {
        currentLine = word + " ";
      }
    } else {
      currentLine += word + " ";
    }
  }

  if (currentLine) {
    lines.push(currentLine.trim());
  }

  return lines.join("\n");
}

export const copyToClipboard = (text: string, message?: string) => {
  navigator.clipboard.writeText(text);
  if (message) {
    toast.info(message);
  }
};

export async function generateOrderNumber(
  index: number = Math.floor(Math.random() * 1000)
): Promise<string> {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hour = now.getHours().toString().padStart(2, "0");

  const base = `${year}${month}${day}${hour}`.slice(0, 4);
  const suffix = (index % 1000).toString().padStart(3, "0");
  let orderNumber = `${base}${suffix}`;

  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    const existingOrder = await db.order.findUnique({
      where: { orderNumber },
    });

    isUnique = !existingOrder;
    attempts++;
    if (!isUnique) {
      console.warn(
        `Order number ${orderNumber} already exists, retrying... (Attempt ${attempts})`
      );
      const newIndex = Math.floor(Math.random() * 1000);
      const newSuffix = (newIndex % 1000).toString().padStart(3, "0");
      orderNumber = `${base}${newSuffix}`;
    }
  } while (!isUnique && attempts < maxAttempts);

  if (!isUnique) {
    console.error(
      "Failed to generate a unique order number after maximum attempts"
    );
    throw new Error(
      "Failed to generate a unique order number after maximum attempts"
    );
  }

  return orderNumber;
}

export async function generateInvoiceNumber(
  index: number = Math.floor(Math.random() * 100000)
): Promise<string> {
  const prefix = "Retail";
  const suffix = (index % 100000).toString().padStart(5, "0");
  let invoiceNumber = `${prefix}${suffix}`;

  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    const existingOrder = await db.order.findUnique({
      where: { invoiceNumber },
    });

    isUnique = !existingOrder;
    attempts++;
    if (!isUnique) {
      console.warn(
        `Invoice number ${invoiceNumber} already exists, retrying... (Attempt ${attempts})`
      );
      const newIndex = Math.floor(Math.random() * 100000);
      const newSuffix = (newIndex % 100000).toString().padStart(5, "0");
      invoiceNumber = `${prefix}${newSuffix}`;
    }
  } while (!isUnique && attempts < maxAttempts);

  if (!isUnique) {
    console.error(
      "Failed to generate a unique invoice number after maximum attempts"
    );
    throw new Error(
      "Failed to generate a unique invoice number after maximum attempts"
    );
  }

  return invoiceNumber;
}