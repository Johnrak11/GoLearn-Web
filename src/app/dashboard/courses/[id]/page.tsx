"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import FileUpload from "@/components/ui/file-upload";
import { coursesService } from "@/features/courses/courses.service";
import { CurriculumEditor } from "@/features/courses/components/curriculum-editor";

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const queryClient = useQueryClient();

  const {
    data: course,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => coursesService.getCourseById(courseId),
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (course) {
      setTitle(course.title || "");
      setDescription(course.description || "");
      setPrice(Number(course.price) || 0);
      setImageUrl(course.thumbnail_url || "");
    }
  }, [course]);

  // ============ Mutations ============
  const { mutate: updateCourse, isPending: isSaving } = useMutation({
    mutationFn: (data: {
      title?: string;
      description?: string;
      price?: number;
      image_url?: string;
    }) => coursesService.updateCourse(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      alert("Course updated successfully!");
    },
    onError: () => alert("Failed to update course."),
  });

  const { mutate: toggleStatus, isPending: isTogglingStatus } = useMutation({
    mutationFn: (status: "PUBLISHED" | "DRAFT" | "ARCHIVED") =>
      coursesService.toggleCourseStatus(courseId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
    },
    onError: () => alert("Failed to update course status."),
  });

  const { mutate: deleteCourse, isPending: isDeleting } = useMutation({
    mutationFn: () => coursesService.deleteCourse(courseId),
    onSuccess: () => {
      router.push("/dashboard/courses");
    },
    onError: () => alert("Failed to delete course."),
  });

  const onSave = () => {
    updateCourse({ title, description, price, image_url: imageUrl });
  };

  const currentStatus = course?.status || "DRAFT";
  const isPublished = currentStatus === "PUBLISHED";

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-500">Failed to load course details.</p>
        <Link href="/dashboard/courses">
          <Button variant="outline">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {course?.title || "Untitled Course"}
            </h1>
            <Badge variant={isPublished ? "default" : "secondary"}>
              {currentStatus}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {course?.modules?.length || 0} Modules
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(`/preview/${courseId}`, "_blank")}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          {isPublished ? (
            <Button
              variant="outline"
              onClick={() => toggleStatus("DRAFT")}
              disabled={isTogglingStatus}
            >
              {isTogglingStatus && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Unpublish
            </Button>
          ) : (
            <Button
              onClick={() => toggleStatus("PUBLISHED")}
              disabled={isTogglingStatus}
            >
              {isTogglingStatus && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Publish Course
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Course Information</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the course title, description and other details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Course Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <RichTextEditor value={description} onChange={setDescription} />
              </div>
              <div className="grid gap-2">
                <Label>Thumbnail</Label>
                <FileUpload
                  value={imageUrl ? [imageUrl] : []}
                  onChange={setImageUrl}
                  onRemove={() => setImageUrl("")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price.toString()}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={onSave} disabled={isSaving}>
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="curriculum" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum</CardTitle>
              <CardDescription>Manage modules and lessons.</CardDescription>
            </CardHeader>
            <CardContent>
              <CurriculumEditor courseId={courseId} modules={course?.modules} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for this course.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-medium text-destructive">
                      Delete Course
                    </h4>
                    <p className="text-sm text-muted-foreground max-w-xl">
                      Permanently delete this course and all its modules,
                      lessons, and enrollments. This action cannot be undone.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    className="shrink-0"
                    disabled={isDeleting}
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to delete "${course.title}"? This action cannot be undone.`,
                        )
                      ) {
                        deleteCourse();
                      }
                    }}
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete Course
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
