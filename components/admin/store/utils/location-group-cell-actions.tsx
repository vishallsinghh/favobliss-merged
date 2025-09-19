"use client";

import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { LocationGroupColumn } from "./columns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { Copy, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { AlertModal } from "@/components/admin/modals/alert-modal";
import { copyToClipboard } from "@/lib/utils";

interface LocationGroupCellActionsProps {
  data: LocationGroupColumn;
}

export const LocationGroupCellActions = ({
  data,
}: LocationGroupCellActionsProps) => {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/admin/${process.env.NEXT_PUBLIC_STORE_ID}/location-group/${data.id}`
      );
      router.refresh();
      toast.success("Location Group deleted");
    } catch (error) {
      console.error(error);
      toast.error(
        "Make sure you removed all related locations and variant prices first."
      );
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
              copyToClipboard(
                data.id,
                "Location Group ID is copied to clipboard"
              )
            }
          >
            <Copy className="h-4 w-4 mr-4" />
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/admin/location-group/${data.id}`)}
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
