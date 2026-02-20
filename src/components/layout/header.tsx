"use client";

import { Bell } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";

export function Header() {
  const user = useAuthStore((state) => state.user);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const displayName = mounted ? user?.full_name || "Admin User" : "";
  const displayRole = mounted ? user?.roles?.[0] || "admin" : "";
  const displayInitial = mounted ? user?.full_name?.[0] || "A" : "";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-end bg-card/80 backdrop-blur-sm px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-sm font-medium">{displayName}</span>
            <span className="text-xs text-muted-foreground capitalize">
              {displayRole}
            </span>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            {displayInitial}
          </div>
        </div>
      </div>
    </header>
  );
}
