"use client";

import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { toast } from "react-toastify";

import Layout from "@/components/Layouts";
import { DynamicTable } from "@/components/Tables/DynamicTables";
import { CentralLoader } from "@/components/Loader";
import ImageHoverPreview from "@/components/ImageHoverPreview";
import { DEFAULT_PAGINATION } from "@/utils/common";
import { IWishlistResponse, IWishlistTableAttr } from "@/types/interface";
import apiService from "@/services/base.services";
import { SearchIcon } from "@/assets/icons";
import useDebounce from "@/hooks/useDebounce";

type ColumnConfig<T> = {
  key: keyof T;
  label: string;
  sortable: boolean;
  render?: (value: any, row: T) => React.ReactNode;
};

const WishList = () => {
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [sortKey, setSortKey] = useState<keyof IWishlistTableAttr | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [wishlist, setWishlist] = useState<IWishlistTableAttr[]>([]);

  const debouncedSearchTerm = useDebounce(searchValue, 1000);

  const handleSort = (key: keyof IWishlistTableAttr) => {
    const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(newOrder);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleSearchChange = (searchValue: string) => {
    setSearchValue(searchValue);
    setPagination(DEFAULT_PAGINATION);
  };

  const fetchWishlist = useCallback(
    async (sortKey = "", sortOrder = "") => {
      try {
        setIsLoading(true);
        const { page, pageSize } = pagination;
        const res: IWishlistResponse = await apiService.get(
          `/wishlist/items?page=${page}&pageSize=${pageSize}&search=${searchValue}&sortBy=${sortKey}&order=${sortOrder}`,
          { withAuth: true },
        );
        if (res.status === 200) {
          const { items, meta } = res.data.data;
          const data: IWishlistTableAttr[] = items.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            productImage: item.product.image,
            brand: item.product.brand.name,
            category: item.product.sub_category_type.sub_category.category.name,
            sub_category: item.product.sub_category_type.sub_category.name,
            sub_category_type: item.product.sub_category_type.name,
            users: item.unique_users_count,
            price: item.product.price,
            discount: item.product.discount,
          }));

          setWishlist(data);
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
    fetchWishlist(sortKey, sortOrder);
  }, [fetchWishlist, sortKey, sortOrder]);

  const columns: ColumnConfig<IWishlistTableAttr>[] = [
    {
      key: "name",
      label: "Product Name",
      sortable: true,
      render: (_value, row) => row.name ?? "-",
    },
    {
      key: "productImage",
      label: "Product Image",
      sortable: false,
      render: (_value, row) => (
        <ImageHoverPreview images={row.productImage || []} />
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (_value, row) => row.price ?? "-",
    },
    {
      key: "discount",
      label: "Discount",
      sortable: false,
      render: (_value, row) => row.discount ?? "-",
    },
    {
      key: "category",
      label: "Category",
      sortable: false,
      render: (_value, row) => row.category ?? "-",
    },
    {
      key: "sub_category",
      label: "Sub Category",
      sortable: false,
      render: (_value, row) => row.sub_category ?? "-",
    },
    {
      key: "sub_category_type",
      label: "Sub Category Type",
      sortable: false,
      render: (_value, row) => row.sub_category_type ?? "-",
    },
    {
      key: "brand",
      label: "Brand",
      sortable: false,
      render: (_value, row) => row.brand ?? "-",
    },
    {
      key: "users",
      label: "Total Wishlist",
      sortable: true,
      render: (_value, row) => row.users || "-",
    },
  ];
  return (
    <>
      <Head>
        <title>Wishlist</title>
      </Head>
      <CentralLoader loading={isLoading} />
      <Layout>
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-1">
          <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
            Wishlist
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
          </div>
        </div>

        <div className="space-y-10">
          <DynamicTable
            data={wishlist}
            totalPages={pagination.totalPages}
            currentPage={pagination.page}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSort={handleSort}
            handlePageChange={handlePageChange}
            columns={columns}
          />
        </div>
      </Layout>
    </>
  );
};

export default WishList;
