"use client";
import { useEffect, useState, type PropsWithChildren } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { RootState } from "@/store";
import { removeAuthToken } from "@/store/slice/auth.slice";
import { ApiResponse, UserAttr } from "@/types/interface";
import apiService from "@/services/base.services";
import { CentralLoader } from "../Loader";
import { addUserProfileData } from "@/store/slice/users.slice";

const Layout = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!auth.token) {
      router.push("/auth/login");
      dispatch(removeAuthToken());
    }
  }, [auth]);

  const getProfileDetails = async () => {
    try {
      setIsLoading(true);
      const response: {
        data: ApiResponse<UserAttr>;
        status: number;
      } = await apiService.get(`/show-profile`, {
        withAuth: true,
      });
      const { data } = response.data;
      if (response?.status === 200) {
        const userInfo = {
          email: data.email,
          first_name: data.first_name ? data.first_name : "",
          last_name: data.last_name ? data.last_name : "",
          mobile: data.mobile ? data.mobile : "",
          birth_date: data.birth_date ? data.birth_date : "",
          gender_id: data.gender_id ? data.gender_id.toString() : "1",
          profile_url: data.profile_url ? data.profile_url : "",
        };
        dispatch(addUserProfileData(userInfo));
      }
    } catch (error: any) {
      if (!error.success) {
        toast.error(error.message);
        return;
      }
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProfileDetails();
  }, [dispatch]);
  return (
    <div className="flex max-h-screen min-h-screen overflow-x-hidden">
      <Sidebar />
      <CentralLoader loading={isLoading} />
      <div className="w-full flex-1 !overflow-x-auto bg-gray-2 dark:bg-[#020d1a]">
        <Header />

        <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
