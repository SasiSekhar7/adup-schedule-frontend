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
//         <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
//           <div className="flex items-center gap-2 px-4">
//             <SidebarTrigger className="-ml-1" />
//             {/* <Separator orientation="vertical" className="mr-2 h-4" /> */}
//             {/* <Breadcrumb>
//               <BreadcrumbList>
//                 <div className="flex items-center space-x-2">
//                   {pathSegments.map((item, index) => {
//                     const path = `/${pathSegments
//                       .slice(0, index + 1)
//                       .join("/")}`;
//                     return (
//                       <div className="flex items-center" key={path}>
//                         <BreadcrumbItem>
//                           <Link to={path} className="capitalize">
//                             {decodeURIComponent(item)}
//                           </Link>
//                         </BreadcrumbItem>
//                         {index <= pathSegments.length - 1 && (
//                           <Separator
//                             orientation="vertical"
//                             className="mr-2 h-4"
//                           />
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>

//               </BreadcrumbList>
//             </Breadcrumb> */}
//           </div>
//         </header>
//         <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-x-hidden">
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
} from "@/components/ui/sidebar";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 md:border-b-0 md:bg-transparent">
          <div className="flex items-center gap-2 px-4">
            {/* Sidebar trigger shown on all screen sizes — opens the drawer on mobile (original behavior), collapses on desktop */}
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>

        {/* pb-20 reserves space above the fixed mobile bottom nav so content isn't hidden behind it */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 pb-20 md:pb-4 overflow-x-hidden bg-background">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
