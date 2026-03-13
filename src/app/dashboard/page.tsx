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
import {
  EnrollmentTrendChart,
  TopCoursesChart,
} from "@/features/stats/components/dashboard-charts";

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

  const renderStatsCards = () => {
    if (isAdmin) {
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
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
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
    } else {
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
    }
  };

  const chartData = isAdmin ? (data as AdminStats) : (data as InstructorStats);

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

      {renderStatsCards()}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm border-none bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Monthly Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <EnrollmentTrendChart data={chartData.monthlyEnrollments} />
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
            <TopCoursesChart data={chartData.topCourses} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
