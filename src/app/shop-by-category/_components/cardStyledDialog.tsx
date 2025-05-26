"use client";

import { useEffect, useState } from "react";
import { ChromePicker, ColorResult } from "react-color";
import Image from "next/image";
import { toast } from "react-toastify";

import { SmallLoader } from "@/components/Loader";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog/components/Dialog";
import { Button as DialogButton } from "@/components/Button/Button";
import { cardPreviewImg } from "@/assets/logos";
import apiService from "@/services/base.services";
import { ICardStyleResponse } from "@/types/interface";

interface ICardStyledProps {
  toggleDialog: () => void;
  isCardOpen: boolean;
}

const CardStyledDialog: React.FC<ICardStyledProps> = ({
  toggleDialog,
  isCardOpen,
}) => {
  const [isLoading, setIsLoading] = useState(false);
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

  const fetchCardStyle = async () => {
    try {
      setIsLoading(true);
      const res: ICardStyleResponse = await apiService.get(
        `/admin-category-settings`,
        { withAuth: true },
      );

      if (res.data.status === 200) {
        const { data } = res.data;
        setCardColorOption((prevState) => ({
          ...prevState,
          backgroundColor: data.cardColor,
          textColor: data.fontColor,
        }));
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
  };

  const handleApplyClick = () => {
    updateCardStyle();
  };

  const updateCardStyle = async () => {
    setIsLoading(true);

    try {
      const response: ICardStyleResponse = await apiService.put(
        `/admin-category-settings`,
        {
          fontColor: cardColorOption.textColor,
          cardColor: cardColorOption.backgroundColor,
        },
        { withAuth: true },
      );

      if (response?.data.status === 200) {
        toast.success("Card style updated successfully");
        fetchCardStyle();
        toggleDialog();
      }
    } catch (error: any) {
      console.log("Error creating/updating category:", error?.message || error);
      const msg =
        error.response.data.message ||
        "Something went wrong. Please try again later.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCardStyle();
  }, []);

  return (
    <Dialog open={isCardOpen} onOpenChange={() => toggleDialog()}>
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
              onChange={(newColor) => handleTextColorChange(newColor, "text")}
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
          <DialogButton
            type="button"
            variant="destructive"
            className="w-full max-w-[160px] bg-primary text-white"
            onClick={handleApplyClick}
            disabled={isLoading}
          >
            Apply <SmallLoader loading={isLoading} />
          </DialogButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CardStyledDialog;
