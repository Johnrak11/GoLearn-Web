"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Loader2, BookOpen, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { coursesService, Course } from "@/features/courses/courses.service";
import { formatPrice } from "@/lib/utils";

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: courses,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["my-courses"],
    queryFn: coursesService.getMyCourses,
  });

  // Client-side filtering since getMyCourses returns all instructor courses
  const filteredCourses = useMemo(() => {
    if (!courses || !Array.isArray(courses)) return [];
    if (!searchQuery.trim()) return courses;

    const query = searchQuery.toLowerCase();
    return courses.filter(
      (course: Course) =>
        course.title.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query),
    );
  }, [courses, searchQuery]);

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

      {/* Search Bar */}
      <div className="relative w-full md:w-[400px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search courses by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex h-64 items-center justify-center text-red-500">
          Failed to load courses.
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl bg-card border-dashed p-8 text-center animate-in fade-in-50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">
            {searchQuery
              ? `No courses found for "${searchQuery}"`
              : "No courses yet"}
          </h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
            {searchQuery
              ? "Try adjusting your search term."
              : "You haven\u0027t created any courses yet. Start sharing your knowledge with the world."}
          </p>
          {!searchQuery && (
            <Link href="/dashboard/courses/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Course
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCourses.map((course: Course) => (
            <Card
              key={course.id}
              className="overflow-hidden transition-all hover:shadow-lg"
            >
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
                  <Badge
                    variant={
                      course.status === "PUBLISHED" ? "default" : "secondary"
                    }
                  >
                    {course.status}
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="line-clamp-1 text-lg">
                  {course.title}
                </CardTitle>
                <CardDescription>{formatPrice(course.price)}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{course._count?.modules || 0} Modules</span>
                  <span>{course._count?.enrollments || 0} Students</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link
                  href={`/dashboard/courses/${course.id}`}
                  className="w-full"
                >
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
