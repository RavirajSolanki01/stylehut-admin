"use client";
import { SearchIcon } from "@/assets/icons";
import dayjs from "dayjs";
import Head from "next/head";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";

import Layout from "@/components/Layouts";
import { DynamicTable } from "@/components/Tables/DynamicTables";
import apiService from "@/services/base.services";
import { IReview, IReviewApiResponse } from "@/types/interface";
import { DEFAULT_PAGINATION } from "@/utils/common";
import useDebounce from "@/hooks/useDebounce";
import { CentralLoader } from "@/components/Loader";
import ImageHoverPreview from "@/components/ImageHoverPreview";

const RatingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [rating, setRating] = useState<IReview[]>([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [sortKey, setSortKey] = useState<keyof IReview | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = useCallback(
    async (sortKey = "", sortOrder = "") => {
      try {
        setIsLoading(true);
        const { page, pageSize } = pagination;
        const res: IReviewApiResponse = await apiService.get(
          `/rating?page=${page}&pageSize=${pageSize}&search=${searchTerm}&sortBy=${sortKey}&order=${sortOrder}`,
          { withAuth: true },
        );

        if (res.status === 200) {
          const { items, meta } = res.data.data;
          setRating(items);
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

  const handleSort = (key: keyof IReview) => {
    const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(newOrder);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return (
    <>
      <Head>
        <title>Rating</title>
      </Head>
      <CentralLoader loading={isLoading} />
      <Layout>
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-1">
          <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
            Rating
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
            data={rating}
            totalPages={pagination.totalPages}
            currentPage={pagination.page}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSort={handleSort}
            handlePageChange={handlePageChange}
            columns={[
              {
                key: "product_id",
                label: "Product Name",
                sortable: true,
                render: (_value, row) => row.products.name ?? "-",
              },
              {
                key: "product.name" as any,
                label: "Product Image",
                render: (_value, row) => (
                  <ImageHoverPreview images={row.products.image || []} />
                ),
              },
              {
                key: "user_id",
                label: "User Name",
                sortable: true,
                render: (_value, row) =>
                  row.users?.first_name && row.users?.last_name
                    ? `${row.users.first_name} ${row.users.last_name}`
                    : "-",
              },
              { key: "ratings", label: "Rating", sortable: true },
              { key: "description", label: "Description", sortable: true },
              {
                key: "images",
                label: "Rating Image",
                render: (_value, row) => (
                  <ImageHoverPreview images={row.images || []} />
                ),
              },
              {
                key: "create_at",
                label: "Created",
                sortable: true,
                render: (val) =>
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
                render: (val) =>
                  typeof val === "string" ||
                  typeof val === "number" ||
                  val instanceof Date
                    ? dayjs(val).format("MMM DD, YYYY")
                    : "-",
              },
            ]}
          />
        </div>
      </Layout>
    </>
  );
};

export default RatingPage;
