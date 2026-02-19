"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/courses/course-card";
import { coursesService } from "@/features/courses/courses.service";
import { useAuthStore } from "@/stores/useAuthStore";

export default function Home() {
  const { user, isLoading: isAuthLoading } = useAuthStore();

  const { data: courses, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["published-courses"],
    queryFn: () => coursesService.getPublishedCourses(),
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md">
              Go
            </span>
            Learn
          </div>

          <div className="flex items-center gap-4">
            {isAuthLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : user ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/login?tab=register">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-muted/30 border-b">
        <div className="container mx-auto px-4 text-center space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight lg:text-7xl">
            Master New Skills <br className="hidden sm:inline" />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Anytime, Anywhere.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of students learning effectively on GoLearn. Access
            high-quality courses from expert instructors.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Button size="lg" className="rounded-full px-8">
              Explore Courses
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8">
              Become an Instructor
            </Button>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <main className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Featured Courses
          </h2>
          <Button variant="link">View All</Button>
        </div>

        {isCoursesLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !courses || courses.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No courses found. Check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/10">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © 2024 GoLearn Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
