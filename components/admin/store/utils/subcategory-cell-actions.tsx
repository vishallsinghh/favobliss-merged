"use client";

import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { SubCategoryColumn } from "./columns";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { copyToClipboard } from "@/lib/utils";
import { AlertModal } from "@/components/admin/modals/alert-modal";

interface SubCategoryCellActionsProps {
  data: SubCategoryColumn;
}

export const SubCategoryCellActions = ({
  data,
}: SubCategoryCellActionsProps) => {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/admin/${process.env.NEXT_PUBLIC_STORE_ID}/subcategories/${data.id}`);
      router.refresh();
      toast.success("Subcategory deleted");
    } catch (error) {
      console.error("[SUBCATEGORY_CELL_ACTIONS] Error:", error);
      toast.error("Make sure you removed all products first.");
    } finally {
      setOpen(false);
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        loading={loading}
        onConfirm={onDelete}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel className="mx-2">Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              copyToClipboard(data.id, "Subcategory Id is copied to clipboard")
            }
          >
            <Copy className="h-4 w-4 mr-4" />
            Copy Id
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              router.push(`/admin/subcategories/${data.id}`)
            }
          >
            <Edit className="h-4 w-4 mr-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem disabled={loading} onClick={() => setOpen(true)}>
            <Trash2 className="h-4 w-4 mr-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
