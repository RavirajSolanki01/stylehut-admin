"use client";
import { useParams, useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useEffect, useState, useCallback } from "react";

import Layout from "@/components/Layouts";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { CentralLoader, SmallLoader } from "@/components/Loader";
import apiService from "@/services/base.services";
import { Select } from "@/components/FormElements/select";
import {
  IBrand,
  IBrandApiResponse,
  ICategory,
  IGetAllCategoriesResponse,
  IGetAllSubCategoriesType,
  IProduct,
  ISubCategoryType,
} from "@/types/interface";
import { ImageUpload } from "@/components/FormElements/InputGroup/upload-file";
import { fileValidation } from "@/utils/schema";

type FormValues = {
  name: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  brandId: string;
  subCategoryTypeId: string;
  price: number;
  discount: number;
  quantity: number;
  images: string[] | File[];
};

const initialFormValues: FormValues = {
  name: "",
  description: "",
  categoryId: "",
  subCategoryId: "",
  brandId: "",
  subCategoryTypeId: "",
  price: 0,
  quantity: 0,
  images: [],
  discount: 0,
};

const CreateUpdateProductPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const isEditMode = id !== "new";

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [subCategories, setSubCategories] = useState<ICategory[]>([]);
  const [subCategoriesType, setSubCategoriesType] = useState<
    ISubCategoryType[]
  >([]);
  const [brands, setBrand] = useState<IBrand[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  const [loadingStates, setLoadingStates] = useState({
    productLoading: false,
    formSubmitting: false,
  });

  const formik = useFormik<FormValues>({
    initialValues: initialFormValues,
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .required("Name is required")
        .max(40, "Name must be 40 characters or less")
        .min(2, "Name must be at least 2 characters"),

      description: Yup.string()
        .trim()
        .required("Description is required")
        .max(1024, "Description must be 1024 characters or less")
        .min(10, "Description must be at least 10 characters"),

      categoryId: Yup.string().trim().required("Please select a category"),

      subCategoryId: Yup.string()
        .trim()
        .required("Please select a subcategory"),

      subCategoryTypeId: Yup.string()
        .trim()
        .required("Please select a subcategory type"),

      brandId: Yup.string().trim().required("Please select a brand"),
      images: Yup.array()
        .of(
          Yup.mixed().test(
            "customValidation",
            "Only JPG, JPEG, PNG allowed",
            function (value) {
              // Allow strings (preloaded URLs) to pass without validation
              if (typeof value === "string") return true;

              // Use your existing fileValidation test for Files
              return fileValidation.isValidSync(value);
            },
          ),
        )
        .min(1, "Please upload at least 1 image")
        .max(8, "You can upload a maximum of 8 images")
        .required("Image upload is required"),

      price: Yup.number()
        .typeError("Price must be a number")
        .required("Price is required")
        .moreThan(0, "Price must be greater than 0"),
      discount: Yup.number()
        .typeError("Discount must be a number")
        .required("Discount is required")
        .min(0, "Discount cannot be less than 0")
        .lessThan(100, "Discount must be less than 100"),
    }),
    onSubmit: (values) => handleSubmit(values),
    enableReinitialize: true,
  });

  const fetchAllCategories = useCallback(async () => {
    try {
      setLoadingStates((prev) => ({ ...prev, productLoading: true }));
      const res: IGetAllCategoriesResponse = await apiService.get(
        "/all-category",
        { withAuth: true },
      );
      if (res.status === 200) setCategories(res.data.data);
    } catch {
      toast.error("Something went wrong, please try again later.");
    } finally {
      setLoadingStates((prev) => ({ ...prev, productLoading: false }));
    }
  }, []);

  const fetchAllSubCategoriesWithId = useCallback(
    async (categoryId: string) => {
      try {
        setLoadingStates((prev) => ({ ...prev, productLoading: true }));
        const res: IGetAllCategoriesResponse = await apiService.get(
          `/all-sub-category?categoryId=${categoryId}`,
          { withAuth: true },
        );
        if (res.status === 200) setSubCategories(res.data.data);
      } catch {
        toast.error("Something went wrong, please try again later.");
      } finally {
        setLoadingStates((prev) => ({ ...prev, productLoading: false }));
      }
    },
    [],
  );

  const fetchAllSubCategoriesTypeWithId = useCallback(
    async (categoryId: string, subCategoryId: string) => {
      try {
        setLoadingStates((prev) => ({ ...prev, productLoading: true }));
        const res: IGetAllSubCategoriesType = await apiService.get(
          `/sub-category-type?categoryId=${categoryId}&subCategoryId=${subCategoryId}`,
          { withAuth: true },
        );
        if (res.status === 200) setSubCategoriesType(res.data.data.items);
      } catch {
        toast.error("Something went wrong, please try again later.");
      } finally {
        setLoadingStates((prev) => ({ ...prev, productLoading: false }));
      }
    },
    [],
  );

  const fetchAllBrand = useCallback(async () => {
    try {
      setLoadingStates((prev) => ({ ...prev, productLoading: true }));
      const res: IBrandApiResponse = await apiService.get(`/brand`, {
        withAuth: true,
      });
      if (res.status === 200) setBrand(res.data.data.items);
    } catch {
      toast.error("Something went wrong, please try again later.");
    } finally {
      setLoadingStates((prev) => ({ ...prev, productLoading: false }));
    }
  }, []);

  const fetchSubCategoryDetails = useCallback(async () => {
    try {
      const response: { data: { data: IProduct }; status: number } =
        await apiService.get(`/product/${id}`, {
          withAuth: true,
        });
      if (response.status === 200) {
        const {
          name,
          description,
          category,
          sub_category,
          category_id,
          sub_category_id,
          sub_category_type_id,
          brand_id,
          price,
          quantity,
          discount,
          image,
        } = response.data.data;

        formik.setValues({
          name,
          description,
          categoryId: String(category.id),
          subCategoryId: String(sub_category.id),
          brandId: String(brand_id),
          price: Number(price),
          subCategoryTypeId: String(sub_category_type_id),
          quantity,
          images: image,
          discount,
        });
        fetchAllSubCategoriesWithId(String(category_id));
        fetchAllSubCategoriesTypeWithId(
          String(category.id),
          String(sub_category_id),
        );
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        toast.error("Product not found.");
        router.push("/product");
        return;
      }
    }
  }, [id, router]);

  const handleSubmit = async (values: FormValues) => {
    setLoadingStates((prev) => ({ ...prev, formSubmitting: true }));

    const endpoint = isEditMode ? `/product/${id}` : "/product";
    const method = isEditMode ? apiService.put : apiService.post;
    const successMessage = isEditMode
      ? "Product updated successfully"
      : "Product created successfully";

    try {
      const newUploadedImg = values.images.filter(
        (item): item is File => item instanceof File,
      );

      const formData = new FormData();
      newUploadedImg.forEach((file) => {
        formData.append("images", file);
      });
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("category_id", values.categoryId);
      formData.append("sub_category_id", values.subCategoryId);
      formData.append("sub_category_type_id", values.subCategoryTypeId);
      formData.append("brand_id", values.brandId);
      formData.append("price", String(values.price));
      formData.append("quantity", String(values.quantity));
      formData.append("discount", String(values.discount));

      const response = await method(endpoint, formData, {
        withAuth: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const deleteImgResponse = await handleDeleteImages();

      if (
        response?.status === 200 ||
        (deletedImages.length > 0 && deleteImgResponse?.status === 200)
      ) {
        setDeletedImages([]);
        toast.success(successMessage);
        router.push("/product");
      }
    } catch (error: any) {
      console.log("Error:", error?.message || error);
      const msg =
        error.response.data.message ||
        "Something went wrong. Please try again later.";
      toast.error(msg);
    } finally {
      setLoadingStates((prev) => ({ ...prev, formSubmitting: false }));
    }
  };

  const handleDeleteImages = async () => {
    if (isEditMode && deletedImages.length > 0)
      return await apiService.put(
        `/product/${id}/images`,
        { imageUrls: deletedImages },
        {
          withAuth: true,
        },
      );
  };

  useEffect(() => {
    fetchAllCategories();
    if (isEditMode) fetchSubCategoryDetails();
  }, [isEditMode, fetchAllCategories, fetchSubCategoryDetails]);

  useEffect(() => {
    fetchAllBrand();
  }, []);

  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  return (
    <>
      <CentralLoader loading={loadingStates.productLoading} />
      <Layout>
        <h2 className="mb-6 text-[26px] font-bold leading-[30px] text-dark dark:text-white">
          {isEditMode ? "Edit" : "Create"} Product
        </h2>
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="w-full p-4">
            <form onSubmit={formik.handleSubmit} noValidate>
              <InputGroup
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                type="text"
                name="name"
                label="Name"
                placeholder="Enter name"
                required
                value={values.name}
                handleChange={handleChange}
                handleBlur={handleBlur}
                height="sm"
                error={touched.name && errors.name ? errors.name : ""}
              />
              <Select
                label="Select Category"
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                name="categoryId"
                value={values.categoryId}
                placeholder="Select category"
                required
                items={categories.map((c) => ({
                  label: c.name,
                  value: String(c.id),
                }))}
                onChange={(e) => {
                  handleChange(e);
                  fetchAllSubCategoriesWithId(e.target.value);
                  setFieldValue("subCategoryId", "");
                  setFieldValue("subCategoryTypeId", "");
                }}
                onBluer={handleBlur}
                error={
                  touched.categoryId && errors.categoryId
                    ? errors.categoryId
                    : ""
                }
              />

              <Select
                label="Select Subcategory"
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                name="subCategoryId"
                value={values.subCategoryId}
                placeholder="Select subcategory"
                required
                items={subCategories.map((c) => ({
                  label: c.name,
                  value: String(c.id),
                }))}
                onChange={(e) => {
                  handleChange(e);
                  fetchAllSubCategoriesTypeWithId(
                    values.categoryId,
                    e.target.value,
                  );
                  setFieldValue("subCategoryTypeId", "");
                }}
                onBluer={handleBlur}
                error={
                  touched.subCategoryId && errors.subCategoryId
                    ? errors.subCategoryId
                    : ""
                }
              />
              <Select
                label="Select Subcategory type"
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                name="subCategoryTypeId"
                value={values.subCategoryTypeId}
                placeholder="Select subcategory type"
                required
                items={subCategoriesType.map((c) => ({
                  label: c.name,
                  value: String(c.id),
                }))}
                onChange={handleChange}
                onBluer={handleBlur}
                error={
                  touched.subCategoryTypeId && errors.subCategoryTypeId
                    ? errors.subCategoryTypeId
                    : ""
                }
              />
              <Select
                label="Select Brand"
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                name="brandId"
                value={values.brandId}
                placeholder="Select brand"
                required
                items={brands.map((c) => ({
                  label: c.name,
                  value: String(c.id),
                }))}
                onChange={handleChange}
                onBluer={handleBlur}
                error={touched.brandId && errors.brandId ? errors.brandId : ""}
              />
              <InputGroup
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                type="number"
                name="price"
                label="Price"
                placeholder="Enter price"
                required
                value={values.price}
                handleChange={handleChange}
                handleBlur={handleBlur}
                height="sm"
                min={0}
                error={touched.price && errors.price ? errors.price : ""}
              />
              <InputGroup
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                type="number"
                name="quantity"
                label="Quantity"
                placeholder="Enter quantity"
                required
                value={values.quantity}
                handleChange={handleChange}
                handleBlur={handleBlur}
                height="sm"
                min={0}
                max={99}
                error={
                  touched.quantity && errors.quantity ? errors.quantity : ""
                }
              />
              <InputGroup
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                type="number"
                name="discount"
                label="Discount"
                placeholder="Enter discount"
                required
                value={values.discount}
                handleChange={handleChange}
                handleBlur={handleBlur}
                height="sm"
                isNumeric
                min={0}
                max={99}
                error={
                  touched.discount && errors.discount ? errors.discount : ""
                }
              />
              <ImageUpload
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                name="images"
                value={formik.values.images}
                onChange={(files) => formik.setFieldValue("images", files)}
                onBlur={() => formik.setFieldTouched("images", true)}
                error={formik.errors.images as string}
                touched={formik.touched.images}
                onDeleteImage={(imageURL) =>
                  setDeletedImages((prev) => [...prev, imageURL])
                }
              />
              <TextAreaGroup
                className="mb-5.5 w-full sm:w-9/12 md:w-1/2"
                label="Description"
                name="description"
                placeholder="Enter description"
                value={values.description}
                required
                handleChange={handleChange}
                handleBlur={handleBlur}
                error={
                  touched.description && errors.description
                    ? errors.description
                    : ""
                }
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

export default CreateUpdateProductPage;
