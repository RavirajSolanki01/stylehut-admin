import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog/components/Dialog";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import React, { useState, useCallback, useRef } from "react";
import apiService from "@/services/base.services";
import { toast } from "react-toastify";
import { ISize } from "@/types/interface";
import { CheckCircle, XCircle } from "lucide-react";
import SwitchButton from "@/components/Button/SwitchButton";
import { v4 as uuidv4 } from "uuid";
import { transformSizesWithUniqueIds } from "@/utils/common";

interface SizeResponse {
  results: ISize[];
  total: number;
}

interface AdditionalField {
  label: string;
  value: string;
}

interface BottomwearSize {
  size: string;
  waist: string;
  inseam: string;
  additionalFields: AdditionalField[];
}

interface FootwearSize {
  size: string;
  ukSize: string;
  usSize: string;
  euroSize: string;
  actualSize: string;
  unit: string;
  additionalFields: AdditionalField[];
}

interface TopwearSize {
  size: string;
  additionalFields: AdditionalField[];
}

interface FormValues {
  name: string;
  sizes: string[];
  includeSizeChart: boolean;
  wearType: string;
  topwearSizes?: any[];
  bottomwearSizes?: any[];
  footwearSizes?: any[];
}

// Custom debounce function
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );
}

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  sizes: Yup.array().when("includeSizeChart", ([includeSizeChart], schema) => {
    if (!includeSizeChart) {
      return schema
        .of(
          Yup.string()
            .required("Size value is required")
            .test("unique", "Size must be unique", function (value) {
              if (!value) return true;
              const { parent } = this;
              return parent.indexOf(value) === parent.lastIndexOf(value);
            }),
        )
        .min(1, "At least one size is required");
    }

    return schema.notRequired();
  }),

  includeSizeChart: Yup.boolean(),
  wearType: Yup.string().when("includeSizeChart", {
    is: true,
    then: (schema) => schema.required("Wear type is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  topwearSizes: Yup.array().when(["wearType", "includeSizeChart"], {
    is: (wearType: string, includeSizeChart: boolean) =>
      wearType === "topwear" && includeSizeChart,
    then: (schema) =>
      schema.of(
        Yup.object().shape({
          size: Yup.string()
            .required("Size is required")
            .test("unique-size", "Size must be unique", function (value) {
              const { options } = this;
              const siblings = options?.context?.topwearSizes || [];
              const count = siblings.filter(
                (s: any) => s.size === value,
              ).length;
              return count <= 1;
            }),
          additionalFields: Yup.array()
            .of(
              Yup.object().shape({
                label: Yup.string().required("Label is required"),
                value: Yup.string().required("Value is required"),
              }),
            )
            .test(
              "unique-labels",
              "Labels must be unique within this size",
              function (additionalFields) {
                if (!Array.isArray(additionalFields)) return true;
                const seen = new Set<string>();
                const reserved = ["size"];
                for (let i = 0; i < additionalFields.length; i++) {
                  const label = (additionalFields[i]?.label || "")
                    .trim()
                    .toLowerCase();
                  if (seen.has(label)) {
                    return this.createError({
                      path: `${this.path}[${i}].label`,
                      message: `"${additionalFields[i]?.label}" is duplicated in this size group`,
                    });
                  }
                  if (reserved.includes(label)) {
                    return this.createError({
                      path: `${this.path}[${i}].label`,
                      message: `"${additionalFields[i]?.label}" is a reserved label and cannot be used`,
                    });
                  }
                  seen.add(label);
                }
                return true;
              },
            ),
        }),
      ),
    otherwise: () => Yup.array().notRequired(),
  }),
  bottomwearSizes: Yup.array().when(["wearType", "includeSizeChart"], {
    is: (wearType: string, includeSizeChart: boolean) =>
      wearType === "bottomwear" && includeSizeChart,
    then: (schema) =>
      schema.of(
        Yup.object().shape({
          size: Yup.string()
            .required("Size is required")
            .test("unique-size", "Size must be unique", function (value) {
              const { options } = this;
              const siblings = options?.context?.bottomwearSizes || [];
              const count = siblings.filter(
                (s: any) => s.size === value,
              ).length;
              return count <= 1;
            }),
          additionalFields: Yup.array()
            .of(
              Yup.object().shape({
                label: Yup.string().required("Label is required"),
                value: Yup.string().required("Value is required"),
              }),
            )
            .test(
              "unique-labels",
              "Labels must be unique within this size",
              function (additionalFields) {
                if (!Array.isArray(additionalFields)) return true;
                const seen = new Set<string>();
                const reserved = ["size"];
                for (let i = 0; i < additionalFields.length; i++) {
                  const label = (additionalFields[i]?.label || "")
                    .trim()
                    .toLowerCase();
                  if (seen.has(label)) {
                    return this.createError({
                      path: `${this.path}[${i}].label`,
                      message: `"${additionalFields[i]?.label}" is duplicated in this size group`,
                    });
                  }
                  if (reserved.includes(label)) {
                    return this.createError({
                      path: `${this.path}[${i}].label`,
                      message: `"${additionalFields[i]?.label}" is a reserved label and cannot be used`,
                    });
                  }
                  seen.add(label);
                }
                return true;
              },
            ),
        }),
      ),
    otherwise: () => Yup.array().notRequired(),
  }),
  footwearSizes: Yup.array().when(["wearType", "includeSizeChart"], {
    is: (wearType: string, includeSizeChart: boolean) =>
      wearType === "footwear" && includeSizeChart,
    then: (schema) =>
      schema.of(
        Yup.object().shape({
          // size: Yup.string().required("Size is required"),
          ukSize: Yup.string().required("UK Size is required"),
          usSize: Yup.string().required("US Size is required"),
          euroSize: Yup.string().required("EURO Size is required"),
          actualSize: Yup.string().required("Actual Size is required"),
          additionalFields: Yup.array()
            .of(
              Yup.object().shape({
                label: Yup.string().required("Label is required"),
                value: Yup.string().required("Value is required"),
              }),
            )
            .test(
              "unique-labels-and-no-reserved",
              "Labels must be unique and not use reserved names",
              function (additionalFields) {
                if (!Array.isArray(additionalFields)) return true;

                const seen = new Set<string>();
                const reserved = [
                  "uk size",
                  "us size",
                  "euro size",
                  "to fit foot length",
                ];

                for (let i = 0; i < additionalFields.length; i++) {
                  const label = (additionalFields[i]?.label || "")
                    .trim()
                    .toLowerCase();

                  if (seen.has(label)) {
                    return this.createError({
                      path: `${this.path}[${i}].label`,
                      message: `"${additionalFields[i]?.label}" is duplicated in this size group`,
                    });
                  }

                  if (reserved.includes(label)) {
                    return this.createError({
                      path: `${this.path}[${i}].label`,
                      message: `"${additionalFields[i]?.label}" is a reserved label and cannot be used`,
                    });
                  }

                  seen.add(label);
                }

                return true;
              },
            ),
        }),
      ),
    otherwise: () => Yup.array().notRequired(),
  }),
});

