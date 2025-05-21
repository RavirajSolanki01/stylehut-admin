"use client";
import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import { CentralLoader, SmallLoader } from "@/components/Loader";
import { ReviewMagnifierIcon } from "@/assets/icons";
import apiService from "@/services/base.services";
import { toast } from "react-toastify";

const CheckAdminActivate = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [loading, setLoading] = useState(false);

  const checkActivationStatus = async () => {
    setLoading(true);
    try {
      const response: {
        data: {
          message: string;
          role: string;
          is_approved: boolean;
        };
        status: number;
      } = await apiService.get(`admin-register/${email}`);
      if (response.status === 200 && response.data.is_approved) {
        toast.success("Congratulations, your account is activated");
        router.push("/");
      }else{
        toast.info("Your account is not activated yet, please wait for approval");
      }
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 400) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong, please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-fit min-h-screen w-full items-center justify-center">
      <CentralLoader loading={loading} />
      <div className="w-full max-w-[400px] rounded-lg bg-white p-6 shadow-md dark:bg-[#020d1a]">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-4 text-center">
            <ReviewMagnifierIcon className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-[#2c3e50] dark:text-white">
              We’re Reviewing Your Account
            </h2>
          </div>

          <p className="text-center font-medium text-[#696969] dark:text-white">
            You will be notified once your account is activated by the Super
            Admin.
          </p>

          <button
            disabled={loading}
            onClick={() => checkActivationStatus()}
            className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90"
          >
            Check Status <SmallLoader loading={loading} />
          </button>
        </div>
      </div>
    </div>
  );
};

const CheckAdminActivatePage = () => {
  return (
    <Suspense fallback={<NextTopLoader color="#5750F1" showSpinner={false} />}>
      <CheckAdminActivate />
    </Suspense>
  );
};

export default CheckAdminActivatePage;
