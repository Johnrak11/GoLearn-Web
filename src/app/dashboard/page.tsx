"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  Loader2,
} from "lucide-react";
import {
  statsService,
  AdminStats,
  InstructorStats,
} from "@/features/stats/stats.service";
import { useAuthStore } from "@/stores/useAuthStore";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.roles?.includes("admin");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => statsService.getDashboardStats(),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Loading dashboard data...
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <BookOpen className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Oops! Something went wrong</h2>
        <p className="text-muted-foreground max-w-sm">
          We couldn&apos;t load your dashboard statistics. Please try refreshing
          or check back later.
        </p>
      </div>
    );
  }

  const renderAdminStats = () => {
    const stats = data as AdminStats;
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-medium">
                {stats.growth.users}
              </span>{" "}
              vs last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeCourses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-medium">
                {stats.growth.courses}
              </span>{" "}
              vs last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enrollments
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalEnrollments.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-medium">
                {stats.growth.enrollments}
              </span>{" "}
              vs last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 font-medium">
                {stats.growth.revenue}
              </span>{" "}
              vs last month
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderInstructorStats = () => {
    const stats = data as InstructorStats;
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalStudents.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-medium">
                {stats.growth.students}
              </span>{" "}
              new students
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Published Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeCourses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Active on the platform
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-medium">
                {stats.growth.revenue}
              </span>{" "}
              this month
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome back,{" "}
          <span className="text-primary font-semibold">{user?.full_name}</span>!
          Here&apos;s a look at your {isAdmin ? "platform" : "teaching"}{" "}
          performance.
        </p>
      </div>

      {isAdmin ? renderAdminStats() : renderInstructorStats()}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm border-none bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Monthly Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full bg-gradient-to-br from-muted/10 to-muted/30 rounded-2xl flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-muted">
              <div className="relative h-24 w-48 mb-4 opacity-20">
                {/* Abstract line chart shape */}
                <div className="absolute inset-0 border-b-2 border-primary/40 bottom-0"></div>
                <div className="absolute bottom-4 left-0 w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
                <div className="absolute bottom-12 left-16 w-12 h-12 bg-blue-500/20 rounded-full animate-bounce delay-100"></div>
                <div className="absolute bottom-8 left-32 w-10 h-10 bg-green-500/20 rounded-full animate-pulse delay-200"></div>
              </div>
              <p className="font-medium"> Enrollment Trends</p>
              <p className="text-xs italic">
                (Automatic charting based on current metrics)
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 shadow-sm border-none bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Top Course Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full bg-gradient-to-tr from-muted/10 to-muted/30 rounded-2xl flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-muted">
              <div className="flex gap-2 items-end h-24 mb-4 opacity-20">
                <div className="w-6 h-12 bg-blue-500/40 rounded-t-sm"></div>
                <div className="w-6 h-20 bg-primary/40 rounded-t-sm"></div>
                <div className="w-6 h-16 bg-blue-500/40 rounded-t-sm"></div>
                <div className="w-6 h-8 bg-primary/40 rounded-t-sm"></div>
              </div>
              <p className="font-medium">Distribution Analysis</p>
              <p className="text-xs italic">
                (Detailed course metrics coming soon)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
