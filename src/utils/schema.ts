import * as Yup from "yup";

export const profileValidation = Yup.object().shape({
  firstName: Yup.string()
    .max(30, "First name must be at most 30 characters")
    .min(2, "First name must be at least 2 characters")
    .matches(/^[A-Za-z]+$/, "First name can only contain letters")
    .required("First name is required"),

  lastName: Yup.string()
    .max(30, "Last name must be at most 30 characters")
    .min(2, "Last name must be at least 2 characters")
    .matches(/^[A-Za-z]+$/, "Last name can only contain letters")
    .required("Last name is required"),

  email: Yup.string()
    .trim()
    .email("Invalid email address")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{1,}$/i, "Invalid email address")
    .required("Email is required"),

  phoneNo: Yup.string()
    .matches(/^\d{10}$/, "Mobile number must be exactly 10 digits")
    .required("Mobile number is required"),

  birthDate: Yup.date()
    .max(new Date(), "Birth date cannot be in the future")
    .required("Birth date is required"),
});

export const MAX_FILE_SIZE = 5;
export const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

// Custom file validation schema
export const fileValidation = Yup.mixed()
  .test("fileType", "Only JPG, JPEG, PNG allowed", (value) => {
    if (!value) return false;

    // Handle single File or File[] (in case you're testing arrays)
    const file = value as File;
    return file && SUPPORTED_FORMATS.includes(file.type);
  })
  .test("fileSize", "Max file size is 5MB", (value) => {
    if (!value) return false;

    const file = value as File;
    return file && file.size <= 5 * 1024 * 1024;
  });

export const shopByCategoryValidation = Yup.object({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .max(40, "Name must be 40 characters or less")
    .min(2, "Name must be at least 2 characters"),

  sub_category_id: Yup.string().trim().required("Please select a subcategory"),

  image: Yup.array()
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
    .min(1, "Image is required")
    .required("Image is required"),

  maxDiscount: Yup.string()
    .required("Max discount is required")
    .test(
      "greater-than-min",
      "Max discount must be greater than Min discount",
      function (value) {
        const { minDiscount } = this.parent;
        const max = parseFloat(value);
        const min = parseFloat(minDiscount);
        if (isNaN(max) || isNaN(min)) return true;
        return !isNaN(max) && !isNaN(min) && max > min;
      },
    ),
});
