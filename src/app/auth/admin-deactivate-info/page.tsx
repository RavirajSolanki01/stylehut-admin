"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserAccountIcon } from "@/assets/icons";
import { toast } from "react-toastify";
import apiService from "@/services/base.services";
import { SmallLoader } from "@/components/Loader";

const AccountDeactivated = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSupportClick = async () => {
    setLoading(true);
    try {
      const response = await apiService.post("/contact-support-request", {
        email: email,
      });
      if (response.status === 200) {
        toast.success(
          "Your request has been received. We’ll get back to you soon.",
        );
        router.push("/auth/login");
      }
    } catch (error: any) {
      if (error.status === 404) {
        toast.error("User not found");
      }
      if (error.status === 400) {
        toast.error("Email is required");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10 dark:bg-[#0e1726]">
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg dark:bg-[#020d1a]">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center">
            <UserAccountIcon />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Your Account is Deactivated
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            It looks like your account has been deactivated by the super admin.
            If you believe this is a mistake or need further assistance, please
            contact support.
          </p>

          <button
            onClick={handleSupportClick}
            disabled={loading}
            className="mt-4 w-full rounded-md bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-600"
          >
            Contact Support <SmallLoader loading={loading} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountDeactivated;
