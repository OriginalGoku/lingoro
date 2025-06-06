// src/app/lingoro/layout.tsx
import React from 'react';
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// If you need metadata specific to this layout segment:
// export const metadata = {
//   title: 'Lingoro Section',
//   description: 'Content within the Lingoro section',
// };

export default function LingoroLayout({ // Renamed to LingoroLayout for clarity, can be RootLayout if you prefer
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // No <html> or <body> tags here!
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
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
                    Building Your Application {/* Consider making this dynamic */}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Current Lingoro Page</BreadcrumbPage> {/* Consider making this dynamic */}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {/* The actual page content (from page.tsx in this segment) will be rendered here */}
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}