const SizeDialog = ({
  open = false,
  onOpenChange,
  refreshSizeList,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshSizeList: () => void;
}) => {
  const initialValues = {
    name: "",
    sizes: [""],
    includeSizeChart: false,
    wearType: "",
    footwearSizes: [
      {
        size: "",
        ukSize: "",
        usSize: "",
        euroSize: "",
        actualSize: "",
        unit: "cm",
        additionalFields: [] as AdditionalField[],
      },
    ],
    bottomwearSizes: [
      {
        size: "",
        additionalFields: [
          { label: "To Fit Waist", value: "" },
          { label: "Inseam Length", value: "" },
          { label: "Thigh", value: "" },
          { label: "Rise", value: "" },
          { label: "Outseam Leagth", value: "" },
          { label: "Hips", value: "" },
        ] as AdditionalField[],
      },
    ],
    topwearSizes: [
      {
        size: "",
        additionalFields: [
          { label: "Front Length", value: "" },
          { label: "Across Shoulder", value: "" },
        ] as AdditionalField[],
      },
    ],
  };

  const [nameError, setNameError] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [includeSizeChart, setIncludeSizeChart] = useState(false);
  const [wearType, setWearType] = useState("");
  const [unit, setUnit] = useState("cm");

  const checkNameAvailability = async (name: string) => {
    if (name.length < 2) {
      setIsValid(null);
      return;
    }

    setIsChecking(true);
    setIsValid(null);

    try {
      const response = await apiService.get<SizeResponse>(
        `/size/check?query=${name}`,
        {
          withAuth: true,
        },
      );

      if (response.status === 200) {
        if (response.data.total > 0) {
          setNameError("Please choose a different name");
          setIsValid(false);
        } else {
          setNameError("");
          setIsValid(true);
        }
      }
    } catch (error) {
      console.error("Error checking size name:", error);
      toast.error("Something went wrong while checking size name");
      setIsValid(false);
    } finally {
      setIsChecking(false);
    }
  };

  const debouncedCheckName = useDebounce(checkNameAvailability, 500);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      if (nameError) {
        return;
      }


      const response = await apiService.post(
        `/size`,
        values.wearType == "topwear"
          ? transformSizesWithUniqueIds(
              values.topwearSizes,
              values.name,
              "topwear",
              unit == "cm",
            )
          : values.wearType == "footwear"
            ? transformSizesWithUniqueIds(
                values.footwearSizes,
                values.name,
                "footwear",
                unit == "cm",
              )
            : values.wearType == "bottomwear"
              ? transformSizesWithUniqueIds(
                  values.bottomwearSizes,
                  values.name,
                  "bottomwear",
                  unit == "cm",
                )
              : {
                  size_data: values.sizes.map((item: any) => ({
                    name: values.name,
                    size: item,
                    has_size_chart: false,
                    custom_size_id: uuidv4(),
                  })),
                  size_chart_data: [],
                },
      );
      console.log(response, "thisis teh respionse");
      if (response.status === 200) {
        toast.success("Size added successfully");
        refreshSizeList();
        onOpenChange(false);
      }
      // Handle form submission here
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setSubmitting(false);
      setWearType("");
      setIncludeSizeChart(false);
      setUnit("cm");
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add more sizes</DialogTitle>
          </DialogHeader>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            validateOnChange={true}
            validateOnBlur={true}
            
          >
            {({
              values,
              errors,
              touched,
              handleSubmit,
              isSubmitting,
              setFieldValue,
              resetForm,
            }) => (
              <Form className="flex flex-col" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="relative">
                      <Field
                        name="name"
                        type="text"
                        placeholder="Enter Name i.e. Top wear"
                        className="w-full rounded-md border border-gray-300 p-2 pr-10"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setFieldValue("name", e.target.value);
                          debouncedCheckName(e.target.value);
                        }}
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
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="mt-1 text-sm text-red-600"
                    />
                    {nameError && (
                      <div className="mt-1 text-sm text-red-600">
                        {nameError}
                      </div>
                    )}
                  </div>

                  <SwitchButton
                    label="Include size chart"
                    enabled={includeSizeChart}
                    showColor={true}
                    onChange={(enabled) => {
                      setIncludeSizeChart(enabled);
                      setFieldValue("includeSizeChart", enabled);
                      if (enabled) {
                        setWearType("topwear");
                        setFieldValue("wearType", "topwear");
                        // Reset to initial topwear values
                        setFieldValue("topwearSizes", [
                          {
                            size: "",
                            additionalFields: [
                              { label: "Front Length", value: "" },
                              { label: "Across Shoulder", value: "" },
                            ],
                          },
                        ]);
                        // Reset sizes array to empty
                        setFieldValue("sizes", [""]);
                      } else {
                        setWearType("");
                        setFieldValue("wearType", "");
                        // Reset all wear type fields
                        setFieldValue("topwearSizes", [
                          {
                            size: "",
                            additionalFields: [
                              { label: "Front Length", value: "" },
                              { label: "Across Shoulder", value: "" },
                            ],
                          },
                        ]);
                        setFieldValue("bottomwearSizes", [
                          {
                            size: "",
                            additionalFields: [
                              { label: "To Fit Waist", value: "" },
                              { label: "Inseam Length", value: "" },
                              { label: "Thigh", value: "" },
                              { label: "Rise", value: "" },
                              { label: "Outseam Leagth", value: "" },
                              { label: "Hips", value: "" },
                            ],
                          },
                        ]);
                        setFieldValue("footwearSizes", [
                          {
                            size: "",
                            ukSize: "",
                            usSize: "",
                            euroSize: "",
                            actualSize: "",
                            unit: unit,
                            additionalFields: [],
                          },
                        ]);
                        // Reset sizes array to empty
                        setFieldValue("sizes", [""]);
                      }
                      // Reset validation state
                      resetForm({
                        values: {
                          ...values,
                          includeSizeChart: enabled,
                          wearType: enabled ? "topwear" : "",
                          sizes: [""],
                          topwearSizes: enabled
                            ? [
                                {
                                  size: "",
                                  additionalFields: [
                                    { label: "Front Length", value: "" },
                                    { label: "Across Shoulder", value: "" },
                                  ],
                                },
                              ]
                            : [
                                {
                                  size: "",
                                  additionalFields: [
                                    { label: "Front Length", value: "" },
                                    { label: "Across Shoulder", value: "" },
                                  ],
                                },
                              ],
                          bottomwearSizes: [
                            {
                              size: "",
                              additionalFields: [
                                { label: "To Fit Waist", value: "" },
                                { label: "Inseam Length", value: "" },
                                { label: "Thigh", value: "" },
                                { label: "Rise", value: "" },
                                { label: "Outseam Leagth", value: "" },
                                { label: "Hips", value: "" },
                              ],
                            },
                          ],
                          footwearSizes: [
                            {
                              size: "",
                              ukSize: "",
                              usSize: "",
                              euroSize: "",
                              actualSize: "",
                              unit: unit,
                              additionalFields: [],
                            },
                          ],
                        },
                        touched: {},
                        errors: {},
                      });
                    }}
                  />

                  {includeSizeChart && (
                    <div className="flex gap-4">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="wearType"
                          value="topwear"
                          checked={wearType === "topwear"}
                          onChange={() => {
                            setWearType("topwear");
                            setFieldValue("wearType", "topwear");
                            // Reset to initial topwear values
                            setFieldValue("topwearSizes", [
                              {
                                size: "",
                                additionalFields: [
                                  { label: "Front Length", value: "" },
                                  { label: "Across Shoulder", value: "" },
                                ],
                              },
                            ]);
                            // Reset validation state
                            resetForm({
                              values: {
                                ...values,
                                wearType: "topwear",
                                topwearSizes: [
                                  {
                                    size: "",
                                    additionalFields: [
                                      { label: "Front Length", value: "" },
                                      { label: "Across Shoulder", value: "" },
                                    ],
                                  },
                                ],
                              },
                              touched: {},
                              errors: {},
                            });
                          }}
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        />
                        <span>Top wear</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="wearType"
                          value="bottomwear"
                          checked={wearType === "bottomwear"}
                          onChange={() => {
                            setWearType("bottomwear");
                            setFieldValue("wearType", "bottomwear");
                            // Reset to initial bottomwear values
                            setFieldValue("bottomwearSizes", [
                              {
                                size: "",
                                additionalFields: [
                                  { label: "To Fit Waist", value: "" },
                                  { label: "Inseam Length", value: "" },
                                  { label: "Thigh", value: "" },
                                  { label: "Rise", value: "" },
                                  { label: "Outseam Leagth", value: "" },
                                  { label: "Hips", value: "" },
                                ],
                              },
                            ]);
                            // Reset validation state
                            resetForm({
                              values: {
                                ...values,
                                wearType: "bottomwear",
                                bottomwearSizes: [
                                  {
                                    size: "",
                                    additionalFields: [
                                      { label: "To Fit Waist", value: "" },
                                      { label: "Inseam Length", value: "" },
                                      { label: "Thigh", value: "" },
                                      { label: "Rise", value: "" },
                                      { label: "Outseam Leagth", value: "" },
                                      { label: "Hips", value: "" },
                                    ],
                                  },
                                ],
                              },
                              touched: {},
                              errors: {},
                            });
                          }}
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        />
                        <span>Bottom wear</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="wearType"
                          value="footwear"
                          checked={wearType === "footwear"}
                          onChange={() => {
                            setWearType("footwear");
                            setFieldValue("wearType", "footwear");
                            // Reset to initial footwear values
                            setFieldValue("footwearSizes", [
                              {
                                size: "",
                                ukSize: "",
                                usSize: "",
                                euroSize: "",
                                actualSize: "",
                                unit: unit,
                                additionalFields: [],
                              },
                            ]);
                            // Reset validation state
                            resetForm({
                              values: {
                                ...values,
                                wearType: "footwear",
                                footwearSizes: [
                                  {
                                    size: "",
                                    ukSize: "",
                                    usSize: "",
                                    euroSize: "",
                                    actualSize: "",
                                    unit: unit,
                                    additionalFields: [],
                                  },
                                ],
                              },
                              touched: {},
                              errors: {},
                            });
                          }}
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        />
                        <span>Footwear</span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="relative mt-4">
                  <div className="max-h-[300px] overflow-y-auto rounded-md bg-[#fafafa] pr-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:bg-transparent [&::-webkit-scrollbar]:hover:block">
                    {wearType === "footwear" ? (
                      <FieldArray name="footwearSizes">
                        {({ push, remove }) => (
                          <div className="space-y-4 p-4">
                            <div className="mb-2 flex items-center justify-end">
                              <SwitchButton
                                enabled={unit === "cm"}
                                leftText="in"
                                rightText="cm"
                                showColor={false}
                                onChange={(enabled) => {
                                  const newUnit = enabled ? "cm" : "inch";
                                  setUnit(newUnit);
                                  values.footwearSizes.forEach((_, index) => {
                                    setFieldValue(
                                      `footwearSizes.${index}.unit`,
                                      newUnit,
                                    );
                                  });
                                }}
                              />
                            </div>
                            {values.footwearSizes.map((size, index) => (
                              <div
                                key={index}
                                className="rounded-lg border border-gray-200 bg-white p-4"
                              >
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                      UK Size
                                    </label>
                                    <Field
                                      name={`footwearSizes.${index}.ukSize`}
                                      placeholder="Enter UK Size"
                                      type="text"
                                      className="w-full rounded-md border border-gray-300 p-2"
                                    />
                                    <ErrorMessage
                                      name={`footwearSizes.${index}.ukSize`}
                                      component="div"
                                      className="mt-1 text-sm text-red-600"
                                    />
                                  </div>
                                  <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                      US Size
                                    </label>
                                    <Field
                                      name={`footwearSizes.${index}.usSize`}
                                      placeholder="Enter US Size"
                                      className="w-full rounded-md border border-gray-300 p-2"
                                      type="text"
                                    />
                                    <ErrorMessage
                                      name={`footwearSizes.${index}.usSize`}
                                      component="div"
                                      className="mt-1 text-sm text-red-600"
                                    />
                                  </div>
                                  <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                      EURO Size
                                    </label>
                                    <Field
                                      name={`footwearSizes.${index}.euroSize`}
                                      type="text"
                                      placeholder="Enter EURO Size"
                                      className="w-full rounded-md border border-gray-300 p-2"
                                    />
                                    <ErrorMessage
                                      name={`footwearSizes.${index}.euroSize`}
                                      component="div"
                                      className="mt-1 text-sm text-red-600"
                                    />
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <label className="mb-1 block text-sm font-medium text-gray-700">
                                    To Fit Foot Length ({unit})
                                  </label>
                                  <Field
                                    name={`footwearSizes.${index}.actualSize`}
                                    type="text"
                                    placeholder={`Enter Actual Size in ${unit}`}
                                    className="w-full rounded-md border border-gray-300 p-2"
                                  />
                                  <ErrorMessage
                                    name={`footwearSizes.${index}.actualSize`}
                                    component="div"
                                    className="mt-1 text-sm text-red-600"
                                  />
                                </div>

                                <FieldArray
                                  name={`footwearSizes.${index}.additionalFields`}
                                >
                                  {({
                                    push: pushField,
                                    remove: removeField,
                                  }) => (
                                    <>
                                      <div className="mt-4 grid grid-cols-1 gap-4">
                                        {size.additionalFields?.map(
                                          (field, fieldIndex) => (
                                            <div
                                              key={fieldIndex}
                                              className="flex items-start gap-2"
                                            >
                                              <div className="flex-1">
                                                <Field
                                                  name={`footwearSizes.${index}.additionalFields.${fieldIndex}.label`}
                                                  type="text"
                                                  placeholder="Field Label"
                                                  className="w-full rounded-md border border-gray-300 p-2"
                                                  onChange={(
                                                    e: React.ChangeEvent<HTMLInputElement>,
                                                  ) => {
                                                    // Update the label for all size entries
                                                    values.footwearSizes.forEach(
                                                      (_, sizeIndex) => {
                                                        setFieldValue(
                                                          `footwearSizes.${sizeIndex}.additionalFields.${fieldIndex}.label`,
                                                          e.target.value,
                                                        );
                                                      },
                                                    );
                                                  }}
                                                />
                                                <ErrorMessage
                                                  name={`footwearSizes.${index}.additionalFields.${fieldIndex}.label`}
                                                  component="div"
                                                  className="mt-1 text-sm text-red-600"
                                                />
                                              </div>
                                              <div className="flex-1">
                                                <Field
                                                  name={`footwearSizes.${index}.additionalFields.${fieldIndex}.value`}
                                                  type="text"
                                                  placeholder={`Enter value in ${unit}`}
                                                  className="w-full rounded-md border border-gray-300 p-2"
                                                />
                                                <ErrorMessage
                                                  name={`footwearSizes.${index}.additionalFields.${fieldIndex}.value`}
                                                  component="div"
                                                  className="mt-1 text-sm text-red-600"
                                                />
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  // Remove field from all size entries
                                                  values.footwearSizes.forEach(
                                                    (_, sizeIndex) => {
                                                      const updatedFields =
                                                        values.footwearSizes[
                                                          sizeIndex
                                                        ].additionalFields.filter(
                                                          (_, idx) =>
                                                            idx !== fieldIndex,
                                                        );
                                                      setFieldValue(
                                                        `footwearSizes.${sizeIndex}.additionalFields`,
                                                        updatedFields,
                                                      );
                                                    },
                                                  );
                                                }}
                                                className="rounded-md bg-red-600 px-3 py-[9px] text-sm text-white hover:bg-red-700"
                                              >
                                                Remove
                                              </button>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          // Add field to all size entries
                                          const newField = {
                                            label: "",
                                            value: "",
                                          };
                                          values.footwearSizes.forEach(
                                            (_, sizeIndex) => {
                                              setFieldValue(
                                                `footwearSizes.${sizeIndex}.additionalFields`,
                                                [
                                                  ...(values.footwearSizes[
                                                    sizeIndex
                                                  ].additionalFields || []),
                                                  newField,
                                                ],
                                              );
                                            },
                                          );
                                        }}
                                        className="mt-2 rounded-md bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700"
                                      >
                                        Add More Fields
                                      </button>
                                    </>
                                  )}
                                </FieldArray>

                                {values.footwearSizes.length > 1 && (
                                  <div className="mt-4 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => remove(index)}
                                      className="rounded-md bg-red-600 px-3 py-[9px] text-sm text-white hover:bg-red-700"
                                    >
                                      Remove Size
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                // Get the current custom fields from the first size entry
                                const currentFields = (values.footwearSizes[0]
                                  ?.additionalFields ||
                                  []) as AdditionalField[];
                                // Add new size with all existing custom fields
                                push({
                                  size: "",
                                  ukSize: "",
                                  usSize: "",
                                  euroSize: "",
                                  actualSize: "",
                                  unit: unit,
                                  additionalFields: currentFields.map(
                                    (field) => ({
                                      label: field.label || "",
                                      value: field.value || "",
                                    }),
                                  ),
                                });
                              }}
                              className="mt-2 w-full rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                            >
                              Add More Size
                            </button>
                          </div>
                        )}
                      </FieldArray>
                    ) : wearType === "bottomwear" ? (
                      <FieldArray name="bottomwearSizes">
                        {({ push, remove }) => (
                          <div className="space-y-4 p-4">
                            <div className="mb-2 flex items-center justify-end">
                              <SwitchButton
                                enabled={unit === "cm"}
                                leftText="in"
                                rightText="cm"
                                showColor={false}
                                onChange={(enabled) => {
                                  const newUnit = enabled ? "cm" : "inch";
                                  setUnit(newUnit);
                                  values.bottomwearSizes.forEach((_, index) => {
                                    setFieldValue(
                                      `bottomwearSizes.${index}.unit`,
                                      newUnit,
                                    );
                                  });
                                }}
                              />
                            </div>
                            {values.bottomwearSizes?.map((size, index) => (
                              <div
                                key={index}
                                className="rounded-lg border border-gray-200 bg-white p-4"
                              >
                                <div className="grid grid-cols-1 gap-4">
                                  <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                      Size
                                    </label>
                                    <Field
                                      name={`bottomwearSizes.${index}.size`}
                                      type="text"
                                      placeholder="Enter Size i.e. 32"
                                      className="w-full rounded-md border border-gray-300 p-2"
                                    />
                                    <ErrorMessage
                                      name={`bottomwearSizes.${index}.size`}
                                      component="div"
                                      className="mt-1 text-sm text-red-600"
                                    />
                                  </div>
                                </div>
                                <FieldArray
                                  name={`bottomwearSizes.${index}.additionalFields`}
                                >
                                  {({
                                    push: pushField,
                                    remove: removeField,
                                  }) => (
                                    <>
                                      <div className="mt-4 grid grid-cols-1 gap-4">
                                        {size.additionalFields?.map(
                                          (field, fieldIndex) => (
                                            <div
                                              key={fieldIndex}
                                              className="flex items-start gap-2"
                                            >
                                              <div className="flex-1">
                                                <Field
                                                  name={`bottomwearSizes.${index}.additionalFields.${fieldIndex}.label`}
                                                  type="text"
                                                  placeholder="Field Label"
                                                  className="w-full rounded-md border border-gray-300 p-2"
                                                  onChange={(
                                                    e: React.ChangeEvent<HTMLInputElement>,
                                                  ) => {
                                                    // Update the label for all size entries
                                                    values.bottomwearSizes.forEach(
                                                      (_, sizeIndex) => {
                                                        setFieldValue(
                                                          `bottomwearSizes.${sizeIndex}.additionalFields.${fieldIndex}.label`,
                                                          e.target.value,
                                                        );
                                                      },
                                                    );
                                                  }}
                                                />
                                                <ErrorMessage
                                                  name={`bottomwearSizes.${index}.additionalFields.${fieldIndex}.label`}
                                                  component="div"
                                                  className="mt-1 text-sm text-red-600"
                                                />
                                              </div>
                                              <div className="flex-1">
                                                <Field
                                                  name={`bottomwearSizes.${index}.additionalFields.${fieldIndex}.value`}
                                                  type="text"
                                                  placeholder={`Enter value in ${unit}`}
                                                  className="w-full rounded-md border border-gray-300 p-2"
                                                />
                                                <ErrorMessage
                                                  name={`bottomwearSizes.${index}.additionalFields.${fieldIndex}.value`}
                                                  component="div"
                                                  className="mt-1 text-sm text-red-600"
                                                />
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  // Remove field from all size entries
                                                  values.bottomwearSizes.forEach(
                                                    (_, sizeIndex) => {
                                                      const updatedFields =
                                                        values.bottomwearSizes[
                                                          sizeIndex
                                                        ].additionalFields.filter(
                                                          (_, idx) =>
                                                            idx !== fieldIndex,
                                                        );
                                                      setFieldValue(
                                                        `bottomwearSizes.${sizeIndex}.additionalFields`,
                                                        updatedFields,
                                                      );
                                                    },
                                                  );
                                                }}
                                                className="rounded-md bg-red-600 px-3 py-[9px] text-sm text-white hover:bg-red-700"
                                              >
                                                Remove
                                              </button>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          // Add field to all size entries
                                          const newField = {
                                            label: "",
                                            value: "",
                                          };
                                          values.bottomwearSizes.forEach(
                                            (_, sizeIndex) => {
                                              setFieldValue(
                                                `bottomwearSizes.${sizeIndex}.additionalFields`,
                                                [
                                                  ...(values.bottomwearSizes[
                                                    sizeIndex
                                                  ].additionalFields || []),
                                                  newField,
                                                ],
                                              );
                                            },
                                          );
                                        }}
                                        className="mt-2 rounded-md bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700"
                                      >
                                        Add More Fields
                                      </button>
                                    </>
                                  )}
                                </FieldArray>
                                {values.bottomwearSizes.length > 1 && (
                                  <div className="mt-4 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => remove(index)}
                                      className="rounded-md bg-red-600 px-3 py-[9px] text-sm text-white hover:bg-red-700"
                                    >
                                      Remove Size
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                // Get the current custom fields from the first size entry
                                const currentFields = (values.bottomwearSizes[0]
                                  ?.additionalFields ||
                                  []) as AdditionalField[];
                                // Add new size with all existing custom fields
                                push({
                                  size: "",
                                  additionalFields: currentFields.map(
                                    (field) => ({
                                      label: field.label || "",
                                      value: field.value || "",
                                    }),
                                  ),
                                });
                              }}
                              className="mt-2 w-full rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                            >
                              Add More Size
                            </button>
                          </div>
                        )}
                      </FieldArray>
                    ) : wearType === "topwear" ? (
                      <FieldArray name="topwearSizes">
                        {({ push, remove }) => (
                          <div className="space-y-4 p-4">
                            <div className="mb-2 flex items-center justify-end">
                              <SwitchButton
                                enabled={unit === "cm"}
                                leftText="in"
                                rightText="cm"
                                showColor={false}
                                onChange={(enabled) => {
                                  const newUnit = enabled ? "cm" : "inch";
                                  setUnit(newUnit);
                                  values.topwearSizes.forEach((_, index) => {
                                    setFieldValue(
                                      `topwearSizes.${index}.unit`,
                                      newUnit,
                                    );
                                  });
                                }}
                              />
                            </div>
                            {values.topwearSizes.map((size, index) => (
                              <div
                                key={index}
                                className="rounded-lg border border-gray-200 bg-white p-4"
                              >
                                <div className="grid grid-cols-1 gap-4">
                                  <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                      Size
                                    </label>
                                    <Field
                                      name={`topwearSizes.${index}.size`}
                                      type="text"
                                      placeholder="Enter Size i.e. S, M, L, XL"
                                      className="w-full rounded-md border border-gray-300 p-2"
                                    />
                                    <ErrorMessage
                                      name={`topwearSizes.${index}.size`}
                                      component="div"
                                      className="mt-1 text-sm text-red-600"
                                    />
                                  </div>
                                </div>

                                <FieldArray
                                  name={`topwearSizes.${index}.additionalFields`}
                                >
                                  {({
                                    push: pushField,
                                    remove: removeField,
                                  }) => (
                                    <>
                                      <div className="mt-4 grid grid-cols-1 gap-4">
                                        {size.additionalFields?.map(
                                          (field, fieldIndex) => (
                                            <div
                                              key={fieldIndex}
                                              className="flex items-start gap-2"
                                            >
                                              <div className="flex-1">
                                                <Field
                                                  name={`topwearSizes.${index}.additionalFields.${fieldIndex}.label`}
                                                  type="text"
                                                  placeholder="Field Label"
                                                  className="w-full rounded-md border border-gray-300 p-2"
                                                  onChange={(
                                                    e: React.ChangeEvent<HTMLInputElement>,
                                                  ) => {
                                                    // Update the label for all size entries
                                                    values.topwearSizes.forEach(
                                                      (_, sizeIndex) => {
                                                        setFieldValue(
                                                          `topwearSizes.${sizeIndex}.additionalFields.${fieldIndex}.label`,
                                                          e.target.value,
                                                        );
                                                      },
                                                    );
                                                  }}
                                                />
                                                <ErrorMessage
                                                  name={`topwearSizes.${index}.additionalFields.${fieldIndex}.label`}
                                                  component="div"
                                                  className="mt-1 text-sm text-red-600"
                                                />
                                              </div>
                                              <div className="flex-1">
                                                <Field
                                                  name={`topwearSizes.${index}.additionalFields.${fieldIndex}.value`}
                                                  type="text"
                                                  placeholder={`Enter value in ${unit}`}
                                                  className="w-full rounded-md border border-gray-300 p-2"
                                                />
                                                <ErrorMessage
                                                  name={`topwearSizes.${index}.additionalFields.${fieldIndex}.value`}
                                                  component="div"
                                                  className="mt-1 text-sm text-red-600"
                                                />
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  // Remove field from all size entries
                                                  values.topwearSizes.forEach(
                                                    (_, sizeIndex) => {
                                                      const updatedFields =
                                                        values.topwearSizes[
                                                          sizeIndex
                                                        ].additionalFields.filter(
                                                          (_, idx) =>
                                                            idx !== fieldIndex,
                                                        );
                                                      setFieldValue(
                                                        `topwearSizes.${sizeIndex}.additionalFields`,
                                                        updatedFields,
                                                      );
                                                    },
                                                  );
                                                }}
                                                className="rounded-md bg-red-600 px-3 py-[9px] text-sm text-white hover:bg-red-700"
                                              >
                                                Remove
                                              </button>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          // Add field to all size entries
                                          const newField = {
                                            label: "",
                                            value: "",
                                          };
                                          values.topwearSizes.forEach(
                                            (_, sizeIndex) => {
                                              setFieldValue(
                                                `topwearSizes.${sizeIndex}.additionalFields`,
                                                [
                                                  ...(values.topwearSizes[
                                                    sizeIndex
                                                  ].additionalFields || []),
                                                  newField,
                                                ],
                                              );
                                            },
                                          );
                                        }}
                                        className="mt-2 rounded-md bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700"
                                      >
                                        Add More Fields
                                      </button>
                                    </>
                                  )}
                                </FieldArray>

                                {values.topwearSizes.length > 1 && (
                                  <div className="mt-4 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => remove(index)}
                                      className="rounded-md bg-red-600 px-3 py-[9px] text-sm text-white hover:bg-red-700"
                                    >
                                      Remove Size
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                // Get the current custom fields from the first size entry
                                const currentFields = (values.topwearSizes[0]
                                  ?.additionalFields ||
                                  []) as AdditionalField[];
                                // Add new size with all existing custom fields
                                push({
                                  size: "",
                                  additionalFields: currentFields.map(
                                    (field) => ({
                                      label: field.label || "",
                                      value: field.value || "",
                                    }),
                                  ),
                                });
                              }}
                              className="mt-2 w-full rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                            >
                              Add More Size
                            </button>
                          </div>
                        )}
                      </FieldArray>
                    ) : (
                      <FieldArray name="sizes">
                        {({ push, remove }) => (
                          <div className="space-y-4 p-4">
                            {values.sizes.map((_, index) => (
                              <div
                                key={index}
                                className="rounded-lg border border-gray-200 p-4"
                              >
                                {/* <div className="mb-2 flex items-center justify-between">
                                  <h3 className="text-lg font-medium">
                                    Size #{index + 1}
                                  </h3>
                                </div> */}
                                <div className="flex w-full gap-2">
                                  <div className="w-full">
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                      Size Value ({"no. " + (index + 1)})
                                    </label>
                                    <div className="flex gap-2">
                                      <Field
                                        name={`sizes.${index}`}
                                        type="text"
                                        placeholder="Enter Size (i.e. S, M, L, XL, XXL)"
                                        className="w-full rounded-md border border-gray-300 p-2"
                                      />
                                      {values.sizes.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => remove(index)}
                                          className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                                        >
                                          Remove
                                        </button>
                                      )}
                                    </div>

                                    <ErrorMessage
                                      name={`sizes.${index}`}
                                      component="div"
                                      className="mt-1 text-sm text-red-600"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => push("")}
                              className="mt-2 w-full rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                            >
                              Add More Size
                            </button>
                          </div>
                        )}
                      </FieldArray>
                    )}

                    {errors.sizes && typeof errors.sizes === "string" && (
                      <div className="text-sm text-red-600">{errors.sizes}</div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !!nameError}
                  className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SizeDialog;
