"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { coursesService } from "@/features/courses/courses.service";
import { formatPrice } from "@/lib/utils"; // I need to create this or just inline it



export default function CoursesPage() {
  const { data: courses, isLoading, isError } = useQuery({
    queryKey: ["my-courses"],
    queryFn: coursesService.getMyCourses,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">
            Manage your courses and content.
          </p>
        </div>
        <Link href="/dashboard/courses/create">
            <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Course
            </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex h-64 items-center justify-center text-red-500">
          Failed to load courses.
        </div>
      ) : !Array.isArray(courses) || courses.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl bg-card border-dashed p-8 text-center animate-in fade-in-50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
            You haven&apos;t created any courses yet. Start sharing your knowledge with the world.
          </p>
          <Link href="/dashboard/courses/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Course
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="relative aspect-video w-full bg-muted">
                {course.thumbnail_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <BookOpen className="h-10 w-10 opacity-20" />
                  </div>
                )}
                 <div className="absolute right-2 top-2">
                    <Badge variant={course.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {course.status}
                    </Badge>
                 </div>
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="line-clamp-1 text-lg">{course.title}</CardTitle>
                <CardDescription>
                    {formatPrice(course.price)}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{course._count?.modules || 0} Modules</span>
                      <span>{course._count?.enrollments || 0} Students</span>
                  </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link href={`/dashboard/courses/${course.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                        Edit Course
                    </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
