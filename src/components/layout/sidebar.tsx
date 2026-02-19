"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useSyncExternalStore } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";

const sidebarItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "instructor"],
  },
  {
    title: "My Learning",
    href: "/dashboard/learning",
    icon: LayoutDashboard, // Or GraduationCap if available, sticking to existing imports for now
    roles: ["student"],
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Manage Courses",
    href: "/dashboard/courses",
    icon: BookOpen,
    roles: ["admin", "instructor"],
  },
  {
    title: "Browse Courses",
    href: "/",
    icon: BookOpen,
    roles: ["student"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Determine the user's primary role
  const roles = user?.roles || [];
  const isAdmin = roles.includes("admin");
  const isInstructor = roles.includes("instructor");
  const isStudent = !isAdmin && !isInstructor;

  // Filter sidebar items by role
  const visibleItems = sidebarItems.filter((item) => {
    if (isAdmin) return true; // Admin sees everything
    if (isInstructor) return item.roles.includes("instructor");
    if (isStudent) return item.roles.includes("student");
    return false;
  });

  // Prevent hydration mismatch by not rendering until client-side
  if (!mounted) {
    return (
      <div className="hidden bg-card h-screen w-64 flex-col md:flex fixed left-0 top-0 shadow-sm z-20">
        <div className="flex h-16 items-center px-6 font-bold text-lg text-primary">
          <Image
            src="/logo.png"
            alt="GoLearn"
            width={24}
            height={24}
            className="mr-2 h-6 w-6"
          />
          GoLearn
        </div>
      </div>
    );
  }

  return (
    <div className="hidden bg-card h-screen w-64 flex-col md:flex fixed left-0 top-0 shadow-sm z-20">
      <div className="flex h-16 items-center px-6 font-bold text-lg text-primary">
        <Image
          src="/logo.png"
          alt="GoLearn"
          width={24}
          height={24}
          className="mr-2 h-6 w-6"
        />
        {isAdmin ? "GoAdmin" : isInstructor ? "GoTeacher" : "GoStudent"}
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium lg:px-6 gap-2">
          {visibleItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  isActive
                    ? "bg-muted text-primary font-semibold"
                    : "text-muted-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t p-4">
        <div className="flex flex-col gap-2">
          {isAdmin && (
            <Link
              href="/dashboard/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary text-muted-foreground",
                pathname === "/dashboard/settings" && "bg-muted text-primary",
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
