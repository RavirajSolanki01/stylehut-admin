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
  const [sizeQuantity, setSizeQuantity] = useState<{
    [key: string]: string;
  }>({});
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
      size: Yup.string().required("Size is required"),
      price: Yup.number()
        .typeError("Price must be a number")
        .required("Price is required")
        .moreThan(0, "Price must be greater than 0"),
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

  // Fetch product data
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
        setHasPrice(!!size_quantities.find((item) => item.price > 0)?.price);
        setEnabled(!!size_quantities.find((item) => item.price > 0)?.price);

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
    fetchAllSizeData();
  }, []);

  useEffect(() => {
    // const maxPrice = Math.max(...Object.values(priceOfSize).map(Number))
    const result = getMaxKeyValue(priceOfSize);

    setFieldValue("price", result?.value);

    setFieldValue(
      "discount",
      result?.key
        ? discountOfSize["discount==" + result?.key.split("price==")[1]]
        : 0,
    );

  }, [priceOfSize, discountOfSize]);

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
    console.log(priceOfSize, ">><< priceOfSize");
  };

  const handleDiscountOfSizeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setDiscountOfSize((prev) => ({ ...prev, [name]: value }));
    setIsSizeChanged(true);
    console.log(discountOfSize, ">><< discountOfSizeZie");
  };

  const handleSizePrice = () => {
    setEnabled(!enabled);
    setPriceOfSize({});
    setDiscountOfSize({});
  };

  // Add size  / Save size button
  const handleAddSizeQuantityData = async () => {
    console.log("add size quantity data");

    const sizeQuantityData = size
      .filter((item) => item.name === sizeType)
      .map((item) => "quantity==" + item.id + "==" + item.size);

    for (const item of sizeQuantityData) {
      if (!sizeQuantity[item]) {
        setIsSizeQuantityAdded(true);
        return; // This will exit handleAddSizeQuantityData
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
          price: Number(priceOfSize['price==' + item.split("==").slice(1, -1).join("==")]),
          discount: Number(discountOfSize['discount==' + item.split("==").slice(1, -1).join("==")])
        }));

      console.log(
        "anotherSizeQuantity=>",
        anotherSizeQuantity,
        "priceOfSize=>",
        priceOfSize,
        "discountOfSize=>",
        discountOfSize,
      );

      let response;

      if (isEditMode) {
        if (isVariantMode) {
          payload = buildPostPayload(customProductId);
          response = await apiService.post(url, payload, { withAuth: true });
        } else if (resSizeType === sizeType) {
          payload = buildPatchPayload();
          response = await apiService.patch(url, payload, { withAuth: true });
        } else {
          // DELETE first, then POST
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
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
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
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
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
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
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
              <InputGroup
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
                type="number"
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
                className="mb-5 w-full sm:w-9/12 md:w-1/2"
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
                className="mb-3 w-full sm:w-9/12 md:w-1/2"
                name="size"
                value={values.size}
                placeholder="Select size"
                disabled={isFieldDisabled}
                required
                items={Array.from(
                  new Map(size.map((item) => [item.name, item])).values(),
                ).map((item) => ({
                  label: item.name,
                  value: item.name,
                }))}
                onChange={(e) => {
                  handleChange(e);
                  setSizeType(e.target.value);
                  setSizeQuantity({});
                  setPriceOfSize({});
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
                {size.map((item, index) =>
                  item.name === sizeType ? (
                    <div key={index} className="mb-1 grid grid-cols-2 gap-2">
                      <div className="grid w-full grid-cols-5 gap-2">
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
                                }
                                handleDiscountOfSizeChange(e);
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
      </Layout>
    </>
  );
};

export default CreateUpdateProductPage;
