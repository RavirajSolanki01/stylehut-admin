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
  IProductDetailKey,
  IProductDetailKeyApiResponse,
} from "@/types/interface";
import { DEFAULT_PAGINATION } from "@/utils/common";
import useDebounce from "@/hooks/useDebounce";
import { CentralLoader } from "@/components/Loader";
import CommonDialog from "@/components/Dialog/CommonDialog";

const ProductSpecificationKeyPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [productDetailKeys, setProductDetailKeys] = useState<
    IProductDetailKey[]
  >([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [sortKey, setSortKey] = useState<keyof IProductDetailKey | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<number>(0);

  const handleDeleteConfirm = async () => {
    try {
      const res = await apiService.delete(
        `/product/specification-key/${categoryId}`,
        {
          withAuth: true,
        },
      );

      if (res.status === 200) {
        toast.success("Product detail key deleted successfully");
        const updated = productDetailKeys.filter(
          (item) => item.id !== categoryId,
        );

        if (updated.length > 0) {
          setProductDetailKeys(updated);
        } else if (pagination.page > 1) {
          setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
        } else {
          fetchCategories();
        }
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Failed to delete product detail key";
      toast.error(msg);
    }
  };

  const fetchCategories = useCallback(
    async (sortKey = "", sortOrder = "") => {
      try {
        setIsLoading(true);
        const { page, pageSize } = pagination;
        const res: IProductDetailKeyApiResponse = await apiService.get(
          `/product/specification-key?page=${page}&pageSize=${pageSize}&search=${searchTerm}&sortBy=${sortKey}&order=${sortOrder}`,
          { withAuth: true },
        );

        if (res.status === 200) {
          const { items, meta } = res.data.data;
          setProductDetailKeys(items);
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

  const handleSort = (key: keyof IProductDetailKey) => {
    const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(newOrder);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleCreate = () => router.push("/product-specification-key/new");

  const handleEdit = (id: number) =>
    router.push(`/product-specification-key/${id}`);

  const openDeleteConfirmation = (id: number) => {
    setCategoryId(id);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Head>
        <title>Product Specification Key</title>
      </Head>
      <CentralLoader loading={isLoading} />
      <Layout>
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-1">
          <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
            Product Specification Key
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
              title="Product Specification Key"
              icon={<Plus size={20} />}
            />
          </div>
        </div>

        <div className="space-y-10">
          <DynamicTable
            data={productDetailKeys}
            totalPages={pagination.totalPages}
            currentPage={pagination.page}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSort={handleSort}
            handlePageChange={handlePageChange}
            columns={[
              { key: "name", label: "Name", sortable: true },
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
            title="Delete Product Detail Key"
            description="Are you sure you want to delete this product detail key?"
            onConfirm={handleDeleteConfirm}
          />
        </div>
      </Layout>
    </>
  );
};

export default ProductSpecificationKeyPage;
