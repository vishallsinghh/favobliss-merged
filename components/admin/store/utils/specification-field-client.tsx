"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { Plus, Copy, Trash2, MoreHorizontal, Edit } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "./data-table";
import { ApiList } from "./api-list.";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import axios from "axios";
import { AlertModal } from "@/components/admin/modals/alert-modal";
import { ColumnDef, DisplayColumnDef } from "@tanstack/react-table";

interface SpecificationFieldColumn {
  id: string;
  name: string;
  group: string;
  createdAt: string;
}

interface SpecificationFieldClientProps {
  data: SpecificationFieldColumn[];
}

export const SpecificationFieldClient = ({
  data,
}: SpecificationFieldClientProps) => {
  const router = useRouter();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const columns: ColumnDef<SpecificationFieldColumn>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "group",
      header: "Group",
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const { id } = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(id);
                  toast.success("Field ID copied to clipboard");
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Id
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/admin/specification-fields/${id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedId(id);
                  setOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    } as DisplayColumnDef<SpecificationFieldColumn>,
  ];

  const onDelete = async () => {
    if (!selectedId) return;
    try {
      setLoading(true);
      await axios.delete(
        `/api/admin/${process.env.NEXT_PUBLIC_STORE_ID}/specification-fields/${selectedId}`
      );
      router.refresh();
      toast.success("Specification field deleted");
    } catch (error) {
      console.error("[FIELD_DELETE_CLIENT]", error);
      toast.error("Failed to delete specification field");
    } finally {
      setLoading(false);
      setOpen(false);
      setSelectedId(null);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setSelectedId(null);
        }}
        loading={loading}
        onConfirm={onDelete}
      />
      <div className="flex items-center justify-between">
        <Header
          title="Specification Fields"
          badge={data.length.toString()}
          description="Manage specification fields for your store"
        />
        <Button
          onClick={() => router.push(`/admin/specification-fields/create`)}
        >
          <Plus className="h-4 w-4 mr-2" size="sm" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} visibility searchKey="name" />
      <Header title="API" description="API calls for specification fields" />
      <ApiList entityName="specification-fields" entityIdName="fieldId" />
    </>
  );
};
