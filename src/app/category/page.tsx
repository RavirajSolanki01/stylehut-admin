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
import { ICategory, ICategoryApiResponse } from "@/types/interface";
import { DEFAULT_PAGINATION } from "@/utils/common";
import useDebounce from "@/hooks/useDebounce";
import { CentralLoader } from "@/components/Loader";
import CommonDialog from "@/components/Dialog/CommonDialog";

const CategoryPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [sortKey, setSortKey] = useState<keyof ICategory | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<number>(0);

  const handleDeleteConfirm = async () => {
    try {
      const res = await apiService.delete(`/category/${categoryId}`, {
        withAuth: true,
      });

      if (res.status === 200) {
        toast.success("Category deleted successfully");
        const updated = categories.filter((item) => item.id !== categoryId);

        if (updated.length > 0) {
          setCategories(updated);
        } else if (pagination.page > 1) {
          setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
        } else {
          fetchCategories();
        }
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to delete category";
      toast.error(msg);
    }
  };

  const fetchCategories = useCallback(
    async (sortKey = "", sortOrder = "") => {
      try {
        setIsLoading(true);
        const { page, pageSize } = pagination;
        const res: ICategoryApiResponse = await apiService.get(
          `/category?page=${page}&pageSize=${pageSize}&search=${searchTerm}&sortBy=${sortKey}&order=${sortOrder}`,
          { withAuth: true },
        );

        if (res.status === 200) {
          const { items, meta } = res.data.data;
          setCategories(items);
          setPagination(meta);
        }
      } catch (error: any) {
        if (!error?.response?.data?.success) {
          toast.error(error.response?.data?.message);
          return;
        }
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

  const handleSort = (key: keyof ICategory) => {
    const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(newOrder);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleCreate = () => router.push("/category/new");

  const handleEdit = (id: number) => router.push(`/category/${id}`);

  const openDeleteConfirmation = (id: number) => {
    setCategoryId(id);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Head>
        <title>Category</title>
      </Head>
      <CentralLoader loading={isLoading} />
      <Layout>
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-1">
          <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
            Category
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
              shape="rounded"
              variant="primary"
              onClick={handleCreate}
              size="small"
              title="Category"
              icon={<Plus size={20} />}
            />
          </div>
        </div>

        <div className="space-y-10">
          <DynamicTable
            data={categories}
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
                key: "create_at",
                label: "Created",
                sortable: true,
                render: (val) => dayjs(val).format("MMM DD, YYYY"),
              },
              {
                key: "updated_at",
                label: "Updated",
                sortable: true,
                render: (val) => dayjs(val).format("MMM DD, YYYY"),
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
          />
        </div>
      </Layout>
    </>
  );
};

export default CategoryPage;
