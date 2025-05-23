"use client";

import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { Palette, Plus } from "lucide-react";
import { ChromePicker, ColorResult } from "react-color";
import Image from "next/image";

import Layout from "@/components/Layouts";
import { CentralLoader, SmallLoader } from "@/components/Loader";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog/components/Dialog";
import { Button } from "@/components/Button";
import { Button as DialogButton } from "@/components/Button/Button";
import { EditIcon, SearchIcon, TrashIcon } from "@/assets/icons";
import { cardPreviewImg } from "@/assets/logos";
import apiService from "@/services/base.services";
import {
  ICardStyleResponse,
  IGender,
  IShopByCategory,
  IShopByCategoryResponse,
} from "@/types/interface";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { DEFAULT_PAGINATION } from "@/utils/common";
import useDebounce from "@/hooks/useDebounce";
import CommonDialog from "@/components/Dialog/CommonDialog";
import { DynamicTable } from "@/components/Tables/DynamicTables";
import dayjs from "dayjs";
import ImageHoverPreview from "@/components/ImageHoverPreview";

const shopByCategory = () => {
  const router = useRouter();

  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [sortKey, setSortKey] = useState<keyof IShopByCategory | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [shopCategory, setShopCategory] = useState<IShopByCategory[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchValue, 500);
  const [subCategoryId, setSubCategoryId] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cardColorOption, setCardColorOption] = useState({
    textColor: "#004300",
    backgroundColor: "#d3e2fe",
  });

  const handleTextColorChange = (
    newColor: ColorResult,
    pickerType: "text" | "bg",
  ) => {
    if (pickerType === "text") {
      setCardColorOption((prevState) => ({
        ...prevState,
        textColor: newColor.hex,
      }));
    } else {
      setCardColorOption((prevState) => ({
        ...prevState,
        backgroundColor: newColor.hex,
      }));
    }
  };

  const handleToggleCardDialog = () => {
    setIsCardOpen(!isCardOpen);
  };

  const handleApplyClick = () => {
    updateCardStyle();
  };

  const fetchCardStyle = async () => {
    try {
      setIsLoading(true);
      const res: ICardStyleResponse = await apiService.get(
        `/admin-category-settings`,
        { withAuth: true },
      );

      if (res.data.status === 200) {
        const { data } = res.data;
        setCardColorOption((prevState) => ({
          ...prevState,
          backgroundColor: data.cardColor,
          textColor: data.fontColor,
        }));
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
  };

  const updateCardStyle = async () => {
    setIsLoading(true);

    try {
      const response: ICardStyleResponse = await apiService.put(
        `/admin-category-settings`,
        {
          fontColor: cardColorOption.textColor,
          cardColor: cardColorOption.backgroundColor,
        },
        { withAuth: true },
      );

      if (response?.data.status === 200) {
        toast.success("Card style updated successfully");
        fetchCardStyle();
        handleToggleCardDialog();
      }
    } catch (error: any) {
      console.log("Error creating/updating category:", error?.message || error);
      const msg =
        error.response.data.message ||
        "Something went wrong. Please try again later.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
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

  useEffect(() => {
    fetchShopByCategory(sortKey, sortOrder);
  }, [fetchShopByCategory, sortKey, sortOrder]);

  useEffect(() => {
    fetchCardStyle();
  }, []);

  const handleCreate = () => router.push("/shop-by-category/new");

  const handleEdit = (id: number) => router.push(`/shop-by-category/${id}`);

  const openDeleteConfirmation = (id: number) => {
    setSubCategoryId(id);
    setIsDialogOpen(true);
  };

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
                render: (_value, row) => row.minDiscount ?? "-",
              },
              {
                key: "maxDiscount",
                label: "Max Discount",
                sortable: true,
                render: (_value, row) => row.maxDiscount ?? "-",
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

        <Dialog open={isCardOpen} onOpenChange={handleToggleCardDialog}>
          <DialogContent className="max-h-[70%] w-[90vw] max-w-[600px] overflow-y-auto sm:max-h-full">
            <DialogHeader>
              <DialogTitle className="text-[20px] sm:text-[24px]">
                Shop by category card
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center">
              <div
                className="flex max-w-[210px] items-center justify-center"
                style={{ backgroundColor: cardColorOption.backgroundColor }}
              >
                <div className="m-[6px] h-[330px]">
                  <Image
                    src={cardPreviewImg}
                    alt="card-preview"
                    className="w-full object-cover"
                  />
                  <div className="mt-[15px]">
                    <p
                      className="text-center text-sm font-semibold"
                      style={{ color: cardColorOption.textColor }}
                    >
                      Card Text
                    </p>
                  </div>
                  <p
                    className="text-center text-xl font-extrabold"
                    style={{ color: cardColorOption.textColor }}
                  >
                    Card Text
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-6 sm:gap-[30px]">
              <div className="relative">
                <p className="mb-2 font-medium">Choose Text Color:</p>
                <ChromePicker
                  color={cardColorOption.textColor}
                  onChange={(newColor) =>
                    handleTextColorChange(newColor, "text")
                  }
                />
              </div>
              <div className="relative">
                <p className="mb-2 font-medium">Choose Background Color:</p>
                <ChromePicker
                  color={cardColorOption.backgroundColor}
                  onChange={(newColor) => handleTextColorChange(newColor, "bg")}
                />
              </div>
            </div>

            <DialogFooter className="mt-6 !justify-center">
              <DialogButton
                type="button"
                variant="destructive"
                className="w-full max-w-[150px] bg-primary text-white"
                onClick={handleApplyClick}
                disabled={isLoading}
              >
                Apply <SmallLoader loading={isLoading} />
              </DialogButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Layout>
    </>
  );
};

export default shopByCategory;
