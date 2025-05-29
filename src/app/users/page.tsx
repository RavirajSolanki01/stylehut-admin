"use client";
import { SearchIcon } from "@/assets/icons";
import dayjs from "dayjs";
import Head from "next/head";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";

import Layout from "@/components/Layouts";
import { DynamicTable } from "@/components/Tables/DynamicTables";
import apiService from "@/services/base.services";
import { IUser, IUserApiResponse } from "@/types/interface";
import { DEFAULT_PAGINATION } from "@/utils/common";
import useDebounce from "@/hooks/useDebounce";
import { CentralLoader } from "@/components/Loader";

type ColumnConfig<T> = {
  key: keyof T;
  label: string;
  sortable: boolean;
  render?: (value: any, row: T) => React.ReactNode;
};

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [user, setUser] = useState<IUser[]>([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [sortKey, setSortKey] = useState<keyof IUser | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCategories = useCallback(
    async (sortKey = "", sortOrder = "") => {
      try {
        setIsLoading(true);
        const { page, pageSize } = pagination;
        const res: IUserApiResponse = await apiService.get(
          `/user?page=${page}&pageSize=${pageSize}&search=${searchTerm}&sortBy=${sortKey}&order=${sortOrder}`,
          { withAuth: true },
        );

        if (res.status === 200) {
          const { items, meta } = res.data.data;
          setUser(items);
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

  const handleSort = (key: keyof IUser) => {
    const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(newOrder);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const columns: ColumnConfig<IUser>[] = [
    {
      key: "first_name",
      label: "First Name",
      sortable: true,
      render: (_value, row) => row.first_name ?? "-",
    },
    {
      key: "last_name",
      label: "Last Name",
      sortable: true,
      render: (_value, row) => row.last_name ?? "-",
    },
    { key: "email", label: "Email", sortable: true },
    {
      key: "mobile",
      label: "Mobile",
      sortable: true,
      render: (_value, row) => row.mobile ?? "-",
    },
    {
      key: "gender",
      label: "Gender",
      sortable: true,
      render: (_value, row) => row?.gender?.name ?? "-",
    },
    {
      key: "birth_date",
      label: "Date of Birth",
      sortable: true,
      render: (val) =>
        typeof val === "string" ||
        typeof val === "number" ||
        val instanceof Date
          ? dayjs(val).format("MMM DD, YYYY")
          : "-",
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (_value, row) => row.role?.name ?? "-",
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
  ];

  return (
    <>
      <Head>
        <title>Users</title>
      </Head>
      <CentralLoader loading={isLoading} />
      <Layout>
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-1">
          <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
            Users
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
            data={user}
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

export default UsersPage;
