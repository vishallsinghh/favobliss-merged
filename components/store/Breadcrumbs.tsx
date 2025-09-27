"use client";

import React from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string | null;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="hidden md:flex items-center space-x-2 text-sm text-gray-600 py-2 px-16 bg-gray-50 border-b justify-start">
      <Link
        href="/"
        className="flex items-center hover:text-gray-800 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item: any, index: any) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-gray-800 transition-colors capitalize"
            >
              {item?.label.charAt(0).toUpperCase() +
                item?.label.slice(1).toLowerCase()}
            </Link>
          ) : (
            <span className="text-gray-800 font-medium capitalize">
              {item.label.charAt(0).toUpperCase() +
                item.label.slice(1).toLowerCase()}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
