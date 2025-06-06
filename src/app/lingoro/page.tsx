// app/your-route/page.tsx
import React, { Suspense, lazy } from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// SkeletonCard might be used if you still have Suspense boundaries within the page
function SkeletonCard() {
  return (
    <div className="animate-pulse bg-gray-200 aspect-video rounded-xl" />
  );
}

// const VideoCard = lazy(() => import('./VideoCard')); // If you have a VideoCard component

// Mock slow database call for page-specific data
async function fakePageDataCall() {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay
  return {
    pageTitle: 'Lingoro App',
    items: ['Item 1', 'Item 2', 'Item 3'],
  };
}

export default async function Page() { // Make it async if you fetch data for the page
  const pageData = await fakePageDataCall();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6"> {/* Using main semantic tag */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageData.pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
     
      
      {/* First row: 3 columns (each 1/3 width on md+) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl p-4">Content 1</div> 
        <div className="bg-muted/50 aspect-video rounded-xl p-4">Content 2</div>
        <div className="bg-muted/50 aspect-video rounded-xl p-4">Content 3</div>
        {/* Example of using Suspense within the page content */}
        {/* <Suspense fallback={<SkeletonCard />}> */}
          {/* <VideoCard data={pageData.items} /> */}
        {/* </Suspense> */}
      </div>

      {/* Second row: 5-column grid on md+ */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="col-span-1 bg-muted/50 aspect-video rounded-xl p-4 md:col-span-4">Main Content Area</div>
        <div className="col-span-1 bg-muted/50 aspect-video rounded-xl p-4 md:col-span-1">Side Panel in Content</div>
      </div>
    </main>
  );
}