"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import NextTopLoader from "nextjs-toploader";

import apiService from "@/services/base.services";
import { SmallLoader, CentralLoader } from "@/components/Loader";
import { useDispatch } from "react-redux";
import { addAuthToken } from "@/store/slice/auth.slice";

//@ts-expect-error
const OTPInput = dynamic(() => import("otp-input-react"), {
  ssr: false,
});

const OtpVerify = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const email = searchParams.get("email");
  const [isLoading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Email is required to verify OTP.");
      router.push("/auth/login");
    }
  }, [email, router]);

  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: Yup.object({
      otp: Yup.string()
        .required("OTP is required")
        .matches(/^\d{4}$/, "Invalid OTP format"),
    }),
    onSubmit: (values) => {
      verifyOtp(values.otp);
    },
  });

  const handleOtpChange = (value: string) => {
    formik.setFieldValue("otp", value);
  };

  const verifyOtp = async (otp: string) => {
    setLoading(true);
    try {
      const response: {
        data: {
          token: string;
        };
        status: number;
      } = await apiService.post("/admin-verify-otp", {
        otp,
        email,
      });
      if (response.status === 200) {
        toast.success("Email verification successful");
        dispatch(addAuthToken({ token: response.data.token }));
        router.push("/");
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

  const resendOtp = async () => {
    setOtpLoading(true);
    try {
      const response: { status: number } = await apiService.post(
        "/resend-otp",
        {
          email,
        },
      );
      if (response.status === 200) {
        toast.success("OTP resent successfully");
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong, please try again later.");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="flex h-fit min-h-screen w-full items-center justify-center">
      <CentralLoader loading={otpLoading} />
      <div className="w-full max-w-[400px] rounded-lg bg-white p-6 shadow-md dark:bg-[#020d1a]">
        <form onSubmit={formik.handleSubmit} noValidate>
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
            OTP Verify
          </h2>

          <OTPInput
            //@ts-expect-error
            value={formik.values.otp}
            className="react-otp-input-container"
            onChange={handleOtpChange}
            autoFocus
            OTPLength={4}
            otpType="number"
            disabled={false}
          />

          <p
            className="my-2 cursor-pointer text-center text-sm font-medium"
            onClick={resendOtp}
          >
            Resend OTP?
          </p>

          {formik.errors.otp && (
            <p className="mt-2 flex w-full justify-center text-xs text-red">
              {formik.errors.otp}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center gap-1 rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90"
            disabled={isLoading}
          >
            Verify <SmallLoader loading={isLoading} />
          </button>
        </form>
      </div>
    </div>
  );
};

const OtpVerifyPage = () => {
  return (
    <Suspense fallback={<NextTopLoader color="#5750F1" showSpinner={false} />}>
      <OtpVerify />
    </Suspense>
  );
};

export default OtpVerifyPage;
