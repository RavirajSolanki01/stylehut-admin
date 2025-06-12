"use client";
import { useParams, useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
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
  ISize,
  ISizeApiResponse,
  ISubCategoryType,
} from "@/types/interface";
import { ImageUpload } from "@/components/FormElements/InputGroup/upload-file";
import { fileValidation } from "@/utils/schema";
import { shouldEnableButton } from "@/utils/button-toggler";
import { getMaxKeyValue } from "@/utils/common";
import SizeDialog from "./SizeDialog";
import { ChevronUpIcon, TrashIcon } from "lucide-react";

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
  size: string;
  additionalDetails: {
    id: string;
    value: string;
  }[];
  specialDetails: {
    id: string;
    value: string;
  }[];
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
  size: "",
  additionalDetails: [{ id: "", value: "" }],
  specialDetails: [{ id: "", value: "" }],
};

const CreateUpdateProductPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const isEditMode = id !== "new";
  const isVariantMode = (id as string)?.startsWith("new_variant");

  const [{ customProductId, variantId }, setCustomProductVariantId] = useState({
    customProductId: uuidv4(),
    variantId: uuidv4(),
  });

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [subCategories, setSubCategories] = useState<ICategory[]>([]);
  const [subCategoriesType, setSubCategoriesType] = useState<
    ISubCategoryType[]
  >([]);
  const [mainProduct, setMainProduct] = useState<IProduct[]>([]);
  const [size, setSize] = useState<
    { id: number; name: string; size: string }[]
  >([]);
  const [sizeQuantity, setSizeQuantity] = useState<{ [key: string]: string }>(
    {},
  );
  const [priceOfSize, setPriceOfSize] = useState<{ [key: string]: string }>({});
  const [discountOfSize, setDiscountOfSize] = useState<{
    [key: string]: string;
  }>({});
  const [anotherSizeQuantity, setAnotherSizeQuantity] = useState<{
    [key: string]: string;
  }>({});
  const [sizeType, setSizeType] = useState<string>("");
  const [currentProductData, setCurrentProductData] = useState<{
    custom_product_id: string;
    variant_id: string;
  }>({ custom_product_id: "", variant_id: "" });
  const [resSizeType, setResSizeType] = useState<string>("");
  const [isSizeAdded, setIsSizeAdded] = useState<boolean>(false);
  const [isSizeQuantityAdded, setIsSizeQuantityAdded] =
    useState<boolean>(false);
  const [brands, setBrand] = useState<IBrand[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [additionalDetailsKeys, setAdditionalDetailsKeys] = useState<
    { id: string; name: string }[]
  >([]);
  const [specialDetailsKeys, setSpecialDetailsKeys] = useState<
    { id: string; name: string }[]
  >([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    productLoading: false,
    formSubmitting: false,
  });
  const [isSizeChanged, setIsSizeChanged] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [_, setHasPrice] = useState(false);

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
              if (typeof value === "string") return true;
              return fileValidation.isValidSync(value);
            },
          ),
        )
        .min(1, "Please upload at least 1 image")
        .max(8, "You can upload a maximum of 8 images")
        .required("Image upload is required"),
      size: Yup.string().required("Size is required"),
      price: Yup.number()
        .typeError("Price must be a number")
        .required("Price is required")
        .moreThan(0, "Price must be greater than 0"),
      additionalDetails: Yup.array()
        .of(
          Yup.object().shape({
            id: Yup.string().required("Key is required"),
            value: Yup.string().required("Value is required").trim(),
          }),
        )
        .min(1, "At least one row is required"),
      specialDetails: Yup.array()
        .of(
          Yup.object().shape({
            id: Yup.string().required("Key is required"),
            value: Yup.string().required("Value is required").trim(),
          }),
        )
        .min(1, "At least one row is required"),
    }),
    onSubmit: (values) => handleSubmit(values),
    enableReinitialize: true,
  });

  const handleAddAdditionalDetailsRow = () => {
    formik.setValues({
      ...formik.values,
      additionalDetails: [
        ...formik.values.additionalDetails,
        { id: "", value: "" },
      ],
    });
  };

  const handleAddSpecialDetailsRow = () => {
    formik.setValues({
      ...formik.values,
      specialDetails: [...formik.values.specialDetails, { id: "", value: "" }],
    });
  };

  const handleRemoveAdditionalDetailsRow = (index: number) => {
    const newDetails = formik.values.additionalDetails.filter(
      (_, i) => i !== index,
    );
    formik.setValues({ ...formik.values, additionalDetails: newDetails });
  };

  const handleRemoveSpecialDetailsRow = (index: number) => {
    const newDetails = formik.values.specialDetails.filter(
      (_, i) => i !== index,
    );
    formik.setValues({ ...formik.values, specialDetails: newDetails });
  };

  const selectedDropdownValues = formik.values.additionalDetails.map(
    (d) => d.id,
  );
  const selectedSpecialDropdownValues = formik.values.specialDetails.map(
    (d) => d.id,
  );

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

  const fetchAllSizeData = useCallback(async () => {
    try {
      setLoadingStates((prev) => ({ ...prev, productLoading: true }));
      const res: ISizeApiResponse = await apiService.get("/size", {
        withAuth: true,
      });
      if (res.status === 200) {
        setSize(
          res.data.map((item: ISize) => ({
            id: item.id,
            size: item.size,
            name: item.name,
          })),
        );
      }
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

  const fetchAdditionalDetailsKeys = useCallback(async () => {
    try {
      const response = await apiService.get<{
        data: { id: string; name: string }[];
      }>("/product/additional-details-key", { withAuth: true });
      if (response.status === 200) {
        const data = response.data.data.map((item) => ({
          id: item.id.toString(),
          name: item.name,
        }));
        setAdditionalDetailsKeys(data);
      }
    } catch (error) {
      console.error("Error fetching additional details keys:", error);
      toast.error("Failed to load additional details keys");
    }
  }, []);

  const fetchSpecialDetailsKeys = useCallback(async () => {
    try {
      const response = await apiService.get<{
        data: { id: string; name: string }[];
      }>("/product/specification-key", { withAuth: true });
      if (response.status === 200) {
        const data = response.data.data.map((item) => ({
          id: item.id.toString(),
          name: item.name,
        }));
        setSpecialDetailsKeys(data);
      }
    } catch (error) {
      console.error("Error fetching special details keys:", error);
      toast.error("Failed to load special details keys");
    }
  }, []);

  const fetchSubCategoryDetails = useCallback(async () => {
    try {
      const response: { data: { data: IProduct }; status: number } =
        await apiService.get(
          `/product/${isVariantMode ? decodeURIComponent(id as string).split("=")[1] : id}`,
          {
            withAuth: true,
          },
        );
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
          relatedProducts,
          size_quantities,
          variant_id,
          custom_product_id,
          additional_details,
          special_details,
        } = response.data.data;
        setCurrentProductData({
          custom_product_id: custom_product_id,
          variant_id: variant_id,
        });

        if (isEditMode && !isVariantMode) {
          setMainProduct([...relatedProducts]);
        } else if (isEditMode && isVariantMode) {
          setMainProduct([...relatedProducts, response.data.data]);
        }
        setHasPrice(
          !!size_quantities.find((item) => Number(item.price) > 0)?.price,
        );
        setEnabled(
          !!size_quantities.find((item) => Number(item.price) > 0)?.price,
        );

        const customObject = size_quantities.reduce((acc, item) => {
          const sizeId = item.size_data.id;
          const sizeLabel = item.size_data.size;
          const key = `quantity==${sizeId}==${sizeLabel}`;
          acc[key] = isVariantMode ? 0 : item.quantity;
          return acc;
        }, {} as any);

        const priceObject = size_quantities.reduce((acc, item) => {
          const sizeId = item.size_data.id;
          const sizeLabel = item.size_data.size;
          const key = `price==${sizeId}==${sizeLabel}`;
          acc[key] = isVariantMode ? 0 : item.price;
          return acc;
        }, {} as any);

        const discountObject = size_quantities.reduce((acc, item) => {
          const sizeId = item.size_data.id;
          const sizeLabel = item.size_data.size;
          const key = `discount==${sizeId}==${sizeLabel}`;
          acc[key] = isVariantMode ? 0 : item.discount;
          return acc;
        }, {} as any);

        const anotherCustomObject = size_quantities.reduce((acc, item) => {
          const id = item.id;
          const sizeId = item.size_data.id;
          const sizeLabel = item.size_data.size;
          const key = `quantity==${sizeId}==${sizeLabel}==${id}`;
          acc[key] = isVariantMode ? 0 : item.quantity;
          return acc;
        }, {} as any);

        setSizeQuantity(customObject);
        setPriceOfSize(priceObject);
        setDiscountOfSize(discountObject);
        setAnotherSizeQuantity(anotherCustomObject);
        setCustomProductVariantId((pre) => ({
          ...pre,
          variantId: response.data.data.variant_id,
        }));
        setSizeType(
          response.data.data?.size_quantities[0]?.size_data?.name as string,
        );
        setResSizeType(
          response.data.data?.size_quantities[0]?.size_data?.name as string,
        );

        formik.setValues({
          name: isVariantMode ? "" : name,
          description: isVariantMode ? "" : description,
          categoryId: String(category.id),
          subCategoryId: String(sub_category.id),
          brandId: String(brand_id),
          price: Number(price),
          subCategoryTypeId: String(sub_category_type_id),
          quantity,
          images: isVariantMode ? [] : image,
          discount,
          size: response.data.data?.size_quantities[0]?.size_data
            ?.name as string,
          additionalDetails: additional_details?.map((detail) => ({
            id: detail.id.toString(),
            value: detail.value,
          })) || [{ id: "", value: "" }],
          specialDetails: special_details?.map((detail) => ({
            id: detail.id.toString(),
            value: detail.value,
          })) || [{ id: "", value: "" }],
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
    const endpoint = isVariantMode
      ? `/product`
      : isEditMode
        ? `/product/${id}`
        : "/product";

    const method = isVariantMode
      ? apiService.post
      : isEditMode
        ? apiService.put
        : apiService.post;
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
      formData.append("discount", String(values.discount));
      formData.append("custom_product_id", customProductId);
      formData.append("variant_id", variantId);
      !isEditMode &&
        formData.append("is_main_product", isVariantMode ? "false" : "true");

      formData.append(
        "product_additional_details",
        JSON.stringify(values.additionalDetails),
      );
      formData.append(
        "product_specifications",
        JSON.stringify(values.specialDetails),
      );

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

  const handleSizeQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSizeQuantity((prev) => ({ ...prev, [name]: value }));
    setIsSizeChanged(true);
    setIsSizeQuantityAdded(false);
  };

  const handlePriceOfSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPriceOfSize((prev) => ({ ...prev, [name]: value }));
    setIsSizeChanged(true);
  };

  const handleDiscountOfSizeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setDiscountOfSize((prev) => ({ ...prev, [name]: value }));
    setIsSizeChanged(true);
  };

  const handleSizePrice = () => {
    setEnabled(!enabled);
    setPriceOfSize({});
    setDiscountOfSize({});
  };

  const handleSizeDropdown = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value == "addMore") {
      setIsAddDialogOpen(true);
    } else {
      formik.handleChange(e);
      setSizeType(e.target.value);
      setSizeQuantity({});
      setPriceOfSize({});
    }
  };

  const handleAddSizeQuantityData = async () => {
    const sizeQuantityData = size
      .filter((item) => item.name === sizeType)
      .map((item) => "quantity==" + item.id + "==" + item.size);

    for (const item of sizeQuantityData) {
      if (!sizeQuantity[item]) {
        setIsSizeQuantityAdded(true);
        return;
      }
    }

    setIsSizeQuantityAdded(false);

    try {
      let payload: any[] = [];
      let url = "/size-quantity";
      const buildPostPayload = (customProductId: string) =>
        Object.keys(sizeQuantity).map((item) => ({
          quantity: Number(sizeQuantity[item]),
          size_id: Number(item.split("==")[1]),
          custom_product_id: customProductId,
          price:
            Object.keys(priceOfSize).length > 0
              ? Number(priceOfSize["price" + item.split("quantity")[1]])
              : 0,
          discount:
            Object.keys(discountOfSize).length > 0
              ? Number(discountOfSize["discount" + item.split("quantity")[1]])
              : 0,
        }));

      const buildPatchPayload = () =>
        Object.keys(anotherSizeQuantity).map((item) => ({
          quantity: Number(
            sizeQuantity[item.split("==").slice(0, -1).join("==")],
          ),
          size_id: Number(item.split("==")[1]),
          custom_product_id: currentProductData.custom_product_id,
          id: Number(item.split("==")[3]),
          price: enabled
            ? Number(
                priceOfSize[
                  "price==" + item.split("==").slice(1, -1).join("==")
                ],
              )
            : 0,
          discount: enabled
            ? Number(
                discountOfSize[
                  "discount==" + item.split("==").slice(1, -1).join("==")
                ],
              )
            : 0,
        }));

      let response;

      if (isEditMode) {
        if (isVariantMode) {
          payload = buildPostPayload(customProductId);
          response = await apiService.post(url, payload, { withAuth: true });
        } else if (resSizeType === sizeType) {
          payload = buildPatchPayload();
          response = await apiService.patch(url, payload, { withAuth: true });
        } else {
          await apiService.delete(
            `${url}?custom_product_id=${currentProductData.custom_product_id}`,
            { withAuth: true },
          );

          payload = buildPostPayload(currentProductData.custom_product_id);
          response = await apiService.post(url, payload, { withAuth: true });
        }
      } else {
        payload = buildPostPayload(customProductId);
        response = await apiService.post(url, payload, { withAuth: true });
      }

      if (response?.status === 200) {
        toast.success("Size quantity data saved successfully");
        setIsSizeAdded(true);
      }
    } catch (error: any) {
      console.error("Error:", error?.message || error);
      const msg =
        error.response?.data?.message ||
        "Something went wrong. Please try again later.";
      toast.error(msg);
    }
  };

  useEffect(() => {
    fetchAllCategories();
    if (isEditMode) fetchSubCategoryDetails();
  }, [isEditMode, fetchAllCategories, fetchSubCategoryDetails]);

  useEffect(() => {
    fetchAllBrand();
    fetchAllSizeData();
    fetchAdditionalDetailsKeys();
    fetchSpecialDetailsKeys();
  }, []);

  useEffect(() => {
    if (enabled && Object.keys(priceOfSize).length > 0) {
      const result = getMaxKeyValue(priceOfSize);
      formik.setFieldValue("price", result?.value);
      formik.setFieldValue(
        "discount",
        result?.key
          ? discountOfSize["discount==" + result?.key.split("price==")[1]]
          : 0,
      );
    }
  }, [priceOfSize, discountOfSize, enabled]);

  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  const isFieldDisabled = isVariantMode
    ? isVariantMode
    : mainProduct.length > 0;

  return (
    <>
      <CentralLoader loading={loadingStates.productLoading} />
      <Layout>
        <h2 className="mb-6 text-[26px] font-bold leading-[30px] text-dark dark:text-white">
          {isVariantMode ? "Add Variant" : isEditMode ? "Edit" : "Create"}{" "}
          Product
        </h2>
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="w-full p-4">
            {isEditMode && mainProduct.length > 0 && (
              <>
                <h2 className="mb-4 text-lg font-bold">
                  Current Product Variants{" "}
                  {mainProduct.length > 0 && `(${mainProduct.length})`}
                </h2>
                <div className="flex gap-2">
                  {mainProduct.map((item, index) => (
                    <div key={index} className="relative">
                      <img
                        className="h-14 w-14 rounded-md object-cover"
                        src={item.image[0]}
                        alt={item.name}
                      />
                      <div>{item.name}</div>
                    </div>
                  ))}
                </div>
                <hr className="my-4" />
              </>
            )}

            <form onSubmit={formik.handleSubmit} noValidate>
              {isEditMode && !isVariantMode && mainProduct?.length > 0 && (
                <div className="-mt-4 mb-4 text-xs">
                  NOTE: You will not be able to change types if product has
                  variants
                </div>
              )}
              <InputGroup
                className="mb-5 w-full lg:w-1/2"
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
                className="mb-5 w-full lg:w-1/2"
                name="categoryId"
                value={values.categoryId}
                disabled={isFieldDisabled}
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
                className="mb-5 w-full lg:w-1/2"
                name="subCategoryId"
                value={values.subCategoryId}
                disabled={isFieldDisabled}
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
                className="mb-5 w-full lg:w-1/2"
                name="subCategoryTypeId"
                value={values.subCategoryTypeId}
                disabled={isFieldDisabled}
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
                className="mb-5 w-full lg:w-1/2"
                name="brandId"
                value={values.brandId}
                disabled={isFieldDisabled}
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

              <div className="mb-5 w-full lg:w-1/2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Additional Details
                </label>

                {formik.values.additionalDetails.map((detail, index) => {
                  const dropdownError = (
                    formik.errors.additionalDetails?.[index] as any
                  )?.id;
                  const inputTextError = (
                    formik.errors.additionalDetails?.[index] as any
                  )?.value;
                  return (
                    <div key={detail.id} className="mb-3 flex w-full gap-2">
                      <div className="w-full">
                        <div className="relative">
                          <select
                            className="disabled:bg-whiter w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary [&>option]:text-dark-5 dark:[&>option]:text-dark-6"
                            name={`additionalDetails[${index}].id`}
                            value={detail.id}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          >
                            <option value="">Select option</option>
                            {additionalDetailsKeys.map((opt) => {
                              const isDisabled =
                                selectedDropdownValues.includes(opt.id) &&
                                detail.id !== opt.id;
                              return (
                                <option
                                  key={opt.id}
                                  value={opt.id}
                                  disabled={isDisabled}
                                >
                                  {opt.name}
                                </option>
                              );
                            })}
                          </select>
                          <ChevronUpIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-180" />
                        </div>
                        {dropdownError && (
                          <div className="text-sm text-red-500">
                            {dropdownError}
                          </div>
                        )}
                      </div>
                      <div className="w-full">
                        <input
                          type="text"
                          placeholder="Value"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary disabled:cursor-default disabled:bg-gray-2 data-[active=true]:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary dark:disabled:bg-dark dark:data-[active=true]:border-primary"
                          value={detail.value}
                          onBlur={formik.handleBlur}
                          name={`additionalDetails[${index}].value`}
                          onChange={formik.handleChange}
                        />
                        {inputTextError && (
                          <div className="text-sm text-red-500">
                            {inputTextError}
                          </div>
                        )}
                      </div>
                      {formik.values.additionalDetails.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveAdditionalDetailsRow(index)
                          }
                          className="flex h-[50px] w-[50px] min-w-[50px] items-center justify-center rounded-full border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  );
                })}
                {typeof formik.errors.additionalDetails === "string" && (
                  <div className="text-red-500">
                    {formik.errors.additionalDetails}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleAddAdditionalDetailsRow}
                  disabled={
                    formik.values.additionalDetails.length >=
                    additionalDetailsKeys.length
                  }
                  className="mt-2 flex items-center gap-1 text-primary hover:underline"
                >
                  <span>+ Add More</span>
                </button>
              </div>

              <div className="mb-5 w-full lg:w-1/2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Specifications Details
                </label>

                {formik.values.specialDetails.map((detail, index) => {
                  const dropdownError = (
                    formik.errors.specialDetails?.[index] as any
                  )?.id;
                  const inputTextError = (
                    formik.errors.specialDetails?.[index] as any
                  )?.value;
                  return (
                    <div key={detail.id} className="mb-3 flex w-full gap-2">
                      <div className="w-full">
                        <div className="relative">
                          <select
                            className="disabled:bg-whiter w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary [&>option]:text-dark-5 dark:[&>option]:text-dark-6"
                            name={`specialDetails[${index}].id`}
                            value={detail.id}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          >
                            <option value="">Select option</option>
                            {specialDetailsKeys.map((opt) => {
                              const isDisabled =
                                selectedSpecialDropdownValues.includes(
                                  opt.id,
                                ) && detail.id !== opt.id;
                              return (
                                <option
                                  key={opt.id}
                                  value={opt.id}
                                  disabled={isDisabled}
                                >
                                  {opt.name}
                                </option>
                              );
                            })}
                          </select>
                          <ChevronUpIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-180" />
                        </div>
                        {dropdownError && (
                          <div className="text-sm text-red-500">
                            {dropdownError}
                          </div>
                        )}
                      </div>
                      <div className="w-full">
                        <input
                          type="text"
                          placeholder="Value"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary disabled:cursor-default disabled:bg-gray-2 data-[active=true]:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary dark:disabled:bg-dark dark:data-[active=true]:border-primary"
                          value={detail.value}
                          onBlur={formik.handleBlur}
                          name={`specialDetails[${index}].value`}
                          onChange={formik.handleChange}
                        />
                        {inputTextError && (
                          <div className="text-sm text-red-500">
                            {inputTextError}
                          </div>
                        )}
                      </div>
                      {formik.values.specialDetails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialDetailsRow(index)}
                          className="flex h-[50px] w-[50px] min-w-[50px] items-center justify-center rounded-full border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  );
                })}
                {typeof formik.errors.specialDetails === "string" && (
                  <div className="text-red-500">
                    {formik.errors.specialDetails}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleAddSpecialDetailsRow}
                  disabled={
                    formik.values.specialDetails.length >=
                    additionalDetailsKeys.length
                  }
                  className="mt-2 flex items-center gap-1 text-primary hover:underline"
                >
                  <span>+ Add More</span>
                </button>
              </div>

              <InputGroup
                className="mb-5 w-full lg:w-1/2"
                type="string"
                name="price"
                label="Price"
                disabled={enabled}
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
                className="mb-5 w-full lg:w-1/2"
                type="number"
                name="discount"
                label="Discount"
                disabled={enabled}
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

              <Select
                label="Size"
                className="mb-3 w-full lg:w-1/2"
                name="size"
                value={values.size}
                placeholder="Select size"
                disabled={isFieldDisabled}
                required
                items={[
                  ...Array.from(
                    new Map(size.map((item) => [item.name, item])).values(),
                  ).map((item) => ({
                    label: item.name,
                    value: item.name,
                  })),
                  { label: "+ Add more", value: "addMore" },
                ]}
                onChange={(e) => {
                  handleSizeDropdown(e);
                }}
                onBluer={handleBlur}
                error={touched.size && errors.size ? errors.size : ""}
              />

              {sizeType !== "" && (
                <div className="mb-2 flex items-center gap-2">
                  <button
                    title="has quantity"
                    onClick={() => handleSizePrice()}
                    type="button"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                      enabled ? "bg-primary" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                        enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>{" "}
                  <span>Dynamic Pricing</span>
                </div>
              )}
              <div>
                {sizeType !== "" && (
                  <div className="grid lg:grid-cols-2">
                    <div className="grid grid-cols-4">
                      <div className="text-center">Size</div>
                      <div className="">Quantity</div>
                      {enabled && (
                        <>
                          <div>Price</div>
                          <div>Discount</div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                {size.map((item, index) =>
                  item.name === sizeType ? (
                    <div
                      key={index}
                      className="mb-1 grid grid-cols-1 gap-2 lg:grid-cols-2"
                    >
                      <div className="grid w-full grid-cols-4 gap-2">
                        <div
                          key={item.id}
                          className="col-span-1 flex h-10 min-w-10 items-center justify-center rounded-full border p-2 text-center text-sm font-medium"
                        >
                          {item.size}
                        </div>
                        <div className="col-span-3 flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter quantity"
                            className="w-full rounded-md border border-gray-300 p-2"
                            name={`quantity==${item.id}==${item.size}`}
                            value={
                              sizeQuantity[`quantity==${item.id}==${item.size}`]
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d*$/.test(value)) {
                                handleSizeQuantityChange(e);
                              }
                            }}
                          />
                          {enabled && (
                            <input
                              type="text"
                              placeholder="Enter Price"
                              className="w-full rounded-md border border-gray-300 p-2"
                              name={`price==${item.id}==${item.size}`}
                              value={
                                priceOfSize[`price==${item.id}==${item.size}`]
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) {
                                  handlePriceOfSizeChange(e);
                                }
                              }}
                            />
                          )}
                          {enabled && (
                            <input
                              type="text"
                              placeholder="Enter Discount"
                              className="w-full rounded-md border border-gray-300 p-2"
                              name={`discount==${item.id}==${item.size}`}
                              value={
                                discountOfSize[
                                  `discount==${item.id}==${item.size}`
                                ]
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) {
                                  handleDiscountOfSizeChange(e);
                                }
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null,
                )}
                {isSizeQuantityAdded && (
                  <div className="text-red-500">
                    Please add size quantity data in all the fields
                  </div>
                )}
                {size.length > 0 && sizeType && (
                  <button
                    type="button"
                    className={`${isEditMode ? (isSizeChanged ? "" : "cursor-not-allowed opacity-50") : ""} rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90`}
                    onClick={handleAddSizeQuantityData}
                    disabled={isEditMode ? !isSizeChanged : false}
                  >
                    {isEditMode ? "Save " : "Add "} size
                  </button>
                )}
              </div>

              <ImageUpload
                className="mb-5 w-full lg:w-1/2"
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
                className="mb-5.5 w-full lg:w-1/2"
                label="Description"
                name="description"
                maxLength={1024}
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
                  disabled={
                    loadingStates.formSubmitting ||
                    shouldEnableButton({
                      isEditMode,
                      isSizeAdded,
                      isVariantMode,
                    })
                  }
                  className={`rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90 ${
                    isEditMode
                      ? "cursor-pointer"
                      : !isSizeAdded
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                  }`}
                >
                  Save <SmallLoader loading={loadingStates.formSubmitting} />
                </button>
              </div>
            </form>
          </div>
        </div>
        <SizeDialog
          onOpenChange={() => setIsAddDialogOpen((pre) => !pre)}
          open={isAddDialogOpen}
          refreshSizeList={fetchAllSizeData}
        />
      </Layout>
    </>
  );
};

export default CreateUpdateProductPage;
