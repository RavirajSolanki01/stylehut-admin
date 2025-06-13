"use client";
import { SearchIcon } from "@/assets/icons";
import { Button } from "@/components/Button";
import Layout from "@/components/Layouts";
import { CentralLoader } from "@/components/Loader";
import { DynamicTable } from "@/components/Tables/DynamicTables";
import useDebounce from "@/hooks/useDebounce";
import apiService from "@/services/base.services";
import { IBrand } from "@/types/interface";
import {
  BLOCKED_ORDER_STATUS,
  DEFAULT_PAGINATION,
  ORDER_STATUS,
} from "@/utils/common";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [sortKey, setSortKey] = useState<keyof IBrand | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [orders, setOrders] = useState<Array<any>>([]);

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

  const fetchOrders = useCallback(
    async (sortKey = "", sortOrder = "") => {
      try {
        setIsLoading(true);
        const { page, pageSize } = pagination;
        const res: any = await apiService.get(
          `/orders/admin?page=${page}&pageSize=${pageSize}&search=${searchTerm}&sortBy=${sortKey}&order=${sortOrder}`,
          { withAuth: true },
        );

        if (res.status === 200) {
          const { items, meta } = res.data.data;
          setOrders(items);
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

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      setIsLoading(true);
      const res: any = await apiService.put(
        `/orders/${id}/status`,
        {
          status: status,
          comment: status,
        },
        {
          withAuth: true,
        },
      );

      if (res.status === 200) {
        fetchOrders();
        toast.success("Order Status Updated Successfully.");
      }
    } catch (error: any) {
      setIsLoading(false);
      if (!error?.response?.data?.success) {
        toast.error(error.response?.data?.message);
        return;
      }
      toast.error("Something went wrong, please try again later.");
    }
  };

  useEffect(() => {
    fetchOrders(sortKey, sortOrder);
  }, [fetchOrders, sortKey, sortOrder]);

  const toPascalCaseWithSpaces = (str: string): string => {
    return str
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    updateOrderStatus(id, newStatus);
  };

  const getAllowedStatuses = (currentStatus: string) => {
    const currentIndex = ORDER_STATUS.indexOf(currentStatus);

    return ORDER_STATUS.filter((status, index) => {
      if (status === currentStatus) return true;
      if (BLOCKED_ORDER_STATUS.includes(status)) return false;
      return index >= currentIndex;
    });
  };

  return (
    <>
      <Head>
        <title>Orders</title>
      </Head>
      <CentralLoader loading={isLoading} />
      <Layout>
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-1">
          <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
            Orders
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
            data={orders}
            totalPages={pagination.totalPages}
            currentPage={pagination.page}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSort={handleSort}
            handlePageChange={handlePageChange}
            actions={(row) => (
              <div className="flex items-center justify-end">
                <select
                  className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={row.order_status}
                  onChange={(e) => handleStatusChange(row.id, e.target.value)}
                >
                  {getAllowedStatuses(row.status).map((status) => (
                    <option
                      key={status}
                      value={status}
                      disabled={
                        status !== row.status &&
                        ORDER_STATUS.indexOf(status) <
                          ORDER_STATUS.indexOf(row.status)
                      }
                      className="disabled:text-gray-400"
                    >
                      {status.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>{" "}
              </div>
            )}
            columns={[
              {
                key: "order_number",
                label: "Order Id",
                sortable: false,
                render: (_value, row) => row?.order_number ?? "-",
              },
              {
                key: "name",
                label: "Name",
                sortable: false,
                render: (_value, row) => row?.items[0]?.product?.name ?? "-",
              },
              {
                key: "category",
                label: "Category",
                sortable: false,
                render: (_value, row) =>
                  row?.items[0]?.product?.category?.name ?? "-",
              },
              {
                key: "sub_category",
                label: "Sub Category",
                sortable: false,
                render: (_value, row) =>
                  row?.items[0]?.product?.sub_category?.name ?? "-",
              },
              {
                key: "brand",
                label: "Brand",
                sortable: false,
                render: (_value, row) =>
                  row?.items[0]?.product?.brand?.name ?? "-",
              },
              {
                key: "order_status",
                label: "Order Status",
                sortable: false,
                render: (_value, row) =>
                  toPascalCaseWithSpaces(row?.order_status) ?? "-",
              },
              {
                key: "payment_method",
                label: "Payment Method",
                sortable: false,
                render: (_value, row) =>
                  toPascalCaseWithSpaces(row?.payment_method) ?? "-",
              },
              {
                key: "final_amount",
                label: "Amount",
                sortable: false,
                render: (_value, row) => row?.final_amount ?? "-",
              },
            ]}
          />
        </div>
      </Layout>
    </>
  );
}

export default Orders;
