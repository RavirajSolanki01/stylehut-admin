"use client";
import {
  CallIcon,
  EmailIcon,
  GenderIcon,
  UploadIcon,
  UserIcon,
} from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { useFormik } from "formik";

import { useEffect, useState } from "react";
import DatePickerOne from "@/components/FormElements/DatePicker/DatePickerOne";
import { Select } from "@/components/FormElements/select";
import { profileValidation } from "@/utils/schema";
import apiService from "@/services/base.services";
import { toast } from "react-toastify";
import { CentralLoader, SmallLoader } from "@/components/Loader";
import { UserProfilePayload, UserAttr, ApiResponse } from "@/types/interface";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { updateProfileData } from "@/store/slice/users.slice";
import Layout from "@/components/Layouts";

const MAX_FILE_SIZE_MB = 2;
const ALLOWED_TYPES = ["image/png", "image/jpeg"];

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNo: "",
  birthDate: "",
  gender: "",
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.users.userData);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUploadError, setFileUploadError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const userInfo = {
      email: user.email,
      firstName: user.first_name ? user.first_name : "",
      lastName: user.last_name ? user.last_name : "",
      phoneNo: user.mobile ? user.mobile : "",
      birthDate: user.birth_date ? user.birth_date : "",
      gender: user.gender_id ? user.gender_id.toString() : "1",
    };

    setValues(userInfo);
    setUploadedFileUrl(user.profile_url ? user.profile_url : null);
  }, [user]);

  const {
    handleChange,
    handleBlur,
    handleSubmit,
    errors,
    touched,
    values,
    isValid,
    setFieldValue,
    dirty,
    setValues,
    setErrors,
    setTouched,
  } = useFormik({
    initialValues: initialValues,
    validationSchema: profileValidation,
    onSubmit: (values) => {
      const payload: UserProfilePayload = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        mobile: values.phoneNo,
        birth_date: values.birthDate,
        gender_id: values.gender,
      };
      updateProfile(payload);
    },
  });

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileUploadError("Invalid file type. Only PNG or JPEG allowed");
      return false;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      setFileUploadError(
        `File is too large. Max size is ${MAX_FILE_SIZE_MB}MB`,
      );
      return false;
    }

    setFileUploadError("");
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setUploadedFile(file);
      setUploadedFileUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setUploadedFile(file);
      setUploadedFileUrl(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleCancelClick = () => {
    setValues({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phoneNo: user.mobile,
      birthDate: user.birth_date,
      gender: user.gender_id,
    });
    setErrors({});
    setTouched({});
  };

  const handleImgCancelClick = () => {
    setFileUploadError("");
    setUploadedFile(null);
    setUploadedFileUrl(user.profile_url ? user.profile_url : null);
  };

  const updateProfile = async (payload: UserProfilePayload) => {
    try {
      setIsLoading(true);
      const response: {
        data: ApiResponse<UserAttr>;
        status: number;
      } = await apiService.patch("/update-profile", payload, {
        withAuth: true,
      });

      if (response?.status === 200) {
        const { data } = response.data;
        toast.success("User profile updated successfully");
        const userInfo = {
          email: data.email,
          first_name: data.first_name ? data.first_name : "",
          last_name: data.last_name ? data.last_name : "",
          mobile: data.mobile ? data.mobile : "",
          birth_date: data.birth_date ? data.birth_date : "",
          gender_id: data.gender_id ? data.gender_id.toString() : "1",
        };
        dispatch(updateProfileData(userInfo));
      }
    } catch (error: any) {
      console.log("Error updating user profile:", error?.message || error);
      if (!error.success) {
        toast.error(error.message);
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileImg = async () => {
    try {
      const formData = new FormData();
      if (uploadedFile) formData.append("profileImg", uploadedFile);

      setIsLoading(true);
      const response: {
        data: ApiResponse<UserAttr>;
        status: number;
      } = await apiService.put("/update-profile-img", formData, {
        withAuth: true,
      });

      if (response?.status === 200) {
        toast.success("User profile updated successfully");
        setUploadedFile(null);
        setUploadedFileUrl("");
        const { data } = response.data;
        dispatch(
          updateProfileData({ ...user, profile_url: data.profile_url ?? "" }),
        );
      }
    } catch (error: any) {
      console.log("Error updating user profile:", error?.message || error);
      if (!error.success) {
        toast.error(error.message);
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <CentralLoader loading={isLoading} />
      <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
        <div className="mx-auto w-full max-w-[1080px]">
          <div className="mb-6 flex w-full items-center justify-between">
            <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
              Settings
            </h2>
          </div>

          <div className="space-y-10">
            <div className="grid grid-cols-5 gap-8">
              <div className="col-span-5 xl:col-span-3">
                <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
                  <h2 className="border-stock border-b px-4 py-4 font-medium dark:border-dark-3 sm:px-6 xl:px-7.5">
                    Personal Information
                  </h2>
                  <div className="px-7 py-7">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-5.5 flex flex-col gap-5 sm:flex-row">
                        <InputGroup
                          label="First Name"
                          type="text"
                          name="firstName"
                          value={values.firstName}
                          handleChange={handleChange}
                          handleBlur={handleBlur}
                          placeholder="Enter your first name"
                          required
                          className="w-full"
                          icon={<UserIcon />}
                          iconPosition="left"
                          error={
                            touched.firstName && errors.firstName
                              ? errors.firstName
                              : ""
                          }
                        />
                        <InputGroup
                          label="Lats Name"
                          name="lastName"
                          value={values.lastName}
                          type="text"
                          placeholder="Enter your last name"
                          required
                          className="w-full"
                          handleChange={handleChange}
                          handleBlur={handleBlur}
                          icon={<UserIcon />}
                          iconPosition="left"
                          error={
                            touched.lastName && errors.lastName
                              ? errors.lastName
                              : ""
                          }
                        />
                      </div>
                      <DatePickerOne
                        label="BirthDate "
                        required
                        className="mb-5.5 w-full"
                        name="birthBate"
                        value={values.birthDate}
                        maxDate={new Date()}
                        onChange={(date: string) =>
                          setFieldValue("birthDate", date)
                        }
                        onBlur={handleBlur}
                        error={
                          touched.birthDate && errors.birthDate
                            ? errors.birthDate
                            : ""
                        }
                      />
                      <InputGroup
                        label="Phone No."
                        type="text"
                        name="phoneNo"
                        value={values.phoneNo}
                        placeholder="Enter your phone number"
                        className="mb-5.5 w-full"
                        required
                        icon={<CallIcon />}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        iconPosition="left"
                        error={
                          touched.phoneNo && errors.phoneNo
                            ? errors.phoneNo
                            : ""
                        }
                        isNumeric
                      />
                      <InputGroup
                        label="Email Address"
                        type="email"
                        className="mb-5.5 w-full"
                        placeholder="Enter your email address"
                        required
                        disabled
                        name="email"
                        value={values.email}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        icon={<EmailIcon />}
                        iconPosition="left"
                        error={
                          touched.email && errors.email ? errors.email : ""
                        }
                      />
                      <Select
                        label="Gender"
                        items={[
                          { label: "Male", value: "1" },
                          { label: "Female", value: "2" },
                        ]}
                        prefixIcon={<GenderIcon />}
                        defaultValue="1"
                        className="mb-5.5"
                        required
                        placeholder="Select gender"
                        name={"gender"}
                        value={values.gender}
                        onChange={(event) =>
                          setFieldValue("gender", event?.target.value)
                        }
                      />
                      <div className="flex h-[40px] justify-end gap-3">
                        <button
                          type="reset"
                          onClick={handleCancelClick}
                          className="button rounded-lg border border-stroke bg-white px-6 py-[7px] font-medium !text-dark hover:shadow-1"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={!(isValid && dirty)}
                          type="submit"
                          className={`cursor-pointer rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 ${!(isValid && dirty) ? "bg-opacity-70" : "hover:bg-opacity-90"}`}
                        >
                          Save <SmallLoader loading={isLoading} />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="col-span-5 xl:col-span-2">
                <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
                  <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
                    <h2 className="border-stock border-b px-4 py-4 font-medium dark:border-dark-3 sm:px-6 xl:px-7.5">
                      Your Photo
                    </h2>
                    <div className="px-7 py-7">
                      <div className="mb-4 flex items-center gap-3">
                        <img
                          src={
                            uploadedFileUrl
                              ? uploadedFileUrl
                              : "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
                          }
                          className="size-14 h-[55px] w-[55px] rounded-full object-cover"
                        />
                        <div className="flex flex-col">
                          <div className="font-medium text-dark dark:text-white">
                            Edit your photo
                          </div>
                        </div>
                      </div>
                      <div
                        className="relative mb-2 block w-full rounded-xl border border-dashed border-gray-4 bg-gray-2 hover:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                      >
                        <label
                          htmlFor="file-upload"
                          className="flex cursor-pointer flex-col items-center justify-center p-4 sm:py-7.5"
                        >
                          <div className="flex size-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
                            <UploadIcon />
                          </div>
                          <div className="flex flex-col items-center justify-center">
                            <div>
                              <span className="text-sm font-medium text-primary">
                                Click to upload
                              </span>
                              <span className="text-stork text-sm font-semibold">
                                {" "}
                                or drag and drop
                              </span>
                            </div>
                            <p className="mt-1 text-body-xs">
                              PNG, JPG (max size 5MB)
                            </p>
                          </div>
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      {fileUploadError && (
                        <p className="mb-5.5 text-xs text-red">
                          {fileUploadError}
                        </p>
                      )}
                      <div className="flex h-[40px] justify-end gap-3">
                        <button
                          onClick={handleImgCancelClick}
                          className="rounded-lg border border-stroke bg-white px-6 py-[7px] font-medium !text-dark hover:shadow-1"
                        >
                          Cancel
                        </button>

                        <button
                          className={`rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 ${uploadedFile === null ? "bg-opacity-70" : "hover:bg-opacity-90"}`}
                          disabled={uploadedFile === null}
                          onClick={updateProfileImg}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default ProfilePage;
