"use client";
import { useParams, useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useEffect, useState, useCallback } from "react";
import Layout from "@/components/Layouts";
import InputGroup from "@/components/FormElements/InputGroup";
import { CentralLoader, SmallLoader } from "@/components/Loader";
import apiService from "@/services/base.services";
import { Select } from "@/components/FormElements/select";
import {
  ICategory,
  IGetAllCategoriesResponse,
  IShopByCategoryIdResponse,
} from "@/types/interface";
import { ImageUpload } from "@/components/FormElements/InputGroup/upload-file";

type FormValues = {
  name: string;
  sub_category_id: string;
  minDiscount: number;
  maxDiscount: number;
  image: string[] | File[];
};

const initialFormValues: FormValues = {
  name: "",
  sub_category_id: "",
  minDiscount: 0,
  maxDiscount: 0,
  image: [],
};

const CreateUpdateShopByCategory = () => {
  const router = useRouter();
  const { id } = useParams();
  const isEditMode = id !== "new";
  const isVariantMode = (id as string)?.startsWith("new_variant");
  const [categories, setCategories] = useState<ICategory[]>([]);
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
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .required("Name is required")
        .max(40, "Name must be 40 characters or less")
        .min(2, "Name must be at least 2 characters"),

      sub_category_id: Yup.string()
        .trim()
        .required("Please select a subcategory"),

      image: Yup.mixed<FileList>()
        .test(
          "required",
          "Image is required",
          (value: FileList | null | undefined): boolean => {
            return !!value && value.length > 0;
          },
        )
        .test(
          "fileFormat",
          "Unsupported Format",
          (value: FileList | null | undefined): boolean => {
            if (!value) return false;
            for (let i = 0; i < value.length; i++) {
              if (
                !["image/jpg", "image/jpeg", "image/png"].includes(
                  value[i].type,
                )
              ) {
                return false;
              }
            }
            return true;
          },
        ),

      minDiscount: Yup.number()
        .typeError("Min discount must be a number")
        .required("Min discount is required")
        .moreThan(0, "Min discount must be greater than 0")
        .lessThan(100, "Min discount must be less than 100"),

      maxDiscount: Yup.number()
        .typeError("Max discount must be a number")
        .required("Max discount is required")
        .moreThan(0, "Max discount must be greater than 0")
        .lessThan(100, "Min discount must be less than 100")
        .test(
          "not-equal-min",
          "Max discount must be greater than Min discount",
          function (value) {
            const { minDiscount } = this.parent;
            return value !== minDiscount && value > minDiscount;
          },
        ),
    }),
    onSubmit: (values) => {
      createOrUpdateSubCategoryCard(values);
    },
    enableReinitialize: true,
  });

  const createOrUpdateSubCategoryCard = async (values: FormValues) => {
    setIsLoading(true);

    const endpoint = isEditMode
      ? `/shop-by-category/${id}`
      : "/shop-by-category";

    const method = isEditMode ? apiService.put : apiService.post;
    const successMessage = isEditMode
      ? "Shop by category updated successfully"
      : "Shop by category created successfully";
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("sub_category_id", values.sub_category_id);
    formData.append("minDiscount", values.minDiscount.toString());
    formData.append("maxDiscount", values.maxDiscount.toString());
    if (values.image) {
      formData.append("images", values.image[0]);
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
          minDiscount: data.minDiscount,
          maxDiscount: data.maxDiscount,
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
      const res: IGetAllCategoriesResponse = await apiService.get(
        "/all-sub-category",
        { withAuth: true },
      );
      if (res.status === 200) setCategories(res.data.data);
    } catch {
      toast.error("Something went wrong, please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSubCategories();
    getSubCategoryDetails();
  }, []);

  return (
    <>
      <CentralLoader loading={isLoading} />
      <Layout>
        <h2 className="mb-6 text-[26px] font-bold leading-[30px] text-dark dark:text-white">
          {isVariantMode ? "Add Variant" : isEditMode ? "Edit" : "Create"} shop
          category
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
                items={categories.map((c) => ({
                  label: c.name,
                  value: String(c.id),
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

              <InputGroup
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                type="number"
                name="minDiscount"
                label="Minimum Discount"
                placeholder="Enter minimum discount"
                required
                value={values.minDiscount}
                handleChange={handleChange}
                handleBlur={handleBlur}
                height="sm"
                min={0}
                max={99}
                error={
                  touched.minDiscount && errors.minDiscount
                    ? errors.minDiscount
                    : ""
                }
              />

              <InputGroup
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                type="number"
                name="maxDiscount"
                label="Maximum Discount"
                placeholder="Enter discount"
                required
                value={values.maxDiscount}
                handleChange={handleChange}
                handleBlur={handleBlur}
                height="sm"
                isNumeric
                min={0}
                max={99}
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
                  //   disabled={!isValid || !dirty}
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
