"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  PlayCircle,
  Star,
  Users,
  Award,
  BookOpen,
  Clock,
  Lock,
} from "lucide-react";
import { coursesService } from "@/features/courses/courses.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { enrollmentService } from "@/features/enrollment/enrollment.service";
import { useAuthStore } from "@/stores/useAuthStore";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    data: course,
    isLoading: isCourseLoading,
    isError,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => coursesService.getCourseById(courseId),
  });

  const { data: enrollmentStatus, isLoading: isEnrollmentLoading } = useQuery({
    queryKey: ["enrollmentStatus", courseId],
    queryFn: () => enrollmentService.checkEnrollmentStatus(courseId),
    enabled: !!isAuthenticated && !!courseId,
  });

  const isEnrolled = enrollmentStatus?.isEnrolled;

  const enrollMutation = useMutation({
    mutationFn: () => enrollmentService.enrollInCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enrollmentStatus", courseId],
      });
      // Ideally redirect to learning page but for now stay here or redirect
      router.push(`/dashboard/learning`); // We will build this next
      // toast.success("Enrolled successfully!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to enroll");
    },
  });

  const handleEnroll = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${courseId}`);
      return;
    }
    enrollMutation.mutate();
  };

  if (isCourseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <Button onClick={() => router.push("/")}>Browse Courses</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header / Hero */}
      <div className="bg-slate-900 text-white pt-10 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            {/* Breadcrumb replacement */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              <span
                className="hover:text-white cursor-pointer"
                onClick={() => router.push("/")}
              >
                Home
              </span>
              <span>/</span>
              <span>Courses</span>
              <span>/</span>
              <span className="text-white truncate max-w-[200px]">
                {course.title}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              {course.title}
            </h1>
            <p className="text-lg text-slate-300 mb-6 max-w-2xl line-clamp-3">
              {course.description?.replace(/<[^>]*>?/gm, "").substring(0, 150)}
              ...
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-bold">4.8</span>
                <span className="text-slate-400">(120 ratings)</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-slate-400" />
                <span>{course._count?.enrollments || 0} students</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>
                  Last updated{" "}
                  {new Date(course.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Description */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">About this course</h2>
            <div
              className="prose prose-stone dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: course.description || "" }}
            />
          </section>

          {/* Curriculum */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Course Content</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>{course.modules?.length || 0} sections</span>
              <span>•</span>
              <span>
                {course.modules?.reduce(
                  (acc, m) => acc + (m.lessons?.length || 0),
                  0,
                ) || 0}{" "}
                lessons
              </span>
            </div>

            <Accordion
              type="single"
              collapsible
              className="w-full border rounded-lg"
            >
              {course.modules?.map((module, index) => (
                <AccordionItem
                  key={module.id}
                  value={module.id}
                  className="px-4"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="text-left">
                      <div className="font-semibold">{module.title}</div>
                      <div className="text-xs text-muted-foreground font-normal mt-1">
                        {module.lessons?.length || 0} lectures
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-0 pb-4">
                    <div className="space-y-1">
                      {module.lessons?.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between py-2 px-2 hover:bg-muted/50 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            {lesson.type === "VIDEO" ? (
                              <PlayCircle className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm">{lesson.title}</span>
                          </div>
                          <div>
                            {lesson.is_free_preview ? (
                              <span className="text-xs text-primary underline cursor-pointer">
                                Preview
                              </span>
                            ) : (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Instructor */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Instructor</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Avatar Placeholder */}
              <div className="h-24 w-24 rounded-full bg-slate-200 shrink-0" />
              <div>
                <h3 className="font-bold text-lg">John Doe</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  Senior Developer & Instructor
                </p>
                <p className="text-sm">
                  I am a software engineer with over 10 years of experience. I
                  love teaching what I know in a simple, practical way.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar / Enrollment Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="bg-card border rounded-lg shadow-lg overflow-hidden">
              {/* Preview Video / Image */}
              <div className="aspect-video bg-black relative flex items-center justify-center group cursor-pointer">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <PlayCircle className="h-8 w-8 text-primary fill-current" />
                  </div>
                </div>
                <div className="absolute bottom-4 text-white text-sm font-medium">
                  Preview this course
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="text-3xl font-bold">
                  {course.price === 0 ? "Free" : formatPrice(course.price)}
                </div>

                {isEnrolled ? (
                  <Button
                    className="w-full text-lg h-12"
                    onClick={() => router.push(`/dashboard/learning`)}
                  >
                    Go to Course
                  </Button>
                ) : (
                  <Button
                    className="w-full text-lg h-12"
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending || isEnrollmentLoading}
                  >
                    {enrollMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {course.price === 0 ? "Enroll Now" : "Buy Now"}
                  </Button>
                )}

                <p className="text-xs text-center text-muted-foreground">
                  30-Day Money-Back Guarantee
                </p>

                <div className="space-y-3 text-sm">
                  <h4 className="font-bold">This course includes:</h4>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <PlayCircle className="h-4 w-4" />
                    <span>
                      {course.modules?.reduce(
                        (acc, m) => acc + (m.lessons?.length || 0),
                        0,
                      ) || 0}{" "}
                      Lessons
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Full lifetime access</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span>Certificate of completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
