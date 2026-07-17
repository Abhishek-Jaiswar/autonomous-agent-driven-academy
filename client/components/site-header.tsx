"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  const pathname = usePathname();

  let title = "AstraLearn AI";
  if (pathname === "/dashboard") {
    title = "Academy Overview";
  } else if (pathname === "/dashboard/curriculum") {
    title = "Curriculum Map";
  } else if (pathname === "/dashboard/classroom") {
    title = "AI Classroom";
  } else if (pathname === "/dashboard/sourcetrust") {
    title = "SourceTrust Board";
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium text-foreground tracking-tight">{title}</h1>
      </div>
    </header>
  );
}
