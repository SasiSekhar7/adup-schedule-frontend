

// import { AppSidebar } from "./components/app-sidebar";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { Separator } from "@/components/ui/separator";
// import {
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";
// import { Link, Outlet, useLocation } from "react-router-dom";

// export default function Layout() {
//   const location = useLocation();
//   const pathSegments = location.pathname.split("/").filter(Boolean);

//   return (
//     <SidebarProvider>
//       <AppSidebar />
//       <SidebarInset>
//         <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 md:border-b-0 md:bg-transparent">
//           <div className="flex items-center gap-2 px-4">
//             {/* Sidebar trigger shown on all screen sizes — opens the drawer on mobile (original behavior), collapses on desktop */}
//             <SidebarTrigger className="-ml-1" />
//           </div>
//         </header>

//         {/* pb-20 reserves space above the fixed mobile bottom nav so content isn't hidden behind it */}
//         <div className="flex flex-1 flex-col gap-4 p-4 pt-0 pb-20 md:pb-4 overflow-x-hidden bg-background">
//           <Outlet />
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }





import { AppSidebar } from "./components/app-sidebar";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, Outlet, useLocation } from "react-router-dom";


import { NotificationBell } from "@/components/NotificationBell";

function LayoutContent() {
  const { state, isMobile } = useSidebar();

  const sidebarWidth =
    !isMobile && state === "collapsed"
      ? "var(--sidebar-width-icon)"
      : "var(--sidebar-width)";

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
        </div>
      </header>


      <div
  style={{
    maxWidth: isMobile
      ? "100%"
      : `calc(100vw - ${sidebarWidth})`,
  }}
  className="flex flex-1 flex-col gap-4 p-4 pt-0 pb-20 md:pb-4 overflow-x-hidden bg-background"
>
  <Outlet />
</div>
    </SidebarInset>
  );
}

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <LayoutContent />
    </SidebarProvider>
  );
}