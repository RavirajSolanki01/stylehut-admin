"use client";
import React, { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import { useDispatch } from "react-redux";
import { CentralLoader, SmallLoader } from "@/components/Loader";
import { ReviewMagnifierIcon } from "@/assets/icons";

const CheckAdminActivate = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

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
