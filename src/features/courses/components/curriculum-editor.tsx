"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, GripVertical, Trash2, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LessonDialog } from "./lesson-dialog";
import { coursesService } from "../courses.service";
import type { Module, Lesson } from "../courses.service";

interface CurriculumEditorProps {
  courseId: string;
  modules?: Module[];
}

export function CurriculumEditor({
  courseId,
  modules: initialModules,
}: CurriculumEditorProps) {
  const queryClient = useQueryClient();
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState("");

  const modules = initialModules || [];

  // ============ Module Mutations ============
  const { mutate: addModule, isPending: isAddingModule } = useMutation({
    mutationFn: (title: string) => coursesService.createModule(courseId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      setNewModuleTitle("");
    },
    onError: () => alert("Failed to create module"),
  });

  const { mutate: editModule } = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      coursesService.updateModule(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      setEditingModuleId(null);
    },
    onError: () => alert("Failed to update module"),
  });

  const { mutate: removeModule } = useMutation({
    mutationFn: (id: string) => coursesService.deleteModule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: () => alert("Failed to delete module"),
  });

  // ============ Lesson Mutations ============
  const { mutate: addLesson } = useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: string; data: any }) =>
      coursesService.createLesson(moduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: () => alert("Failed to create lesson"),
  });

  const { mutate: editLesson } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      coursesService.updateLesson(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: () => alert("Failed to update lesson"),
  });

  const { mutate: removeLesson } = useMutation({
    mutationFn: (id: string) => coursesService.deleteLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: () => alert("Failed to delete lesson"),
  });

  return (
    <div className="space-y-6">
      {/* Add Module & Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between border-b pb-4">
        <h3 className="text-lg font-medium">Modules ({modules.length})</h3>
        <div className="flex w-full sm:w-auto items-center gap-2">
          <Input
            placeholder="New module title..."
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newModuleTitle.trim().length >= 2) {
                addModule(newModuleTitle.trim());
              }
            }}
            className="max-w-[300px]"
          />
          <Button
            onClick={() => {
              if (newModuleTitle.trim().length >= 2)
                addModule(newModuleTitle.trim());
            }}
            disabled={isAddingModule || newModuleTitle.trim().length < 2}
          >
            {isAddingModule ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Add Module
          </Button>
        </div>
      </div>

      {/* Module List */}
      {modules.length === 0 && (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center bg-muted/20">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-lg">No modules yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first module to start adding lessons.
          </p>
        </div>
      )}

      <Accordion type="multiple" className="w-full space-y-4">
        {modules.map((module: Module, index: number) => (
          <AccordionItem
            key={module.id}
            value={module.id}
            className="border rounded-lg bg-card px-2"
          >
            <div className="flex items-center py-2">
              <div className="flex items-center gap-3 flex-1">
                <GripVertical className="h-5 w-5 text-muted-foreground/50 cursor-grab" />
                {editingModuleId === module.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-4">
                    <Input
                      value={editingModuleTitle}
                      onChange={(e) => setEditingModuleTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          editModule({
                            id: module.id,
                            title: editingModuleTitle,
                          });
                        if (e.key === "Escape") setEditingModuleId(null);
                      }}
                      autoFocus
                      className="h-8"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        editModule({
                          id: module.id,
                          title: editingModuleTitle,
                        });
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingModuleId(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <span className="font-semibold text-sm">
                    Module {index + 1}: {module.title}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 mr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingModuleId(module.id);
                    setEditingModuleTitle(module.title);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      confirm(
                        `Delete module "${module.title}" and all its lessons?`,
                      )
                    ) {
                      removeModule(module.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <AccordionTrigger className="w-8 h-8 p-0" />
            </div>

            <AccordionContent className="pt-0 pb-4 px-2">
              <div className="pl-6 space-y-1">
                {(module.lessons || []).map(
                  (lesson: Lesson, lIndex: number) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 group transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-sm font-medium truncate">
                          {lIndex + 1}. {lesson.title}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 px-1.5 uppercase font-normal tracking-wider text-muted-foreground"
                        >
                          {lesson.type}
                        </Badge>
                        {lesson.is_free_preview && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5 px-1.5 bg-green-100 text-green-700 hover:bg-green-100 border-none"
                          >
                            Free
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <LessonDialog
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          }
                          initialData={{
                            title: lesson.title,
                            type: lesson.type as "VIDEO" | "TEXT" | "QUIZ",
                            videoUrl: lesson.video?.url || "",
                            duration: lesson.video?.duration || 0,
                            isFree: lesson.is_free_preview,
                            content: "",
                          }}
                          onSubmit={(values: any) => {
                            editLesson({ id: lesson.id, data: values });
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (confirm(`Delete lesson "${lesson.title}"?`)) {
                              removeLesson(lesson.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ),
                )}

                {(!module.lessons || module.lessons.length === 0) && (
                  <div className="py-8 text-center text-sm text-muted-foreground bg-muted/30 rounded-md border border-dashed mb-2">
                    No lessons in this module
                  </div>
                )}

                <div className="pt-2">
                  <LessonDialog
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-dashed text-muted-foreground hover:text-primary"
                      >
                        <Plus className="mr-2 h-3.5 w-3.5" /> Add Lesson to
                        Module {index + 1}
                      </Button>
                    }
                    onSubmit={(values: any) => {
                      addLesson({ moduleId: module.id, data: values });
                    }}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
