"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { NAV_DATA } from "./data";
import { ArrowLeftIcon, ChevronUp } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

import * as Icons from "./icons";

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string | null>(null);

  const isPathMatch = (itemUrl: string) => {
    return pathname === itemUrl || pathname.startsWith(`${itemUrl}/`);
  };

  useEffect(() => {
    NAV_DATA.some((section) => {
      return section.items.some((item) => {
        if (isPathMatch(item.url)) {
          if (expandedItems !== section.label) {
            setExpandedItems(section.label);
          }
          return true;
        }
      });
    });
  }, [pathname]);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => (prev === label ? null : label));
  };

  const auth = useSelector((state: RootState) => state.auth);

  const isSuperAdmin = auth.role === "SuperAdmin";

  const navData = NAV_DATA.map((section) => {
    const newSection = { ...section };
    newSection.items = [...section.items];

    if (isSuperAdmin && section.label === "User Management") {
      newSection.items.push({
        icon: Icons.PendingRequestIcon,
        items: [],
        title: "Pending Requests",
        url: "/pending-admin-requests",
      });
    }

    return newSection;
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "min-w-[290px] max-w-[290px] overflow-hidden border-r border-gray-200 bg-white transition-[width] duration-200 ease-linear dark:border-gray-800 dark:bg-gray-dark",
          isMobile ? "fixed bottom-0 top-0 z-50" : "sticky top-0 h-screen",
          isOpen ? "w-full" : "w-0 min-w-0",
        )}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="flex h-full flex-col py-10 pl-[25px] pr-[7px]">
          {/* Logo + Close Button */}
          <div className="relative pr-4.5">
            <Link
              href="/"
              onClick={() => isMobile && toggleSidebar()}
              className="px-0 py-2.5 min-[850px]:py-0"
            >
              <Logo />
            </Link>

            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="absolute left-3/4 right-4.5 top-1/2 -translate-y-1/2 text-right"
              >
                <span className="sr-only">Close Menu</span>
                <ArrowLeftIcon className="ml-auto size-7" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="custom-scrollbar mt-6 flex-1 overflow-y-auto pr-3 min-[850px]:mt-10">
            {navData.map((section) => (
              <div
                key={section.label}
                onClick={() => toggleExpanded(section.label)}
                className={cn(
                  "section-header mb-2 w-full cursor-pointer px-3 py-2",
                  expandedItems !== section.label &&
                    section.items.some((item) => isPathMatch(item.url)) &&
                    "mb-3 rounded-lg bg-[rgba(87,80,241,0.07)] pb-[1.5px] font-medium text-dark-4 text-primary transition-all duration-200 hover:bg-[rgba(87,80,241,0.07)] dark:bg-[#FFFFFF1A] dark:text-dark-6 dark:text-white",
                )}
              >
                <div className="flex items-center">
                  <h2 className="text-md mb-2 font-medium text-dark-4 dark:text-dark-6">
                    {section.label}
                  </h2>
                  <ChevronUp
                    className={cn(
                      "ml-auto rotate-180 transition-transform duration-200",
                      expandedItems === section.label && "rotate-0",
                    )}
                    aria-hidden="true"
                  />
                </div>
                {expandedItems === section.label && (
                  <nav role="navigation" aria-label={section.label}>
                    <ul className="space-y-0">
                      {section.items.map((item) => (
                        <div key={item.title}>
                          <MenuItem
                            className="flex items-center gap-3 py-3"
                            as="link"
                            href={item.url}
                            isActive={isPathMatch(item.url)}
                          >
                            <item.icon
                              className="size-6 shrink-0"
                              aria-hidden="true"
                            />
                            <span>{item.title}</span>
                          </MenuItem>
                        </div>
                      ))}
                    </ul>
                  </nav>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
