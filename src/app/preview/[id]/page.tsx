"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Clock,
  BookOpen,
  PlayCircle,
  FileText,
  Lock,
  ChevronDown,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { coursesService } from "@/features/courses/courses.service";

export default function CoursePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(),
  );
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const {
    data: course,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["course-preview", courseId],
    queryFn: () => coursesService.getCourseById(courseId),
  }) as { data: any; isLoading: boolean; isError: boolean };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const totalLessons =
    course?.modules?.reduce(
      (sum: number, m: any) => sum + (m.lessons?.length || 0),
      0,
    ) || 0;
  const totalDuration =
    course?.modules?.reduce(
      (sum: number, m: any) =>
        sum +
        (m.lessons?.reduce(
          (ls: number, l: any) => ls + (l.video?.duration || l.duration || 0),
          0,
        ) || 0),
      0,
    ) || 0;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-red-500">Failed to load course.</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Preview Banner */}
      <div className="sticky top-0 z-50 bg-amber-500 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="text-sm font-medium">
            Preview Mode — This is how students will see your course
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:text-white hover:bg-amber-600"
          onClick={() => router.push(`/dashboard/courses/${courseId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Editor
        </Button>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 grid md:grid-cols-[1fr_380px] gap-8">
          <div className="flex flex-col justify-center gap-4">
            <div className="flex gap-2">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {course.level || "ALL LEVELS"}
              </Badge>
              <Badge
                variant="outline"
                className="border-white/30 text-white/80"
              >
                {course.language || "English"}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              {course.title}
            </h1>
            {course.description && (
              <div
                className="text-slate-300 text-base leading-relaxed line-clamp-3"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            )}
            <div className="flex items-center gap-6 text-sm text-slate-400 mt-2">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>{course.modules?.length || 0} Modules</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PlayCircle className="h-4 w-4" />
                <span>{totalLessons} Lessons</span>
              </div>
              {totalDuration > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(totalDuration)}</span>
                </div>
              )}
            </div>
            {course.instructor && (
              <div className="flex items-center gap-3 mt-2">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold">
                  {course.instructor.full_name?.[0] || "I"}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {course.instructor.full_name}
                  </p>
                  <p className="text-xs text-slate-400">Instructor</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-2xl overflow-hidden text-slate-900">
            {course.thumbnail_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full aspect-video object-cover"
              />
            ) : (
              <div className="w-full aspect-video bg-slate-100 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-slate-300" />
              </div>
            )}
            <div className="p-6 space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  {Number(course.price) === 0
                    ? "Free"
                    : `$${Number(course.price).toFixed(2)}`}
                </span>
                {course.compare_at_price &&
                  Number(course.compare_at_price) > Number(course.price) && (
                    <span className="text-lg text-slate-400 line-through">
                      ${Number(course.compare_at_price).toFixed(2)}
                    </span>
                  )}
              </div>
              <Button className="w-full text-base py-5" size="lg" disabled>
                Enroll Now
              </Button>
              <p className="text-xs text-center text-slate-500">
                (Preview mode — enrollment disabled)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Panel */}
      {selectedLesson && (
        <div className="bg-slate-950">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {selectedLesson.title}
                </h3>
                <p className="text-sm text-slate-400">
                  {selectedLesson.type === "VIDEO"
                    ? "Video Lesson"
                    : "Text Lesson"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-slate-800"
                onClick={() => setSelectedLesson(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {(() => {
              if (
                selectedLesson.type === "VIDEO" &&
                selectedLesson.video?.url
              ) {
                const isAudio = /\.(mp3|wav|ogg|aac|m4a)(\?|$)/i.test(
                  selectedLesson.video.url,
                );
                if (isAudio) {
                  return (
                    <div className="rounded-lg overflow-hidden bg-gradient-to-r from-indigo-900 to-purple-900 p-8">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
                          <PlayCircle className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium mb-2">
                            {selectedLesson.title}
                          </p>
                          <audio
                            key={selectedLesson.id}
                            src={selectedLesson.video.url}
                            controls
                            autoPlay
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="rounded-lg overflow-hidden bg-black">
                    <video
                      key={selectedLesson.id}
                      src={selectedLesson.video.url}
                      controls
                      autoPlay
                      className="w-full max-h-[500px] mx-auto"
                    />
                  </div>
                );
              }
              if (selectedLesson.type === "VIDEO") {
                return (
                  <div className="flex items-center justify-center h-64 bg-slate-900 rounded-lg border border-slate-700">
                    <div className="text-center text-slate-400">
                      <PlayCircle className="h-12 w-12 mx-auto mb-3 opacity-40" />
                      <p className="font-medium">No video uploaded yet</p>
                      <p className="text-sm mt-1">
                        Go to the editor to upload a video for this lesson
                      </p>
                    </div>
                  </div>
                );
              }
              return (
                <div className="bg-white rounded-lg p-6 prose max-w-none">
                  <p className="text-muted-foreground">
                    Text content preview will appear here.
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Curriculum Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-2">Course Curriculum</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Click any lesson to preview its content
        </p>
        <div className="space-y-3">
          {(course.modules || []).map((module: any, mIndex: number) => (
            <div
              key={module.id}
              className="border rounded-lg overflow-hidden bg-card"
            >
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                onClick={() => toggleModule(module.id)}
              >
                <div className="flex items-center gap-3">
                  {expandedModules.has(module.id) ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <span className="font-semibold">
                      Module {mIndex + 1}: {module.title}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {module.lessons?.length || 0} lessons
                    </p>
                  </div>
                </div>
              </button>

              {expandedModules.has(module.id) && (
                <div className="border-t">
                  {(module.lessons || []).map((lesson: any, lIndex: number) => (
                    <button
                      key={lesson.id}
                      className={`w-full flex items-center justify-between px-6 py-3 border-b last:border-b-0 hover:bg-primary/5 transition-colors text-left ${
                        selectedLesson?.id === lesson.id
                          ? "bg-primary/10 border-l-2 border-l-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedLesson(lesson)}
                    >
                      <div className="flex items-center gap-3">
                        {lesson.type === "VIDEO" ? (
                          <PlayCircle
                            className={`h-4 w-4 ${selectedLesson?.id === lesson.id ? "text-primary" : "text-primary/70"}`}
                          />
                        ) : (
                          <FileText className="h-4 w-4 text-blue-500" />
                        )}
                        <span
                          className={`text-sm ${selectedLesson?.id === lesson.id ? "font-medium text-primary" : ""}`}
                        >
                          {mIndex + 1}.{lIndex + 1} {lesson.title}
                        </span>
                        {lesson.is_free_preview && (
                          <Badge variant="secondary" className="text-xs">
                            Free Preview
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {lesson.video?.duration || lesson.duration ? (
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(
                              lesson.video?.duration || lesson.duration || 0,
                            )}
                          </span>
                        ) : null}
                        {!lesson.is_free_preview && (
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {(!course.modules || course.modules.length === 0) && (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              No modules added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
