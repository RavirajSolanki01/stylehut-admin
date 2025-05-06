"use client";
import { useParams, useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";

import Layout from "@/components/Layouts";
import InputGroup from "@/components/FormElements/InputGroup";
import { SmallLoader } from "@/components/Loader";
import apiService from "@/services/base.services";
import { toast } from "react-toastify";

const CreateUpdateGenderPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isEditMode = id !== "new";

  useEffect(() => {
    isEditMode && getGenderDetails();
  }, [isEditMode]);

  const [loading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .required("Name is required")
        .max(30, "Name must be 30 characters or less")
        .min(2, "Name must be at least 2 characters"),
    }),
    onSubmit: (values) => {
      createOrUpdateGender(values);
    },
    enableReinitialize: true,
  });

  const createOrUpdateGender = async (values: { name: string }) => {
    setIsLoading(true);

    const endpoint = isEditMode ? `/gender/${id}` : "/gender";

    const method = isEditMode ? apiService.put : apiService.post;
    const successMessage = isEditMode
      ? "Gender updated successfully"
      : "Gender created successfully";

    try {
      const response = await method(endpoint, values, { withAuth: true });

      if (response?.status === 201 || response?.status === 200) {
        toast.success(successMessage);
        router.push("/gender");
      }
    } catch (error: any) {
      console.log("Error creating/updating gender:", error?.message || error);
      const msg =
        error.response.data.message ||
        "Something went wrong. Please try again later.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getGenderDetails = async () => {
    try {
      const response: {
        data: { data: { name: string } };
        status: number;
      } = await apiService.get(`/gender/${id}`, {
        withAuth: true,
      });
      console.log(response.data.data, response.status);
      if (response?.status === 200) {
        formik.setValues({
          name: response.data.data.name,
        });
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        toast.error("Gender not found.");
        router.push("/gender");
        return;
      }
      toast.error("Something went wrong. Please try again later.");
    }
  };

  const redirectToPreviousPage = () => {
    router.back();
  };
  return (
    <>
      <Layout>
        <h2 className="mb-6 text-[26px] font-bold leading-[30px] text-dark dark:text-white">
          {isEditMode ? "Edit" : "Create"} Gender
        </h2>
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="w-full p-4">
            <form onSubmit={formik.handleSubmit} noValidate>
              <InputGroup
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                type="text"
                name="name"
                label="Name"
                required
                placeholder="Enter name"
                value={formik.values.name}
                handleChange={formik.handleChange}
                handleBlur={formik.handleBlur}
                height="sm"
                error={
                  formik.touched.name && formik.errors.name
                    ? formik.errors.name
                    : ""
                }
              />

              <div className="flex justify-start gap-3">
                <button
                  className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
                  type="button"
                  onClick={redirectToPreviousPage}
                >
                  Cancel
                </button>

                <button
                  className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
                  type="submit"
                  disabled={loading}
                >
                  Save <SmallLoader loading={loading} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default CreateUpdateGenderPage;
