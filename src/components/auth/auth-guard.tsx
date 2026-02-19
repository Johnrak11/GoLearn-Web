"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const protectedRoutes = [
  {
    path: "/dashboard",
    roles: ["admin", "instructor"],
    redirect: "/dashboard/learning",
  }, // Student trying to access overview -> learning
  { path: "/dashboard/users", roles: ["admin"], redirect: "/dashboard" },
  {
    path: "/dashboard/courses",
    roles: ["admin", "instructor"],
    redirect: "/dashboard/learning",
  },
  {
    path: "/dashboard/learning",
    roles: ["student", "admin", "instructor"],
    redirect: "/dashboard",
  },
  {
    path: "/dashboard/settings",
    roles: ["admin"],
    redirect: "/dashboard",
  },
];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Role-based checks
    const roles = user?.roles || [];
    const isAdmin = roles.includes("admin");
    const isInstructor = roles.includes("instructor");
    const isStudent = !isAdmin && !isInstructor;

    // Sort routes by length desc to match most specific path first
    const sortedRoutes = [...protectedRoutes].sort(
      (a, b) => b.path.length - a.path.length,
    );
    const matchedRule = sortedRoutes.find((r) => pathname.startsWith(r.path));

    if (matchedRule) {
      const hasAccess = matchedRule.roles.some((role) => {
        if (role === "admin") return isAdmin;
        if (role === "instructor") return isInstructor;
        if (role === "student") return isStudent;
        return false;
      });

      if (!hasAccess) {
        router.push(matchedRule.redirect);
        return;
      }
    }

    setTimeout(() => setIsChecking(false), 0);
  }, [isAuthenticated, isLoading, router, pathname, user]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
