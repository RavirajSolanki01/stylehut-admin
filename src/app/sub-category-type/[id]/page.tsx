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
  ICategory,
  IGetAllCategoriesResponse,
  ISubCategory,
  ISubCategoryType,
} from "@/types/interface";

type FormValues = {
  name: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
};

const initialFormValues: FormValues = {
  name: "",
  description: "",
  categoryId: "",
  subCategoryId: "",
};

const CreateUpdateSubCategoryPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const isEditMode = id !== "new";

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [subCategories, setSubCategories] = useState<ICategory[]>([]);
  const [loadingStates, setLoadingStates] = useState({
    categoriesLoading: false,
    formSubmitting: false,
  });
 
  const formik = useFormik<FormValues>({
    initialValues: initialFormValues,
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .required("Name is required")
        .max(30, "Name must be 30 characters or less")
        .min(2, "Name must be at least 2 characters"),
      description: Yup.string()
        .trim()
        .required("Description is required")
        .max(100, "Description must be 100 characters or less")
        .min(10, "Description must be at least 10 characters"),
      categoryId: Yup.string().trim().required("Category is required"),
      subCategoryId: Yup.string().trim().required("Subcategory is required"),
    }),
    onSubmit: (values) => handleSubmit(values),
    enableReinitialize: true,
  });

  const fetchAllCategories = useCallback(async () => {
    try {
      setLoadingStates((prev) => ({ ...prev, categoriesLoading: true }));
      const res: IGetAllCategoriesResponse = await apiService.get(
        "/all-category",
        { withAuth: true },
      );
      if (res.status === 200) setCategories(res.data.data);
    } catch {
      toast.error("Something went wrong, please try again later.");
    } finally {
      setLoadingStates((prev) => ({ ...prev, categoriesLoading: false }));
    }
  }, []);

  const fetchAllSubCategoriesWithId = useCallback(
    async (categoryId: string) => {
      try {
        setLoadingStates((prev) => ({ ...prev, categoriesLoading: true }));
        const res: IGetAllCategoriesResponse = await apiService.get(
          `/all-sub-category?categoryId=${categoryId}`,
          { withAuth: true },
        );
        if (res.status === 200) setSubCategories(res.data.data);
      } catch {
        toast.error("Something went wrong, please try again later.");
      } finally {
        setLoadingStates((prev) => ({ ...prev, categoriesLoading: false }));
      }
    },
    [],
  );

  const fetchSubCategoryDetails = useCallback(async () => {
    try {
      const response: { data: { data: ISubCategoryType }; status: number } =
        await apiService.get(`/sub-category-type/${id}`, {
          withAuth: true,
        });
      if (response.status === 200) {
        const { name, description, category, sub_category } =
          response.data.data;
        formik.setValues({
          name,
          description,
          categoryId: String(category.id),
          subCategoryId: String(sub_category.id),
        });
        fetchAllSubCategoriesWithId(category.id);
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        toast.error("Subcategory type not found.");
        router.push("/sub-category-type");
        return;
      }
    }
  }, [id, router]);

  const handleSubmit = async (values: FormValues) => {
    setLoadingStates((prev) => ({ ...prev, formSubmitting: true }));

    const endpoint = isEditMode
      ? `/sub-category-type/${id}`
      : "/sub-category-type";
    const method = isEditMode ? apiService.put : apiService.post;
    const successMessage = isEditMode
      ? "Subcategory type updated successfully"
      : "Subcategory type created successfully";

    try {
      const payload = {
        ...values,
        categoryId: Number(values.categoryId),
        subCategoryId: Number(values.subCategoryId),
      };
      const response = await method(endpoint, payload, { withAuth: true });

      if (response?.status === 200) {
        toast.success(successMessage);
        router.push("/sub-category-type");
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

  useEffect(() => {
    fetchAllCategories();
    if (isEditMode) fetchSubCategoryDetails();
  }, [isEditMode, fetchAllCategories, fetchSubCategoryDetails]);

  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  useEffect(() => {
    if (values.name && values.categoryId && values.subCategoryId) {
      const selectedCategory = categories.find(cat => String(cat.id) === values.categoryId);
      const selectedSubCategory = subCategories.find(subCat => String(subCat.id) === values.subCategoryId);
      
      if (selectedCategory && selectedSubCategory) {
        const autoDescription = `${selectedSubCategory.name} ${values.name} for ${selectedCategory.name}`;
        setFieldValue('description', autoDescription);
      }
    }
  }, [values.name, values.categoryId, values.subCategoryId, categories, subCategories, setFieldValue]);

  
  return (
    <>
      <CentralLoader loading={loadingStates.categoriesLoading} />
      <Layout>
        <h2 className="mb-6 text-[26px] font-bold leading-[30px] text-dark dark:text-white">
          {isEditMode ? "Edit" : "Create"} Subcategory type
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
                onChange={handleChange}
                onBluer={handleBlur}
                error={
                  touched.subCategoryId && errors.subCategoryId
                    ? errors.subCategoryId
                    : ""
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

export default CreateUpdateSubCategoryPage;
