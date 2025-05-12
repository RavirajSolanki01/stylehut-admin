"use client";

import { EditIcon, SearchIcon, TrashIcon } from "@/assets/icons";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";

import Layout from "@/components/Layouts";
import { DynamicTable } from "@/components/Tables/DynamicTables";
import { Button } from "@/components/Button";
import apiService from "@/services/base.services";
import { ICoupon, ICouponApiResponse } from "@/types/interface";
import { DEFAULT_PAGINATION } from "@/utils/common";
import useDebounce from "@/hooks/useDebounce";
import { CentralLoader } from "@/components/Loader";
import CommonDialog from "@/components/Dialog/CommonDialog";
import dayjs from "dayjs";

const CouponPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [sortKey, setSortKey] = useState<keyof ICoupon | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [couponId, setCouponId] = useState<number>(0);

  const handleDeleteConfirm = async () => {
    try {
      const res = await apiService.delete(`/coupon/${couponId}`, {
        withAuth: true,
      });

      if (res.status === 200) {
        toast.success("Coupon deleted successfully");
        const updated = coupons.filter((item) => item.id !== couponId);

        if (updated.length > 0) {
          setCoupons(updated);
        } else if (pagination.page > 1) {
          setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
        } else {
          fetchCoupons();
        }
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to delete coupon";
      toast.error(msg);
    }
  };

  const fetchCoupons = useCallback(
    async (sortKey = "", sortOrder = "") => {
      try {
        setIsLoading(true);
        const { page, pageSize } = pagination;
        
        const res: ICouponApiResponse = await apiService.get(
          `/coupon?page=${page}&pageSize=${pageSize}&search=${debouncedSearchTerm}&sortBy=${sortKey}&order=${sortOrder}`,
          { withAuth: true },
        );

        if (res.status === 200) {
          const { items, meta } = res.data.data;
          
          setCoupons(items);
          setPagination({
            page: meta.page,
            pageSize: meta.pageSize,
            total: meta.totalItems,
            totalPages: meta.totalPages,
          });
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
    fetchCoupons(sortKey, sortOrder);
  }, [fetchCoupons, sortKey, sortOrder, debouncedSearchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPagination(DEFAULT_PAGINATION);
  };

  const handleSort = (key: keyof ICoupon) => {
    const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(newOrder);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleCreate = () => router.push("/coupon/new");

  const handleEdit = (id: number) => router.push(`/coupon/${id}`);

  const openDeleteConfirmation = (id: number) => {
    setCouponId(id);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Head>
        <title>Coupon</title>
      </Head>
      <CentralLoader loading={isLoading} />
      <Layout>
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-1">
          <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
            Coupon
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
              size="small"
              title="Coupon"
              onClick={handleCreate}
              icon={<Plus size={20} />}
            />
          </div>
        </div>

        <div className="space-y-10">
          <DynamicTable
            data={coupons}
            totalPages={pagination.totalPages}
            currentPage={pagination.page}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSort={handleSort}
            handlePageChange={handlePageChange}
            columns={[
              { key: "code", label: "Code", sortable: true },
              // { key: "description", label: "Description", sortable: true },
              {
                key: "discount",
                label: "Discount",
                sortable: true,
                render: (_value, row) => {
                  const discount = Number(row.discount) || 0;
                  return `${discount}%`;
                },
              },
              {
                key: "max_savings_amount",
                label: "Max Savings Amount",
                sortable: true,
                render: (val) =>
                  val && (typeof val === "string" || typeof val === "number")
                    ? `₹${val}`
                    : "-",
              },
              {
                key: "min_order_amount",
                label: "Min Order Amount",
                sortable: true,
                render: (val) =>
                  val && (typeof val === "string" || typeof val === "number")
                    ? `₹${val}`
                    : "-",
              },
              {
                key: "expiry_date",
                label: "Expiry Date",
                sortable: true,
                render: (val) =>
                  val && (typeof val === "string" || typeof val === "number")
                    ? dayjs(val).format("MMM DD, YYYY")
                    : "-",
              },
              {
                key: "is_active",
                label: "Status",
                sortable: true,
                render: (_value, row) => (
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      row.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {row.is_active ? "Active" : "Inactive"}
                  </span>
                ),
              },
            ]}
            actions={(row) => (
              <div className="flex items-center justify-end gap-x-3">
                <button
                  className="hover:text-primary"
                  onClick={() => handleEdit(row.id)}
                  title="Edit coupon"
                >
                  <EditIcon />
                </button>
                <button
                  className="hover:text-primary"
                  onClick={() => openDeleteConfirmation(row.id)}
                  title="Delete coupon"
                >
                  <TrashIcon />
                </button>
              </div>
            )}
          />
          <CommonDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onConfirm={handleDeleteConfirm}
          />
        </div>
      </Layout>
    </>
  );
};

export default CouponPage;
