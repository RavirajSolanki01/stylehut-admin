"use client";
import { useParams, useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";

import Layout from "@/components/Layouts";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { SmallLoader } from "@/components/Loader";
import { useEffect, useState } from "react";
import apiService from "@/services/base.services";
import { toast } from "react-toastify";

const CreateUpdateBrandPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isEditMode = id !== "new";

  useEffect(() => {
    isEditMode && getBrandDetails();
  }, [isEditMode]);

  const [loading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .required("Name is required")
        .max(40, "Name must be 40 characters or less")
        .min(2, "Description must be at least 2 characters"),
      description: Yup.string()
        .trim()
        .required("Description is required")
        .max(1024, "Description must be 1024 characters or less")
        .min(10, "Description must be at least 10 characters"),
    }),
    onSubmit: (values) => {
      createOrUpdateBrand(values);
    },
    enableReinitialize: true,
  });

  const createOrUpdateBrand = async (values: {
    name: string;
    description: string;
  }) => {
    setIsLoading(true);

    const endpoint = isEditMode ? `/brand/${id}` : "/brand";

    const method = isEditMode ? apiService.put : apiService.post;
    const successMessage = isEditMode
      ? "Brand updated successfully"
      : "Brand created successfully";

    try {
      const response = await method(endpoint, values, { withAuth: true });

      if (response?.status === 201 || response?.status === 200) {
        toast.success(successMessage);
        router.push("/brand");
      }
    } catch (error: any) {
      console.log("Error creating/updating brand:", error?.message || error);
      const msg =
        error.response.data.message ||
        "Something went wrong. Please try again later.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getBrandDetails = async () => {
    try {
      const response: {
        data: { data: { name: string; description: string } };
        status: number;
      } = await apiService.get(`/brand/${id}`, {
        withAuth: true,
      });
      console.log(response.data.data, response.status);
      if (response?.status === 200) {
        formik.setValues({
          name: response.data.data.name,
          description: response.data.data.description,
        });
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        toast.error("Brand not found.");
        router.push("/brand");
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
          {isEditMode ? "Edit" : "Create"} Brand
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

              <TextAreaGroup
                className="mb-5.5 w-full sm:w-9/12 md:w-1/2"
                label="Description"
                name="description"
                placeholder="Enter description"
                value={formik.values.description}
                handleChange={formik.handleChange}
                handleBlur={formik.handleBlur}
                required
                error={
                  formik.touched.description && formik.errors.description
                    ? formik.errors.description
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

export default CreateUpdateBrandPage;
