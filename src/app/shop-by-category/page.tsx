"use client";

import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { Palette, Plus } from "lucide-react";
import { ChromePicker, ColorResult } from "react-color";
import Image from "next/image";

import Layout from "@/components/Layouts";
import { CentralLoader } from "@/components/Loader";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog/components/Dialog";
import { Button } from "@/components/Button";
import { Button as DialogButton } from "@/components/Button/Button";
import { SearchIcon } from "@/assets/icons";
import { cardPreviewImg } from "@/assets/logos";
import apiService from "@/services/base.services";
import { IGenderApiResponse } from "@/types/interface";
import { toast } from "react-toastify";
import page from "../(home)/page";

const shopByCategory = () => {
  const [isCardOpen, setIsCardOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
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

  // const fetchCardColorSetting = useCallback(async () => {
  //   try {
  //     setIsLoading(true);
  //     const { textColor, backgroundColor } = cardColorOption;
  //     const res: IGenderApiResponse = await apiService.get(
  //       `/gender?page=${page}&pageSize=${pageSize}&search=${searchTerm}&sortBy=${sortKey}&order=${sortOrder}`,
  //       { withAuth: true },
  //     );

  //     if (res.status === 200) {
  //       const { items, meta } = res.data.data;
  //       setGender(items);
  //       setPagination(meta);
  //     }
  //   } catch (error: any) {
  //     if (!error?.response?.data?.success) {
  //       toast.error(error.response?.data?.message);
  //       return;
  //     }
  //     toast.error("Something went wrong, please try again later.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [pagination.page, pagination.pageSize, debouncedSearchTerm]);

  // useEffect(() => {
  //   fetchCardColorSetting();
  // }, [fetchCardColorSetting]);

  return (
    <>
      <Head>
        <title>Shop by category</title>
      </Head>
      <CentralLoader loading={false} />
      <Layout>
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-1">
          <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
            Shop by category
          </h2>

          <div className="flex w-full items-center gap-2 sm:w-fit">
            <div className="relative w-full sm:max-w-[300px]">
              <input
                type="search"
                // value={searchTerm}
                // onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search"
                className="w-full rounded-full border-[2px] bg-white py-2.5 pl-[53px] pr-5 text-base outline-none transition-colors focus-visible:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-dark-4 dark:hover:bg-dark-3 dark:focus-visible:border-primary"
              />
              <SearchIcon className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 max-[1015px]:size-5" />
            </div>
            <Button
              label=""
              shape="rounded"
              variant="primary"
              // onClick={handleCreate}
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
              <DialogClose asChild>
                <DialogButton
                  type="button"
                  variant="destructive"
                  className="w-full max-w-[150px] bg-primary text-white"
                >
                  Apply
                </DialogButton>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Layout>
    </>
  );
};

export default shopByCategory;
