"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Video as VideoIcon, FileText, Trash } from "lucide-react";
import {
  CldUploadWidget,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { RichTextEditor } from "@/components/ui/rich-text-editor";

const lessonSchema = z.object({
  title: z.string().min(2, { message: "Title is required" }),
  type: z.enum(["VIDEO", "TEXT", "QUIZ"]),
  videoUrl: z.string().optional(),
  content: z.string().optional(),
  duration: z.string().optional(), // Changed to string for input handling
  isFree: z.boolean().optional(),
});

type LessonFormValues = z.infer<typeof lessonSchema>;

interface LessonDialogProps {
  initialData?: any; // Relaxed type to avoid conflicts with number/string duration
  trigger?: React.ReactNode;
  onSubmit: (values: any) => void; // Relaxed type
  isLoading?: boolean;
}

export function LessonDialog({
  initialData,
  trigger,
  onSubmit,
  isLoading,
}: LessonDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: initialData?.title || "",
      type: initialData?.type || "VIDEO",
      videoUrl: initialData?.videoUrl || "",
      content: initialData?.content || "",
      duration: initialData?.duration?.toString() || "",
      isFree: initialData?.isFree || false,
    },
  });

  const lessonType = form.watch("type");

  const handleSubmit = (values: LessonFormValues) => {
    onSubmit({
      ...values,
      duration: values.duration ? parseFloat(values.duration) : 0,
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Lesson" : "Add New Lesson"}
          </DialogTitle>
          <DialogDescription>
            Add content to your course curriculum.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Lesson Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Introduction to React"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="VIDEO">
                          <div className="flex items-center">
                            <VideoIcon className="mr-2 h-4 w-4" /> Video
                          </div>
                        </SelectItem>
                        <SelectItem value="TEXT">
                          <div className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" /> Text / Article
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {lessonType === "VIDEO" && (
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Content</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        {field.value &&
                          (() => {
                            const isAudio =
                              /\.(mp3|wav|ogg|aac|m4a)(\?|$)/i.test(
                                field.value || "",
                              );
                            return (
                              <div
                                className={`relative rounded-md overflow-hidden border ${isAudio ? "bg-gradient-to-r from-indigo-50 to-purple-50 p-4" : "bg-black"}`}
                              >
                                {isAudio ? (
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                      <VideoIcon className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <audio
                                      src={field.value}
                                      controls
                                      className="w-full h-10"
                                    />
                                  </div>
                                ) : (
                                  <video
                                    src={field.value}
                                    controls
                                    className="w-full max-h-[200px]"
                                  />
                                )}
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className={`absolute z-10 ${isAudio ? "top-1/2 -translate-y-1/2 right-4 h-8 w-8" : "top-2 right-2"}`}
                                  onClick={() => field.onChange("")}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })()}
                        <CldUploadWidget
                          onSuccess={(
                            result: CloudinaryUploadWidgetResults,
                          ) => {
                            const info = result?.info;
                            if (typeof info === "object" && info?.secure_url) {
                              field.onChange(info.secure_url);
                            }
                          }}
                          uploadPreset={
                            process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
                          }
                          options={{
                            maxFiles: 1,
                            resourceType: "video",
                          }}
                        >
                          {({ open }) => (
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={(e) => {
                                e.preventDefault();
                                open();
                              }}
                            >
                              <VideoIcon className="mr-2 h-4 w-4" />
                              {field.value ? "Replace Video" : "Upload Video"}
                            </Button>
                          )}
                        </CldUploadWidget>
                        <div className="text-xs text-muted-foreground">
                          Or paste a video URL:
                        </div>
                        <Input
                          placeholder="https://example.com/video.mp4"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload or link to your video lesson content.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {lessonType !== "QUIZ" && (
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description / Content</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Add lesson description or content..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Lesson
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
