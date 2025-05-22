"use client";

import { useState } from "react";
import Head from "next/head";

import Layout from "@/components/Layouts";
import { DynamicTable } from "@/components/Tables/DynamicTables";
import { CentralLoader } from "@/components/Loader";
import ImageHoverPreview from "@/components/ImageHoverPreview";
import { SearchIcon } from "@/assets/icons";
import { DEFAULT_PAGINATION } from "@/utils/common";
import { IWishlistTableAttr } from "@/types/interface";

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
  const [searchValue, setSearchValue] = useState<string>("");

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

  const columns: ColumnConfig<IWishlistTableAttr>[] = [
    {
      key: "userEmail",
      label: "User Email",
      sortable: false,
      render: (_value, row) => row.userEmail.trim() || "-",
    },
    {
      key: "name",
      label: "Product Name",
      sortable: true,
      render: (_value, row) => row.name ?? "-",
    },
    {
      key: "productImage",
      label: "Product Image",
      sortable: true,
      render: (_value, row) => (
        <ImageHoverPreview images={row.productImage || []} />
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (_value, row) => row.category ?? "-",
    },
    {
      key: "sub_category",
      label: "Sub Category",
      sortable: true,
      render: (_value, row) => row.sub_category ?? "-",
    },
    {
      key: "sub_category_type",
      label: "Sub Category Type",
      sortable: true,
      render: (_value, row) => row.sub_category_type ?? "-",
    },
    {
      key: "brand",
      label: "Brand",
      sortable: true,
      render: (_value, row) => row.brand ?? "-",
    },
  ];
  return (
    <>
      <Head>
        <title>Wishlist</title>
      </Head>
      <CentralLoader loading={false} />
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
            data={[]}
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
