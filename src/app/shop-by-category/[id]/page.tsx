"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFormik } from "formik";
import { toast } from "react-toastify";

import Layout from "@/components/Layouts";
import InputGroup from "@/components/FormElements/InputGroup";
import { CentralLoader, SmallLoader } from "@/components/Loader";
import { Select } from "@/components/FormElements/select";
import { ImageUpload } from "@/components/FormElements/InputGroup/upload-file";
import apiService from "@/services/base.services";
import {
  IGetAllSubCategoriesResponse,
  IShopByCategoryIdResponse,
  ISubCategory,
} from "@/types/interface";
import { shopByCategoryValidation } from "@/utils/schema";
import { DEFAULT_DISCOUNT_OPTION } from "@/utils/common";

type FormValues = {
  name: string;
  sub_category_id: string;
  minDiscount: string;
  maxDiscount: string;
  image: string[] | File[];
};

const initialFormValues: FormValues = {
  name: "",
  sub_category_id: "",
  minDiscount: "",
  maxDiscount: "",
  image: [],
};

const CreateUpdateShopByCategory = () => {
  const router = useRouter();
  const { id } = useParams();

  const isEditMode = id !== "new";

  const [subCategories, setSubCategories] = useState<ISubCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    handleSubmit,
    setValues,
  } = useFormik<FormValues>({
    initialValues: initialFormValues,
    validationSchema: shopByCategoryValidation,
    onSubmit: (values) => {
      createOrUpdateSubCategoryCard(values);
    },
    enableReinitialize: true,
  });

  const getSubCategoryDetails = async () => {
    setIsLoading(true);
    try {
      const response: IShopByCategoryIdResponse = await apiService.get(
        `/shop-by-category/${id}`,
        {
          withAuth: true,
        },
      );
      if (response.status === 200) {
        const { data } = response.data;

        setValues({
          name: data.name,
          sub_category_id: data.sub_category_id.toString(),
          minDiscount: data.minDiscount.toString(),
          maxDiscount: data.maxDiscount.toString(),
          image: data.image ? [data.image] : [],
        });
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        toast.error("Category not found.");
        router.push("/category");
        return;
      }
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllSubCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const res: IGetAllSubCategoriesResponse = await apiService.get(
        "/all-sub-category",
        { withAuth: true },
      );
      if (res.status === 200) setSubCategories(res.data.data);
    } catch {
      toast.error("Something went wrong, please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createOrUpdateSubCategoryCard = async (values: FormValues) => {
    setIsLoading(true);

    const endpoint = isEditMode
      ? `/shop-by-category/${id}`
      : "/shop-by-category";

    const method = isEditMode ? apiService.put : apiService.post;
    const successMessage = isEditMode
      ? "Shop by category updated successfully"
      : "Shop by category created successfully";

    const newUploadedImg = values.image.filter(
      (item): item is File => item instanceof File,
    );

    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("sub_category_id", values.sub_category_id);
    formData.append(
      "minDiscount",
      values.minDiscount === "" ? "0" : Number(values.minDiscount).toString(),
    );
    formData.append("maxDiscount", values.maxDiscount);
    if (newUploadedImg.length) {
      formData.append("images", newUploadedImg[0]);
    }
    try {
      const response = await method(endpoint, formData, {
        withAuth: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response?.status === 200) {
        toast.success(successMessage);
        router.push("/shop-by-category");
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
    fetchAllSubCategories();
    if (isEditMode) {
      getSubCategoryDetails();
    }
  }, []);

  return (
    <>
      <CentralLoader loading={isLoading} />
      <Layout>
        <h2 className="mb-6 text-[26px] font-bold leading-[30px] text-dark dark:text-white">
          {isEditMode ? "Edit" : "Create"} shop by category
        </h2>
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="w-full p-4">
            <form onSubmit={handleSubmit} noValidate>
              <InputGroup
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                type="text"
                name="name"
                label="Card Name"
                placeholder="Enter Card name"
                required
                value={values.name}
                handleChange={handleChange}
                handleBlur={handleBlur}
                height="sm"
                error={touched.name && errors.name ? errors.name : ""}
              />

              <Select
                label="Select Sub Category"
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                name="sub_category_id"
                value={values.sub_category_id}
                placeholder="Select sub category"
                required
                items={subCategories.map((sc) => ({
                  label: `${sc.category.name} - ${sc.name}`,
                  value: String(sc.id),
                }))}
                onChange={(e) => {
                  handleChange(e);
                }}
                onBluer={handleBlur}
                error={
                  touched.sub_category_id && errors.sub_category_id
                    ? errors.sub_category_id
                    : ""
                }
              />

              <Select
                label="Minimum Discount"
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                name="minDiscount"
                value={values.minDiscount.toString()}
                placeholder="Select minimum discount"
                items={DEFAULT_DISCOUNT_OPTION.map((option) => ({
                  label: option.label,
                  value: String(option.value),
                }))}
                onChange={(e) => {
                  handleChange(e);
                }}
                onBluer={handleBlur}
                error={
                  touched.minDiscount && errors.minDiscount
                    ? errors.minDiscount
                    : ""
                }
              />

              <Select
                label="Maximum Discount"
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                name="maxDiscount"
                value={values.maxDiscount.toString()}
                placeholder="Select maximum discount"
                required
                items={DEFAULT_DISCOUNT_OPTION.map((option) => ({
                  label: option.label,
                  value: String(option.value),
                }))}
                onChange={(e) => {
                  handleChange(e);
                }}
                onBluer={handleBlur}
                error={
                  touched.maxDiscount && errors.maxDiscount
                    ? errors.maxDiscount
                    : ""
                }
              />

              <ImageUpload
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                name="image"
                maxImages={1}
                value={values.image}
                onChange={(files) => setFieldValue("image", files)}
                error={errors.image as string}
                touched={touched.image}
                onDeleteImage={() => setFieldValue("image", [])}
                label="Upload Image"
              />

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
                  className={`cursor-pointer rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90`}
                >
                  Save <SmallLoader loading={isLoading} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default CreateUpdateShopByCategory;
