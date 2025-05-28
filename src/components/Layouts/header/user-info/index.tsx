"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { cn } from "@/lib/utils";
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";
import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import CommonDialog from "@/components/Dialog/CommonDialog";
import { removeAuthToken } from "@/store/slice/auth.slice";
import { RootState } from "@/store";

export function UserInfo() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.users.userData);
  const [isOpen, setIsOpen] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLogOutConfirm = () => {
    document.body.style.removeProperty("pointer-events");
    setIsOpen(false);
    setIsDialogOpen(false);
    dispatch(removeAuthToken());
    router.push("auth/login");
  };

  return (
    <>
      <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
        <DropdownTrigger className="rounded align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-1 dark:ring-offset-gray-dark">
          <span className="sr-only">My Account</span>

          <figure className="flex items-center gap-3">
            {user?.profile_url ? (
              <Image
                src={user?.profile_url}
                className="size-12 rounded-full border border-gray-5"
                alt={`Avatar of ${user?.first_name} ${user?.last_name}`}
                role="presentation"
                width={200}
                height={200}
              />
            ) : (
              <Image
                src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
                className="size-12 rounded-full border border-gray-5"
                alt={`Avatar of ${user?.first_name} ${user?.last_name}`}
                role="presentation"
                width={200}
                height={200}
              />
            )}
            <figcaption className="flex items-center gap-1 font-medium text-dark dark:text-dark-6 max-[1024px]:sr-only">
              <span>
                {user?.first_name} {user?.last_name}
              </span>

              <ChevronUpIcon
                aria-hidden
                className={cn(
                  "rotate-180 transition-transform",
                  isOpen && "rotate-0",
                )}
                strokeWidth={1.5}
              />
            </figcaption>
          </figure>
        </DropdownTrigger>

        <DropdownContent
          className="border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark min-[230px]:min-w-[17.5rem]"
          align="end"
        >
          <h2 className="sr-only">User information</h2>

          <figure className="flex items-center gap-2.5 px-5 py-3.5">
          {user?.profile_url ? (
              <Image
                src={user?.profile_url}
                className="size-12 rounded-full border border-gray-5"
                alt={`Avatar of ${user?.first_name} ${user?.last_name}`}
                role="presentation"
                width={200}
                height={200}
              />
            ) : (
              <Image
                src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
                className="size-12 rounded-full border border-gray-5"
                alt={`Avatar of ${user?.first_name} ${user?.last_name}`}
                role="presentation"
                width={200}
                height={200}
              />
            )}

            <figcaption className="space-y-1 text-base font-medium">
              {user?.first_name&&<div className="mb-2 leading-none text-dark dark:text-white">
                {user?.first_name} {user?.last_name}
              </div>}

              <div className="break-all leading-none text-gray-6">
                {user?.email}
              </div>
            </figcaption>
          </figure>

          <hr className="border-[#E8E8E8] dark:border-dark-3" />

          <div className="p-2 text-base text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer">
            <Link
              href={"/profile"}
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
            >
              <UserIcon />

              <span className="mr-auto text-base font-medium">
                View profile
              </span>
            </Link>

            <Link
              href={"/pages/settings"}
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
            >
              <SettingsIcon />

              <span className="mr-auto text-base font-medium">
                Account Settings
              </span>
            </Link>
          </div>

          <hr className="border-[#E8E8E8] dark:border-dark-3" />

          <div className="p-2 text-base text-[#4B5563] dark:text-dark-6">
            <button
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
              onClick={() => setIsDialogOpen(true)}
            >
              <LogOutIcon />

              <span className="text-base font-medium">Log out</span>
            </button>
          </div>
        </DropdownContent>
        <CommonDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onConfirm={handleLogOutConfirm}
          confirmLabel="Logout"
          description="Are you sure you want to logout?"
          title="Logout"
        />
      </Dropdown>
    </>
  );
}
