"use client";

import { EditIcon, SearchIcon, TrashIcon } from "@/assets/icons";
import dayjs from "dayjs";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";

import Layout from "@/components/Layouts";
import { DynamicTable } from "@/components/Tables/DynamicTables";
import { Button } from "@/components/Button";
import apiService from "@/services/base.services";
import {
  ISubCategoryTypeTableAttr,
  ISubCategoryTypeApiResponse,
} from "@/types/interface";
import { DEFAULT_PAGINATION } from "@/utils/common";
import useDebounce from "@/hooks/useDebounce";
import { CentralLoader } from "@/components/Loader";
import CommonDialog from "@/components/Dialog/CommonDialog";

const SubCategoryTypePage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [subCategoriesTypes, setSubCategoriesTypes] = useState<
    ISubCategoryTypeTableAttr[]
  >([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [sortKey, setSortKey] = useState<keyof ISubCategoryTypeTableAttr | "">(
    "",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subCategoryTypeId, setCategoryTypeId] = useState<number>(0);

  const handleDeleteConfirm = async () => {
    try {
      const res = await apiService.delete(
        `/sub-category-type/${subCategoryTypeId}`,
        {
          withAuth: true,
        },
      );

      if (res.status === 200) {
        toast.success("Subcategory type deleted successfully");
        const updated = subCategoriesTypes.filter(
          (item) => item.id !== subCategoryTypeId,
        );

        if (updated.length > 0) {
          setSubCategoriesTypes(updated);
        } else if (pagination.page > 1) {
          setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
        } else {
          fetchCategories();
        }
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Failed to delete subcategory type";
      toast.error(msg);
    }
  };

  const fetchCategories = useCallback(
    async (sortKey = "", sortOrder = "") => {
      try {
        setIsLoading(true);
        const { page, pageSize } = pagination;
        const res: ISubCategoryTypeApiResponse = await apiService.get(
          `/sub-category-type?page=${page}&pageSize=${pageSize}&search=${searchTerm}&sortBy=${sortKey}&order=${sortOrder}`,
          { withAuth: true },
        );

        if (res.status === 200) {
          const { items, meta } = res.data.data;
          console.log("abc=> type", items);

          const formattedSubType = items.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            create_at: item.create_at,
            updated_at: item.updated_at,
            category: item.sub_category.category.name,
            sub_category: item.sub_category.name,
          }));
          setSubCategoriesTypes(formattedSubType);
          setPagination(meta);
        }
      } catch {
        toast.error("Something went wrong, please try again later.");
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.page, pagination.pageSize, debouncedSearchTerm],
  );

  useEffect(() => {
    fetchCategories(sortKey, sortOrder);
  }, [fetchCategories, sortKey, sortOrder]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPagination(DEFAULT_PAGINATION);
  };

  const handleSort = (key: keyof ISubCategoryTypeTableAttr) => {
    const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(newOrder);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleCreate = () => router.push("/sub-category-type/new");

  const handleEdit = (id: number) => router.push(`/sub-category-type/${id}`);

  const openDeleteConfirmation = (id: number) => {
    setCategoryTypeId(id);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Head>
        <title>Subcategory type</title>
      </Head>
      <CentralLoader loading={isLoading} />
      <Layout>
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-1">
          <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
            Subcategory type
          </h2>

          <div className="flex w-full items-center gap-2 sm:w-fit">
            <div className="relative w-full sm:max-w-[300px]">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search"
                className="w-full rounded-full border-[2px] bg-white py-2.5 pl-[53px] pr-5 text-base outline-none transition-colors focus-visible:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-dark-4 dark:hover:bg-dark-3 dark:focus-visible:border-primary"
              />
              <SearchIcon className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 max-[1015px]:size-5" />
            </div>
            <Button
              label=""
              title="Subcategory type"
              shape="rounded"
              variant="primary"
              onClick={handleCreate}
              size="small"
              icon={<Plus size={20} />}
            />
          </div>
        </div>

        <div className="space-y-10">
          <DynamicTable
            data={subCategoriesTypes}
            totalPages={pagination.totalPages}
            currentPage={pagination.page}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSort={handleSort}
            handlePageChange={handlePageChange}
            columns={[
              { key: "name", label: "Name", sortable: true },
              { key: "description", label: "Description", sortable: true },
              {
                key: "category",
                label: "Category",
                sortable: true,
                render: (_value, row) => row.category ?? "-",
              },
              {
                key: "sub_category",
                label: "Subcategory",
                sortable: true,
                render: (_value, row) => row.sub_category ?? "-",
              },
              {
                key: "create_at",
                label: "Created",
                sortable: true,
                render: (val: unknown) =>
                  typeof val === "string" ||
                  typeof val === "number" ||
                  val instanceof Date
                    ? dayjs(val).format("MMM DD, YYYY")
                    : "-",
              },
              {
                key: "updated_at",
                label: "Updated",
                sortable: true,
                render: (val: unknown) =>
                  typeof val === "string" ||
                  typeof val === "number" ||
                  val instanceof Date
                    ? dayjs(val).format("MMM DD, YYYY")
                    : "-",
              },
            ]}
            actions={(row) => (
              <div className="flex items-center justify-end gap-x-3">
                <button
                  className="hover:text-primary"
                  onClick={() => handleEdit(row.id)}
                >
                  <EditIcon />
                </button>
                <button
                  className="hover:text-primary"
                  onClick={() => openDeleteConfirmation(row.id)}
                >
                  <TrashIcon />
                </button>
              </div>
            )}
          />
          <CommonDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onConfirm={handleDeleteConfirm}
            title="Subcategory type"
            description="Are you sure you want to delete subcategory type?"
          />
        </div>
      </Layout>
    </>
  );
};

export default SubCategoryTypePage;
