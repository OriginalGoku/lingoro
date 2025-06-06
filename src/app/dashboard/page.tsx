import React, { Suspense, lazy } from 'react';
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-gray-200 aspect-video rounded-xl" />
  );
}

// const VideoCard = lazy(() => import('./VideoCard')); 

// Mock slow database call
async function fakeDatabaseCall() {
  await new Promise((resolve) => setTimeout(resolve, 3000)); // 3-second delay
  return {
    user: 'Alice',
    email: 'alice@example.com',
  };
}

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* First row: 3 columns (each 1/3 width on md+) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" /> 
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            {/* <Suspense fallback={<SkeletonCard />}>
              {/* <LazyCard />
            </Suspense> */}
          </div>

          {/* Second row: 5-column grid on md+ so we can use col-span-4 (80%) + col-span-1 (20%). */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="col-span-1 bg-muted/50 aspect-video rounded-xl md:col-span-4" />
            <div className="col-span-1 bg-muted/50 aspect-video rounded-xl md:col-span-1" />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
