"use client";

import { Button } from "@/components/Button";
import CommonDialog from "@/components/Dialog/CommonDialog";
import Layout from "@/components/Layouts";
import { CentralLoader } from "@/components/Loader";
import { DynamicTable } from "@/components/Tables/DynamicTables";
import apiService from "@/services/base.services";
import { ISize, ISizeApiResponse } from "@/types/interface";
import { DEFAULT_PAGINATION } from "@/utils/common";
import dayjs from "dayjs";
import { EditIcon, Plus, SearchIcon, TrashIcon } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

const Sizes = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<keyof ISize | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteSizeIds, setDeleteSizeIds] = useState([]);

  //   const [sizes, setSizes] = useState<ISizeApiResponse>({ data: [], status: 0 });
  const [sizes, setSizes] = useState<any>();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const fetchSizes = useCallback(
    async (sortKey = "", sortOrder = "") => {
      try {
        setIsLoading(true);
        const { page, pageSize } = pagination;

        const res: any = await apiService.get(`/size`, { withAuth: true });

        if (res.status === 200) {
          const { data } = res.data;
          let nameCounts: any = {};
          for (let i = 0; i < data.length; i++) {
            const { id, name, has_size_chart } = data[i];

            console.log(data[i], "rfrfrf");

            if (!nameCounts[name]) {
              nameCounts[name] = { name, count: 0, ids: [], has_size_chart };
            }
            nameCounts[name].count++;
            nameCounts[name].ids.push(id);
          }

          setSizes(Object.values(nameCounts));
          console.log(
            ">><< SIZES DATA",
            Object.values(nameCounts),
            "==================",
            res.data.data,
          );

          //   setPagination({
          //     page: meta.page,
          //     pageSize: meta.pageSize,
          //     total: meta.totalItems,
          //     totalPages: meta.totalPages,
          //   });
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
    [pagination.page, pagination.pageSize],
  );

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  useEffect(() => {
    fetchSizes(sortKey, sortOrder);
  }, []);

  const handleCreate = () => {
    router.push("/sizes/new");
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await apiService.delete(
        `/size?ids=${deleteSizeIds.join(",")}`,
        { withAuth: true },
      );
      if (response.status === 200) {
        console.log(response, "response from sizes delete");
        toast.success("Successfully deleted the Size.");
      }
      fetchSizes();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  const openDeleteConfirmation = (id: any) => {
    // setCategoryTypeId(id);
    console.log("DDDDCCCC ", id.ids);
    setDeleteSizeIds(id.ids as []);
    setIsDialogOpen(true);
  };

  const handleEdit = (id: any) => {
    console.log("DDDDCCCC ", id.ids);
    router.push(`/sizes/edit?ids=${id.ids}`);
  };
  return (
    <div>
      <Head>
        <title>Sizes</title>
      </Head>
      <CentralLoader loading={isLoading} />
      <Layout>
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-1">
          <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
            Sizes
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
              title="Size"
              onClick={handleCreate}
              icon={<Plus size={20} />}
            />
          </div>
        </div>

        <div className="space-y-10">
          <DynamicTable
            data={sizes || []}
            totalPages={pagination.totalPages}
            currentPage={pagination.page}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSort={() => {}}
            handlePageChange={handlePageChange}
            columns={[
              { key: "name", label: "Name", sortable: true },
              {
                key: "has_size_chart",
                label: "Size chart",
                sortable: true,
                render: (_value, row) => (
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      row.has_size_chart
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {row.has_size_chart ? "Available" : "Not Available"}
                  </span>
                ),
              },
              {
                key: "count",
                label: "Total sizes",
                sortable: true,
              },
            ]}
            actions={(row) => (
              <div className="flex items-center justify-end gap-x-3">
                <button
                  className="hover:text-primary"
                  onClick={() => handleEdit(row)}
                  title="Edit coupon"
                >
                  <EditIcon />
                </button>
                <button
                  className="hover:text-primary"
                  onClick={() => openDeleteConfirmation(row)}
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
            description="Are you sure, you want to delete this Size?"
            onConfirm={handleDeleteConfirm}
          />
        </div>
      </Layout>
    </div>
  );
};

export default Sizes;
