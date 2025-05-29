"use client";
import Head from "next/head";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { BanIcon, UserPlusIcon } from "lucide-react";

import Layout from "@/components/Layouts";
import { DynamicTable } from "@/components/Tables/DynamicTables";
import apiService from "@/services/base.services";
import { IUser, IUserApiResponse } from "@/types/interface";
import { DEFAULT_PAGINATION } from "@/utils/common";
import useDebounce from "@/hooks/useDebounce";
import { CentralLoader } from "@/components/Loader";
import {
  CheckCircleIcon,
  XCircleIcon,
} from "@/components/Layouts/sidebar/icons";
import CommonDialog from "@/components/Dialog/CommonDialog";
import { SearchIcon } from "@/assets/icons";

type ColumnConfig<T> = {
  key: keyof T;
  label: string;
  sortable: boolean;
  render?: (value: any, row: T) => React.ReactNode;
};

const PendingRequestPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<IUser[]>([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [sortKey, setSortKey] = useState<keyof IUser | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchUsers = useCallback(
    async (sortKey = "", sortOrder = "") => {
      try {
        setIsLoading(true);
        const { page, pageSize } = pagination;
        const res: IUserApiResponse = await apiService.get(
          `/user?page=${page}&pageSize=${pageSize}&search=${searchTerm}&sortBy=${sortKey}&order=${sortOrder}&role=${"Admin"}`,
          { withAuth: true },
        );

        if (res.status === 200) {
          const { items, meta } = res.data.data;
          const adminUsers = items.filter((user) => user.role.name === "Admin");
          setUser(adminUsers);
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
    fetchUsers(sortKey, sortOrder);
  }, [fetchUsers, sortKey, sortOrder]);

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

  const handleActivateUser = async (row: IUser) => {
    if (!selectedUser) return;
    try {
      setIsLoading(true);
      const response: {
        data: {
          message: string;
        };
        status: number;
      } = await apiService.put(
        "/user/approve",
        { userId: row?.id },
        { withAuth: true },
      );
      const data = response.data;
      if (data) {
        toast.success(data.message);
        fetchUsers(sortKey, sortOrder);
      }
    } catch (error) {
      console.error("Error saving privacy policy:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAdminActivation = async (row: IUser) => {
    try {
      setIsLoading(true);
      const response: {
        data: {
          message: string;
        };
        status: number;
      } = await apiService.put(
        "/user/access",
        { userId: row?.id, ActiveStatus: !row.is_active },
        { withAuth: true },
      );
      const data = response.data;
      if (data) {
        toast.success(data.message);
        fetchUsers(sortKey, sortOrder);
      }
    } catch (error) {
      console.error("Error saving privacy policy:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveClick = (user: IUser) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
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
      key: "role",
      label: "Role",
      sortable: true,
      render: (_value, row) => row.role?.name ?? "-",
    },
    {
      key: "is_active",
      label: "Action",
      sortable: false,
      render: (_value, row) => {
        const isApproved = row.is_approved;
        const isActive = row.is_active;

        if (!isApproved) {
          return (
            <div className="flex gap-2">
              <div className="group relative inline-block">
                <button
                  onClick={() => handleApproveClick(row)}
                  className="flex items-center justify-center gap-2 rounded-md bg-green-500 p-1.5 text-white transition-colors hover:bg-green-600"
                >
                  <CheckCircleIcon />
                </button>
                <div className="absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 scale-0 transform rounded bg-gray-700 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                  Approve
                </div>
              </div>

              <div className="group relative inline-block">
                <button
                  // onClick={() => handleRejectClick(row)}
                  className="flex items-center justify-center gap-2 rounded-md bg-red-500 p-1.5 text-white transition-colors hover:bg-red-600"
                >
                  <XCircleIcon />
                </button>
                <div className="absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 scale-0 transform rounded bg-gray-700 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                  Reject
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="group relative inline-block">
            <button
              onClick={() => handleToggleAdminActivation(row)}
              className={`flex items-center justify-center gap-2 rounded-md p-1.5 text-white transition-colors ${
                isActive
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isActive ? (
                <BanIcon className="h-5 w-5" />
              ) : (
                <UserPlusIcon className="h-5 w-5" />
              )}
            </button>
            <div className="absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 scale-0 transform rounded bg-gray-700 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
              {isActive ? "Deactivate" : "Activate"}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Head>
        <title>Pending Admin Users Requests</title>
      </Head>
      <CentralLoader loading={isLoading} />
      <Layout>
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-1">
          <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
            Pending Requests
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

        <CommonDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onConfirm={() => handleActivateUser(selectedUser as IUser)}
          confirmLabel="Approve"
          description={`Are you sure you want to approve this admin request?`}
          title="Approve Admin Request"
        />
      </Layout>
    </>
  );
};

export default PendingRequestPage;
