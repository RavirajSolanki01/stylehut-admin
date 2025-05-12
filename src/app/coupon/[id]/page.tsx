"use client";
import { useParams, useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

import Layout from "@/components/Layouts";
import InputGroup from "@/components/FormElements/InputGroup";
import { CentralLoader, SmallLoader } from "@/components/Loader";
import apiService from "@/services/base.services";

type FormValues = {
  max_savings_amount: string | number | undefined;
  min_order_amount: string | number | undefined;
  code: string;
  discount: number;
  isActive: boolean;
  discount_text: string;
  expiry_date: string;
};

const initialFormValues: FormValues = {
  code: "",
  discount: 0,
  max_savings_amount: 0,
  min_order_amount: 0,
  isActive: true,
  discount_text: "",
  expiry_date: "",
};

const CreateUpdateCouponPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const isEditMode = id !== "new";

  const [loadingStates, setLoadingStates] = useState({
    couponLoading: false,
    formSubmitting: false,
  });

  const formik = useFormik<FormValues>({
    initialValues: initialFormValues,
    validationSchema: Yup.object({
      code: Yup.string()
        .trim()
        .required("Coupon code is required")
        .max(10, "Code must be 10 characters or less")
        .min(3, "Code must be at least 3 characters"),

      discount: Yup.number()
        .typeError("Discount must be a number")
        .required("Discount is required")
        .min(1, "Discount must be at least 1%")
        .max(100, "Discount cannot exceed 100%"),

      max_savings_amount: Yup.number()
        .typeError("Maximum savings must be a number")
        .required("Maximum savings is required")
        .min(1, "Maximum savings must be at least 1"),
      min_order_amount: Yup.number()
        .typeError("Minimum order amount must be a number")
        .required("Minimum order amount is required")
        .min(1, "Minimum order amount must be at least 1"),
      discount_text: Yup.string().required("Discount text is required"),
      expiry_date: Yup.date().required("Expiry date is required"),
    }),
    onSubmit: (values) => handleSubmit(values),
    enableReinitialize: true,
  });

  const fetchCouponDetails = async () => {
    try {
      setLoadingStates((prev) => ({ ...prev, couponLoading: true }));
      const response = await apiService.get(`/coupon/${id}`, {
        withAuth: true,
      });

      if (response.status === 200) {
        const {
          code,
          discount,
          is_active = true,
          max_savings_amount,
          min_order_amount,
          discount_text,
          expiry_date,
        } = (response.data as any).data;

        formik.setValues({
          code,
          discount: Number(discount),
          max_savings_amount: Number(max_savings_amount),
          min_order_amount: Number(min_order_amount),
          isActive: is_active,
          discount_text,
          expiry_date: expiry_date ? new Date(expiry_date).toISOString().split('T')[0] : '',   
        });
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        toast.error("Coupon not found.");
        router.push("/coupon");
        return;
      }
      toast.error("Something went wrong, please try again later.");
    } finally {
      setLoadingStates((prev) => ({ ...prev, couponLoading: false }));
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setLoadingStates((prev) => ({ ...prev, formSubmitting: true }));

    const endpoint = isEditMode ? `/coupon/${id}` : "/coupon";
    const method = isEditMode ? apiService.put : apiService.post;
    const successMessage = isEditMode
      ? "Coupon updated successfully"
      : "Coupon created successfully";

    try {
      const payload = {
        coupon_code: values.code,
        discount: Number(values.discount),
        is_active: values.isActive,
        max_savings_amount: Number(values.max_savings_amount),
        min_order_amount: Number(values.min_order_amount),
        discount_text: values.discount_text,
        expiry_date: values.expiry_date,
      };

      const response = await method(endpoint, payload, {
        withAuth: true,
      });

      if (response?.status === 200) {
        toast.success(successMessage);
        router.push("/coupon");
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Something went wrong. Please try again later.";
      toast.error(msg);
    } finally {
      setLoadingStates((prev) => ({ ...prev, formSubmitting: false }));
    }
  };

  useEffect(() => {
    if (isEditMode) {
      fetchCouponDetails();
    }
  }, [isEditMode]);

  const { values, errors, touched, handleChange, handleBlur } = formik;

  return (
    <>
      <CentralLoader loading={loadingStates.couponLoading} />
      <Layout>
        <h2 className="mb-6 text-[26px] font-bold leading-[30px] text-dark dark:text-white">
          {isEditMode ? "Edit" : "Create"} Coupon
        </h2>
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="w-full p-4">
            <form onSubmit={formik.handleSubmit} noValidate>
              <InputGroup
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                type="text"
                name="code"
                label="Coupon Code"
                placeholder="Enter coupon code"
                required
                value={values.code.toUpperCase()}
                handleChange={handleChange}
                handleBlur={handleBlur}
                height="sm"
                error={touched.code && errors.code ? errors.code : ""}
              />

              <InputGroup
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                type="text"
                name="discount"
                label="Discount Percentage"
                placeholder="Enter discount percentage"
                required
                value={values.discount}
                handleChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  if (
                    value === "" ||
                    (Number(value) >= 1 && Number(value) <= 100)
                  ) {
                    handleChange({
                      target: {
                        name: "discount",
                        value: value,
                      },
                    });
                  }
                }}
                handleBlur={handleBlur}
                height="sm"
                error={
                  touched.discount && errors.discount ? errors.discount : ""
                }
              />

              <div className="md:flex md:gap-2">
                <InputGroup
                  className="mb-5 w-full sm:w-9/12 md:w-1/4"
                  type="text"
                  name="max_savings_amount"
                  label="Maximum Savings Amount"
                  placeholder="Enter maximum savings amount"
                  required
                  value={values.max_savings_amount}
                  handleChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    if (
                      value === "" ||
                      (Number(value) >= 1 && Number(value) <= 9999999999)
                    ) {
                      handleChange({
                        target: {
                          name: "max_savings_amount",
                          value: value,
                        },
                      });
                    }
                  }}
                  handleBlur={handleBlur}
                  height="sm"
                  error={
                    touched.max_savings_amount && errors.max_savings_amount
                      ? errors.max_savings_amount
                      : ""
                  }
                />
                <InputGroup
                  className="mb-5 w-full sm:w-9/12 md:w-1/4"
                  type="text"
                  name="min_order_amount"
                  label="Minimum Order Amount"
                  placeholder="Enter minimum order amount"
                  required
                  value={values.min_order_amount}
                  handleChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    if (
                      value === "" ||
                      (Number(value) >= 1 && Number(value) <= 9999999999)
                    ) {
                      handleChange({
                        target: {
                          name: "min_order_amount",
                          value: value,
                        },
                      });
                    }
                  }}
                  handleBlur={handleBlur}
                  height="sm"
                  error={
                    touched.min_order_amount && errors.min_order_amount
                      ? errors.min_order_amount
                      : ""
                  }
                />
              </div>

              <InputGroup
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                type="text"
                name="discount_text"
                label="Discount Text"
                placeholder="Enter discount text"
                required
                value={values.discount_text}
                handleChange={handleChange}
                handleBlur={handleBlur}
                height="sm"
                error={
                  touched.discount_text && errors.discount_text
                    ? errors.discount_text
                    : ""
                }
              />

              <InputGroup
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                type="date"
                name="expiry_date"
                label="Expiry Date"
                placeholder="Enter expiry date"
                required
                value={values.expiry_date}
                handleChange={handleChange}
                handleBlur={handleBlur}
                height="sm"
                error={
                  touched.expiry_date && errors.expiry_date
                    ? errors.expiry_date
                    : ""
                }
              />

              <div className="mb-5 flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={values.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300"
                  aria-label="Active status"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>

              <div className="flex justify-start gap-3">
                <button
                  type="button"
                  onClick={router.back}
                  className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingStates.formSubmitting}
                  className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
                >
                  Save <SmallLoader loading={loadingStates.formSubmitting} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default CreateUpdateCouponPage;
