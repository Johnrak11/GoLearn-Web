"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Loader2, PlayCircle, BookOpen, Clock } from "lucide-react";
import { enrollmentService } from "@/features/enrollment/enrollment.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function StudentDashboardPage() {
  const { data: ongoingCourses, isLoading: isLoadingOngoing } = useQuery({
    queryKey: ["my-courses", "in_progress"],
    queryFn: () => enrollmentService.getMyEnrollments("in_progress"),
  });

  const { data: completedCourses, isLoading: isLoadingCompleted } = useQuery({
    queryKey: ["my-courses", "completed"],
    queryFn: () => enrollmentService.getMyEnrollments("completed"),
  });

  if (isLoadingOngoing) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
        <Button variant="outline" asChild>
          <Link href="/">Browse Courses</Link>
        </Button>
      </div>

      <Tabs defaultValue="ongoing" className="w-full">
        <TabsList>
          <TabsTrigger value="ongoing">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="ongoing" className="mt-6">
          {!ongoingCourses || ongoingCourses.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <h3 className="text-lg font-semibold mb-2">
                You haven't enrolled in any courses yet.
              </h3>
              <p className="text-muted-foreground mb-4">
                Start your learning journey today!
              </p>
              <Button asChild>
                <Link href="/">Explore Courses</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ongoingCourses.map((enrollment) => (
                <Link
                  key={enrollment.id}
                  href={`/learn/${enrollment.course_id}`}
                >
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer flex flex-col">
                    <div className="aspect-video w-full overflow-hidden bg-muted relative">
                      {enrollment.course?.thumbnail_url ? (
                        <img
                          src={enrollment.course.thumbnail_url}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                          <BookOpen className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors group">
                        <PlayCircle className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="line-clamp-2 text-lg">
                        {enrollment.course?.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.course?.instructor?.full_name ||
                          "Instructor"}
                      </p>
                    </CardHeader>
                    <CardContent className="p-4 pb-2 flex-1">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{enrollment.progress_pct}% Complete</span>
                          <span>
                            {enrollment.progress_pct === 100
                              ? "Done"
                              : "Continue"}
                          </span>
                        </div>
                        <Progress
                          value={enrollment.progress_pct}
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-2">
                      <Button className="w-full" variant="secondary">
                        Continue Learning
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {/* Similar list for completed courses */}
          {!completedCourses || completedCourses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No completed courses yet. Keep going!
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedCourses.map((enrollment) => (
                <Card
                  key={enrollment.id}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {enrollment.course?.title}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="w-fit mt-2 bg-green-100 text-green-800 hover:bg-green-100"
                    >
                      Completed
                    </Badge>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
