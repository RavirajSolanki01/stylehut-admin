"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import NextTopLoader from "nextjs-toploader";

import apiService from "@/services/base.services";
import { SmallLoader, CentralLoader } from "@/components/Loader";
import { addAuthToken, addUserRole } from "@/store/slice/auth.slice";
import { RootState } from "@/store";
import { updateOtpAttempts } from "@/store/slice/otp.slice";
import {
  IOtpExpiryLimitResponse,
  IResendOtpExpiryLimitResponse,
} from "@/types/interface";
import OtpTimer from "@/components/OtpTimer";

//@ts-expect-error
const OTPInput = dynamic(() => import("otp-input-react"), {
  ssr: false,
});

const OtpVerify = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { attempts } = useSelector((state: RootState) => state.otp);
  const email = searchParams.get("email");
  const [isLoading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpLimitExpiry, setOtpLimitExpiry] = useState("");
  const [resendOtpLimitExpiry, setResendOtpLimitExpiry] = useState("");
  const [otpLimitExpiryErr, setOtpLimitExpiryErr] = useState("");

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
      dispatch(updateOtpAttempts());
    },
  });

  const handleOtpChange = (value: string) => {
    formik.setFieldValue("otp", value);
  };

  const verifyOtp = async (otp: string) => {
    setLoading(true);
    const isLastAttempt = attempts === 2;
    try {
      const response: {
        data: {
          token: string;
          isNewUser: boolean;
          role: string;
          isActive: boolean;
        };
        status: number;
      } = await apiService.post("/admin-verify-otp", {
        otp,
        email,
        isLastAttempt,
      });
      if (response.status === 200) {
        const { isNewUser, token, isActive, role } = response.data;

        toast.success("Email verification successful");
        dispatch(addUserRole({ role }));
        dispatch(updateOtpAttempts(true));

        const userRoutes = {
          isExistingActiveUser: !isNewUser && token && isActive,
          isPendingAdminApproval: isActive && role === "Admin",
          isDeactivatedAdmin: !isActive && role === "Admin",
        };

        if (userRoutes.isExistingActiveUser) {
          dispatch(addAuthToken({ token }));
          router.push("/");
        } else if (userRoutes.isPendingAdminApproval) {
          router.push(`/auth/admin-request-info?email=${email}`);
        } else if (userRoutes.isDeactivatedAdmin) {
          router.push(`/auth/admin-deactivate-info?email=${email}`);
        }
      }
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 400) {
        const { message } = error.response.data;
        setOtpLimitExpiry(error.response.data.data.expiry_otp_limit);
        if (message === "Invalid OTP") {
          toast.error(message);
        } else {
          setOtpLimitExpiryErr(message);
        }
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
        setResendOtpLimitExpiry(error.response.data.data.resend_opt_limit),
          toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong, please try again later.");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const fetchOtpExpiryLimit = async () => {
    try {
      setLoading(true);
      const response: IOtpExpiryLimitResponse = await apiService.get(
        `/time-limit-otp?email=${email}`,
      );
      if (response.status === 200) {
        const { otp_limit_expires_at, message } = response.data.data;
        setOtpLimitExpiry(otp_limit_expires_at);
        setOtpLimitExpiryErr(message);
      }
    } catch (error: any) {
      toast.error("Something went wrong, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchResendOtpExpiryLimit = async () => {
    try {
      setLoading(true);
      const response: IResendOtpExpiryLimitResponse = await apiService.get(
        `/resend-otp?email=${email}`,
      );
      if (response.status === 200) {
        setResendOtpLimitExpiry(response.data.data.resend_otp_limit_expires_at);
      }
    } catch (error: any) {
      toast.error("Something went wrong, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: any;

    if (resendOtpLimitExpiry) {
      interval = setInterval(() => {
        const now = Date.now();
        const expiryTime = new Date(resendOtpLimitExpiry).getTime();

        if (now >= expiryTime) {
          setResendOtpLimitExpiry("");
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [resendOtpLimitExpiry]);

  useEffect(() => {
    let interval: any;

    if (otpLimitExpiry) {
      interval = setInterval(() => {
        const now = Date.now();
        const expiryTime = new Date(otpLimitExpiry).getTime();

        if (now >= expiryTime) {
          setOtpLimitExpiry("");
          setOtpLimitExpiryErr("");
          dispatch(updateOtpAttempts(true));
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [otpLimitExpiry]);

  useEffect(() => {
    fetchOtpExpiryLimit();
    fetchResendOtpExpiryLimit();
  }, []);

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
          {resendOtpLimitExpiry !== "" &&
          new Date(resendOtpLimitExpiry) > new Date() ? (
            <div className="mt-[25px]">
              <OtpTimer otpLimitExpiry={resendOtpLimitExpiry} />
            </div>
          ) : (
            <></>
          )}
          <div className="flex w-full justify-center">
            <button
              className={`mb-2 mt-[25px] text-center text-sm font-medium ${
                otpLimitExpiryErr ||
                (resendOtpLimitExpiry !== "" &&
                  new Date(resendOtpLimitExpiry) > new Date())
                  ? "opacity-75"
                  : "cursor-pointer"
              }`}
              type="button"
              onClick={resendOtp}
              disabled={
                otpLimitExpiryErr !== "" ||
                (resendOtpLimitExpiry !== "" &&
                  new Date(resendOtpLimitExpiry) > new Date())
              }
            >
              Resend OTP?
            </button>
          </div>

          {formik.errors.otp && (
            <p className="mt-2 flex w-full justify-center text-xs text-red">
              {formik.errors.otp}
            </p>
          )}

          <p className="mt-2 text-xs text-red">{otpLimitExpiryErr}</p>

          <button
            type="submit"
            className={`mt-6 flex w-full items-center justify-center gap-1 rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90 ${isLoading || (otpLimitExpiry !== "" && new Date(otpLimitExpiry) > new Date() && "opacity-75")}`}
            disabled={
              isLoading ||
              (otpLimitExpiry !== "" && new Date(otpLimitExpiry) > new Date())
            }
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
