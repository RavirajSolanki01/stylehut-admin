"use client";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import InputGroup from "@/components/FormElements/InputGroup";
import apiService from "@/services/base.services";
import { SmallLoader } from "@/components/Loader";

const Login = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.back();
  }, []);

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .trim()
        .email("Invalid email address")
        .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{1,}$/i, "Invalid email address")
        .required("Email is required"),
    }),
    onSubmit: (values) => {
      registerOrLoginUser(values.email);
    },
  });

  const registerOrLoginUser = async (email: string) => {
    setLoading(true);
    try {
      const response = await apiService.post("/admin-register", {
        email: email,
      });
      if (response.status === 200) {
        toast.success("OTP sent to your email");
        router.push(`/auth/otp-verify?email=${email}`);
      }
    } catch (error: any) {
      if (error.status === 409) {
        toast.error("This user already used in consumer side");
      } else {
        toast.error("Something went wrong, please try again later.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex h-fit min-h-screen w-full items-center justify-center">
      <div className="w-full max-w-[400px] rounded-lg bg-white p-6 shadow-md dark:bg-[#020d1a]">
        <form onSubmit={formik.handleSubmit} noValidate>
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
            Login / SignUp
          </h2>
          <InputGroup
            label="Email"
            type="email"
            placeholder="Enter your email address"
            className="mb-4.5"
            required
            name="email"
            value={formik.values.email}
            error={
              formik.touched.email && formik.errors.email
                ? formik.errors.email
                : ""
            }
            handleChange={formik.handleChange}
            handleBlur={formik.handleBlur}
          />
          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-1 rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90"
          >
            Continue <SmallLoader loading={loading} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
