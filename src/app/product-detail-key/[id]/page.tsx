"use client";
import { useParams, useRouter } from "next/navigation";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useEffect, useState, useCallback, useMemo } from "react";
import { CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import Layout from "@/components/Layouts";
import { CentralLoader, SmallLoader } from "@/components/Loader";
import apiService from "@/services/base.services";

// Type definitions
interface NameAvailabilityResponse {
  available: boolean;
  message?: string;
  data?: {
    available: boolean;
    message?: string;
  };
}

interface ApiError {
  response?: {
    data: {
      message: string;
    };
    status: number;
  };
  message: string;
}

interface FormValues {
  name: string;
}

// Interfaces
interface ProductDetailKeyResponse {
  data: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  message?: string;
}

// Constants
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 40;
const DEBOUNCE_DELAY = 500;

// Validation schema
const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .max(NAME_MAX_LENGTH, `Name must be ${NAME_MAX_LENGTH} characters or less`)
    .min(
      NAME_MIN_LENGTH,
      `Name must be at least ${NAME_MIN_LENGTH} characters`,
    ),
});

// Reusable components
const FormInput = ({
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  isChecking,
  isValid,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  isChecking?: boolean;
  isValid?: boolean | null;
}) => (
  <div className="w-full sm:w-9/12 md:w-1/2">
    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <div className="relative">
      <div className="relative">
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          className={`w-full rounded-md border p-2 pr-10 ${
            error && touched
              ? "border-red-500"
              : "border-gray-300 dark:border-dark-3"
          } dark:bg-dark-2 dark:text-white`}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isChecking && (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
          )}
          {!isChecking && isValid === true && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
        </div>
      </div>
      {error && touched && (
        <div className="mt-1 text-sm text-red-600">{error}</div>
      )}
    </div>
  </div>
);

const CancelButton = ({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
    type="button"
    onClick={onClick}
    disabled={disabled}
  >
    Cancel
  </button>
);

const SubmitButton = ({
  loading,
  disabled,
  label,
}: {
  loading: boolean;
  disabled?: boolean;
  label: string;
}) => (
  <button
    className="flex items-center justify-center gap-1 rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90 disabled:opacity-70"
    type="submit"
    disabled={disabled}
  >
    {loading ? (
      <>
        {label} <SmallLoader loading={loading} />
      </>
    ) : (
      label
    )}
  </button>
);

const CreateUpdateProductDetailKeyPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isEditMode = id !== "new";

  const [loading, setIsLoading] = useState(false);
  const [centerLoader, setCenterLoader] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [initialName, setInitialName] = useState<string | null>(null);

  const [initialValues, setInitialValues] = useState<FormValues>({
    name: "",
  });

  // Error handler utility
  const handleApiError = useCallback(
    (error: unknown, defaultMessage: string): string => {
      const apiError = error as ApiError;
      return apiError?.response?.data?.message || defaultMessage;
    },
    [],
  );

  // Name validation logic
  const validateName = useCallback(
    async (name: string): Promise<void> => {
      if (!name || name.length < NAME_MIN_LENGTH) {
        setIsValid(null);
        setNameError(null);
        return;
      }

      if (isEditMode && initialName && name === initialName) {
        setIsValid(true);
        setNameError(null);
        return;
      }

      setIsChecking(true);
      try {
        const endpoint = isEditMode
          ? `/product/additional-details-key/check?id=${id}&name=${encodeURIComponent(name)}`
          : `/product/additional-details-key/check?name=${encodeURIComponent(name)}`;

        const response = await apiService.get<NameAvailabilityResponse>(
          endpoint,
          { withAuth: true },
        );

        const isAvailable = response?.data?.data?.available ?? false;
        setIsValid(isAvailable);
        setNameError(isAvailable ? null : "This name is already taken");
      } catch (error: unknown) {
        setIsValid(null);
        setNameError(handleApiError(error, "Error checking name availability"));
      } finally {
        setIsChecking(false);
      }
    },
    [handleApiError, id, initialName, isEditMode],
  );

  // Debounced name check
  const debouncedCheckName = useCallback(
    (name: string) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        validateName(name);
      }, DEBOUNCE_DELAY);

      setDebounceTimer(timer);
    },
    [debounceTimer, validateName],
  );

  // Form submission handler
  const createOrUpdateProductDetailKey = useCallback(
    async (values: FormValues) => {
      setIsLoading(true);

      const endpoint = isEditMode
        ? `/product/additional-details-key/${id}`
        : "/product/additional-details-key";

      const method = isEditMode ? apiService.patch : apiService.post;
      const successMessage = isEditMode
        ? "Product detail key updated successfully"
        : "Product detail key created successfully";

      try {
        const response = await method(endpoint, values, { withAuth: true });

        if (response?.status === 200) {
          toast.success(successMessage);
          router.push("/product-detail-key");
        }
      } catch (error: unknown) {
        const msg = handleApiError(
          error,
          "Something went wrong. Please try again later.",
        );
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [handleApiError, id, isEditMode, router],
  );

  // Handle form submission
  const handleFormSubmit = useCallback(
    async (
      values: FormValues,
      { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
    ) => {
      await createOrUpdateProductDetailKey(values);
      setSubmitting(false);
    },
    [createOrUpdateProductDetailKey],
  );

  // Fetch category details in edit mode
  const getCategoryDetails = useCallback(async () => {
    try {
      setCenterLoader(true);
      const response = await apiService.get<ProductDetailKeyResponse>(
        `/product/additional-details-key/${id}`,
        { withAuth: true },
      );

      if (response?.status === 200) {
        const { name } = response.data.data;
        setInitialName(name);
        setInitialValues({
          name,
        });
      }
    } catch (error: unknown) {
      if ((error as ApiError)?.response?.status === 404) {
        toast.error("Product detail key not found.");
        router.push("/product-detail-key");
        return;
      }
      toast.error(
        handleApiError(error, "Something went wrong. Please try again later."),
      );
    } finally {
      setCenterLoader(false);
    }
  }, [handleApiError, id, router]);

  // Redirect to previous page
  const redirectToPreviousPage = useCallback(() => {
    router.back();
  }, [router]);

  // Load data in edit mode
  useEffect(() => {
    if (isEditMode) {
      getCategoryDetails();
    }
  }, [isEditMode, getCategoryDetails]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return (
    <Layout>
      <CentralLoader loading={centerLoader} />
      <h2 className="mb-6 text-[26px] font-bold leading-[30px] text-dark dark:text-white">
        {isEditMode ? "Edit" : "Create"} Product Detail Key
      </h2>
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="w-full p-4">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
            enableReinitialize
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
            }) => (
              <form onSubmit={handleSubmit} noValidate>
                <FormInput
                  name="name"
                  label="Name"
                  placeholder="Enter name"
                  value={values.name}
                  onChange={(e) => {
                    handleChange(e);
                    setIsValid(null);
                    setNameError(null);
                    debouncedCheckName(e.target.value);
                  }}
                  onBlur={handleBlur}
                  error={errors.name}
                  touched={touched.name}
                  isChecking={isChecking}
                  isValid={isValid}
                />
                {nameError && (
                  <div className="mb-5 mt-1 text-sm text-red-600">
                    {nameError}
                  </div>
                )}

                <div className="mt-5 flex justify-start gap-3">
                  <CancelButton
                    onClick={redirectToPreviousPage}
                    disabled={loading}
                  />
                  <SubmitButton
                    loading={isSubmitting}
                    disabled={isSubmitting || isValid === false}
                    label={isEditMode ? "Update" : "Create"}
                  />
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </Layout>
  );
};

export default CreateUpdateProductDetailKeyPage;
