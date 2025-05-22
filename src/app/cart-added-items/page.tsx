"use client";
import { SearchIcon } from "@/assets/icons";
import { Button } from "@/components/Button";
import Layout from "@/components/Layouts";
import { CentralLoader } from "@/components/Loader";
import { DynamicTable } from "@/components/Tables/DynamicTables";
import useDebounce from "@/hooks/useDebounce";
import apiService from "@/services/base.services";
import { IBrand } from "@/types/interface";
import { DEFAULT_PAGINATION } from "@/utils/common";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

function CartAddedProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [sortKey, setSortKey] = useState<keyof IBrand | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [CartAddedProducts, setCartAddedProducts] = useState<Array<any>>([]);

  const handleSort = (key: string | number | symbol) => {
    const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key as keyof IBrand);
    setSortOrder(newOrder);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPagination(DEFAULT_PAGINATION);
    setIsLoading(false);
  };

  const fetchCartAddedProducts = useCallback(
    async (sortKey = "", sortOrder = "") => {
      try {
        setIsLoading(true);
        const { page, pageSize } = pagination;
        const res: any = await apiService.get(
          `/cart/items?page=${page}&pageSize=${pageSize}&search=${searchTerm}&sortBy=${sortKey}&order=${sortOrder}`,
          { withAuth: true },
        );

        if (res.status === 200) {
          const { items, meta } = res.data.data;
          setCartAddedProducts(items);
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
    fetchCartAddedProducts(sortKey, sortOrder);
  }, [fetchCartAddedProducts, sortKey, sortOrder]);

  return (
    <>
      <Head>
        <title>Cart Added Products</title>
      </Head>
      <CentralLoader loading={isLoading} />
      <Layout>
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-1">
          <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
            Cart Added Products
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
          </div>
        </div>

        <div className="space-y-10">
          <DynamicTable
            data={CartAddedProducts}
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
                sortable: false,
                render: (_value, row) => row?.product?.name ?? "-",
              },
              {
                key: "category",
                label: "Category",
                sortable: false,
                render: (_value, row) => row?.product?.category?.name ?? "-",
              },
              {
                key: "sub_category",
                label: "Sub Category",
                sortable: false,
                render: (_value, row) =>
                  row?.product?.sub_category?.name ?? "-",
              },
              {
                key: "brand",
                label: "Brand",
                sortable: false,
                render: (_value, row) => row?.product?.brand?.name ?? "-",
              },
              {
                key: "quantity",
                label: "Quantity",
                sortable: true,
                render: (_value, row) => row?.total_quantity ?? "-",
              },
              {
                key: "amount",
                label: "Amount",
                sortable: true,
                render: (_value, row) => row?.total_amount ?? "-",
              },
              {
                key: "unique_users_count",
                label: "Unique Users",
                sortable: false,
                render: (_value, row) => row?.unique_users_count ?? "-",
              },
            ]}
          />
        </div>
      </Layout>
    </>
  );
}

export default CartAddedProducts;
