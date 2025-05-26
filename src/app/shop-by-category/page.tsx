"use client";

import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { Palette, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import Layout from "@/components/Layouts";
import { CentralLoader } from "@/components/Loader";
import CommonDialog from "@/components/Dialog/CommonDialog";
import { DynamicTable } from "@/components/Tables/DynamicTables";
import ImageHoverPreview from "@/components/ImageHoverPreview";
import { Button } from "@/components/Button";
import CardStyledDialog from "./_components/cardStyledDialog";
import { EditIcon, SearchIcon, TrashIcon } from "@/assets/icons";
import apiService from "@/services/base.services";
import { IShopByCategory, IShopByCategoryResponse } from "@/types/interface";
import { DEFAULT_PAGINATION } from "@/utils/common";
import useDebounce from "@/hooks/useDebounce";

const shopByCategory = () => {
  const router = useRouter();

  const [isCardOpen, setIsCardOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [sortKey, setSortKey] = useState<keyof IShopByCategory | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [shopCategory, setShopCategory] = useState<IShopByCategory[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [subCategoryId, setSubCategoryId] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const debouncedSearchTerm = useDebounce(searchValue, 500);

  const handleToggleCardDialog = () => {
    setIsCardOpen((prev) => !prev);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPagination(DEFAULT_PAGINATION);
  };

  const handleSort = (key: keyof IShopByCategory) => {
    const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(newOrder);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await apiService.delete(
        `/shop-by-category/${subCategoryId}`,
        {
          withAuth: true,
        },
      );

      if (res.status === 200) {
        toast.success("Shop by category deleted successfully");
        const updated = shopCategory.filter(
          (item) => item.id !== subCategoryId,
        );

        if (updated.length > 0) {
          setShopCategory(updated);
        } else if (pagination.page > 1) {
          setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
        } else {
          fetchShopByCategory();
        }
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to delete gender";
      toast.error(msg);
    }
  };

  const handleCreate = () => router.push("/shop-by-category/new");

  const handleEdit = (id: number) => router.push(`/shop-by-category/${id}`);

  const openDeleteConfirmation = (id: number) => {
    setSubCategoryId(id);
    setIsDialogOpen(true);
  };

  const fetchShopByCategory = useCallback(
    async (sortKey = "", sortOrder = "") => {
      try {
        setIsLoading(true);
        const { page, pageSize } = pagination;
        const res: IShopByCategoryResponse = await apiService.get(
          `/shop-by-category?page=${page}&pageSize=${pageSize}&search=${searchValue}&sortBy=${sortKey}&order=${sortOrder}`,
          { withAuth: true },
        );

        if (res.status === 200) {
          const { items, meta } = res.data.data;
          setShopCategory(items);
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
    fetchShopByCategory(sortKey, sortOrder);
  }, [fetchShopByCategory, sortKey, sortOrder]);

  return (
    <>
      <Head>
        <title>Shop by category</title>
      </Head>
      <CentralLoader loading={isLoading} />
      <Layout>
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-1">
          <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
            Shop by category
          </h2>

          <div className="flex w-full items-center gap-2 sm:w-fit">
            <div className="relative w-full sm:max-w-[300px]">
              <input
                type="search"
                value={searchValue}
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
            <Button
              label=""
              shape="rounded"
              variant="primary"
              onClick={handleToggleCardDialog}
              size="small"
              title="Shope By Category Card"
              icon={<Palette size={20} />}
            />
          </div>
        </div>

        <div className="space-y-10">
          <DynamicTable
            data={shopCategory}
            totalPages={pagination.totalPages}
            currentPage={pagination.page}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSort={handleSort}
            handlePageChange={handlePageChange}
            columns={[
              {
                key: "name",
                label: "Name",
                sortable: true,
                render: (_value, row) => row.name ?? "-",
              },
              {
                key: "sub_category_id",
                label: "Sub Category",
                sortable: true,
                render: (_value, row) => row.sub_category_id ?? "-",
              },
              {
                key: "minDiscount",
                label: "Min Discount",
                sortable: true,
                render: (_value, row) => `${row.minDiscount}%` ?? "-",
              },
              {
                key: "maxDiscount",
                label: "Max Discount",
                sortable: true,
                render: (_value, row) => `${row.maxDiscount}%` ?? "-",
              },
              {
                key: "image",
                label: "Card Image",
                sortable: false,
                render: (_value, row) => (
                  <ImageHoverPreview images={row.image ? [row.image] : []} />
                ),
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
        </div>

        <CommonDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onConfirm={handleDeleteConfirm}
          title="Gender"
          description="Are you sure you want to remove this shop by category?"
        />

        <CardStyledDialog
          toggleDialog={handleToggleCardDialog}
          isCardOpen={isCardOpen}
        />
      </Layout>
    </>
  );
};

export default shopByCategory;
