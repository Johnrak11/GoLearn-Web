"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { coursesService } from "../courses.service";

interface QuestionForm {
  prompt: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SINGLE_CHOICE";
  points: number;
  options: { text: string; is_correct: boolean }[];
}

interface QuizEditorProps {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  hasQuiz?: boolean;
  trigger: React.ReactNode;
}

export function QuizEditor({
  lessonId,
  lessonTitle,
  courseId,
  hasQuiz,
  trigger,
}: QuizEditorProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuestionForm[]>([]);

  // Fetch existing quiz when dialog opens
  const { data: existingQuiz, isLoading: isLoadingQuiz } = useQuery({
    queryKey: ["quiz", lessonId],
    queryFn: () => coursesService.getQuizByLesson(lessonId),
    enabled: open && !!hasQuiz,
    retry: false,
  });

  // Populate form when dialog opens or quiz data loads
  const prevQuizRef = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    if (existingQuiz && prevQuizRef[0] !== existingQuiz.id) {
      prevQuizRef[0] = existingQuiz.id;
      setTitle(existingQuiz.title);
      setPassingScore(existingQuiz.passing_score);
      setQuestions(
        existingQuiz.questions.map((q) => ({
          prompt: q.prompt,
          type: q.type,
          points: q.points,
          options: q.options.map((o) => ({
            text: o.text,
            is_correct: o.is_correct,
          })),
        })),
      );
    } else if (!hasQuiz && !existingQuiz) {
      setTitle(`${lessonTitle} Quiz`);
      setPassingScore(70);
      setQuestions([
        {
          prompt: "",
          type: "SINGLE_CHOICE",
          points: 1,
          options: [
            { text: "", is_correct: true },
            { text: "", is_correct: false },
          ],
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existingQuiz]);

  // ============ Mutations ============
  const { mutate: createQuiz, isPending: isCreating } = useMutation({
    mutationFn: () =>
      coursesService.createQuiz(lessonId, {
        title,
        passing_score: passingScore,
        questions,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      setOpen(false);
      alert("Quiz created successfully!");
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      alert(err?.response?.data?.error || "Failed to create quiz");
    },
  });

  const { mutate: updateQuiz, isPending: isUpdating } = useMutation({
    mutationFn: () =>
      coursesService.updateQuiz(existingQuiz!.id, {
        title,
        passing_score: passingScore,
        questions,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["quiz", lessonId] });
      setOpen(false);
      alert("Quiz updated successfully!");
    },
    onError: () => alert("Failed to update quiz"),
  });

  const { mutate: deleteQuiz, isPending: isDeleting } = useMutation({
    mutationFn: () => coursesService.deleteQuiz(existingQuiz!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      setOpen(false);
      alert("Quiz deleted successfully!");
    },
    onError: () => alert("Failed to delete quiz"),
  });

  // ============ Question Helpers ============
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        prompt: "",
        type: "SINGLE_CHOICE",
        points: 1,
        options: [
          { text: "", is_correct: true },
          { text: "", is_correct: false },
        ],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (
    index: number,
    field: keyof QuestionForm,
    value: string | number,
  ) => {
    const updated = [...questions];
    if (field === "prompt") updated[index].prompt = value as string;
    else if (field === "type")
      updated[index].type = value as QuestionForm["type"];
    else if (field === "points") updated[index].points = value as number;
    setQuestions(updated);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push({ text: "", is_correct: false });
    setQuestions(updated);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.filter(
      (_, i) => i !== oIndex,
    );
    setQuestions(updated);
  };

  const updateOption = (
    qIndex: number,
    oIndex: number,
    field: "text" | "is_correct",
    value: string | boolean,
  ) => {
    const updated = [...questions];
    if (field === "is_correct" && value === true) {
      // For SINGLE_CHOICE and TRUE_FALSE, only one can be correct
      if (
        updated[qIndex].type === "SINGLE_CHOICE" ||
        updated[qIndex].type === "TRUE_FALSE"
      ) {
        updated[qIndex].options = updated[qIndex].options.map((o, i) => ({
          ...o,
          is_correct: i === oIndex,
        }));
      } else {
        updated[qIndex].options[oIndex].is_correct = value;
      }
    } else {
      (updated[qIndex].options[oIndex] as any)[field] = value;
    }
    setQuestions(updated);
  };

  const handleSave = () => {
    // Validation
    if (!title.trim()) {
      alert("Quiz title is required");
      return;
    }
    if (questions.length === 0) {
      alert("At least one question is required");
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].prompt.trim()) {
        alert(`Question ${i + 1} needs a prompt`);
        return;
      }
      if (questions[i].options.length < 2) {
        alert(`Question ${i + 1} needs at least 2 options`);
        return;
      }
      const hasCorrect = questions[i].options.some((o) => o.is_correct);
      if (!hasCorrect) {
        alert(`Question ${i + 1} needs at least one correct answer`);
        return;
      }
      for (let j = 0; j < questions[i].options.length; j++) {
        if (!questions[i].options[j].text.trim()) {
          alert(`Question ${i + 1}, Option ${j + 1} needs text`);
          return;
        }
      }
    }

    if (existingQuiz) {
      updateQuiz();
    } else {
      createQuiz();
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {existingQuiz ? "Edit Quiz" : "Create Quiz"} — {lessonTitle}
          </DialogTitle>
        </DialogHeader>

        {isLoadingQuiz ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quiz Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quiz Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter quiz title"
                />
              </div>
              <div className="space-y-2">
                <Label>Passing Score (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={passingScore}
                  onChange={(e) =>
                    setPassingScore(parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">
                  Questions ({questions.length})
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addQuestion}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Question
                </Button>
              </div>

              {questions.map((q, qIndex) => (
                <div
                  key={qIndex}
                  className="border rounded-lg p-4 space-y-3 bg-muted/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-muted-foreground bg-muted rounded-full px-2 py-0.5 mt-1">
                      Q{qIndex + 1}
                    </span>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        value={q.prompt}
                        onChange={(e) =>
                          updateQuestion(qIndex, "prompt", e.target.value)
                        }
                        placeholder="Enter question..."
                        rows={2}
                        className="resize-none"
                      />
                      <div className="flex gap-3 items-center">
                        <Select
                          value={q.type}
                          onValueChange={(val) =>
                            updateQuestion(qIndex, "type", val)
                          }
                        >
                          <SelectTrigger className="w-[180px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SINGLE_CHOICE">
                              Single Choice
                            </SelectItem>
                            <SelectItem value="MULTIPLE_CHOICE">
                              Multiple Choice
                            </SelectItem>
                            <SelectItem value="TRUE_FALSE">
                              True / False
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1">
                          <Label className="text-xs text-muted-foreground">
                            Points:
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            value={q.points}
                            onChange={(e) =>
                              updateQuestion(
                                qIndex,
                                "points",
                                parseInt(e.target.value) || 1,
                              )
                            }
                            className="w-16 h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                      onClick={() => removeQuestion(qIndex)}
                      disabled={questions.length <= 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Options */}
                  <div className="pl-8 space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Answer Options
                    </Label>
                    {q.options.map((opt, oIndex) => (
                      <div
                        key={oIndex}
                        className="flex items-center gap-2 group"
                      >
                        <button
                          type="button"
                          className={`shrink-0 rounded-full p-0.5 transition-colors ${
                            opt.is_correct
                              ? "text-green-600"
                              : "text-muted-foreground/30 hover:text-muted-foreground"
                          }`}
                          onClick={() =>
                            updateOption(
                              qIndex,
                              oIndex,
                              "is_correct",
                              !opt.is_correct,
                            )
                          }
                          title={
                            opt.is_correct
                              ? "Correct answer"
                              : "Mark as correct"
                          }
                        >
                          {opt.is_correct ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )}
                        </button>
                        <Input
                          value={opt.text}
                          onChange={(e) =>
                            updateOption(qIndex, oIndex, "text", e.target.value)
                          }
                          placeholder={`Option ${oIndex + 1}...`}
                          className="h-8 text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={() => removeOption(qIndex, oIndex)}
                          disabled={q.options.length <= 2}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground h-7"
                      onClick={() => addOption(qIndex)}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Option
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {existingQuiz && (
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Delete this quiz? This cannot be undone.")) {
                  deleteQuiz();
                }
              }}
              disabled={isDeleting || isSaving}
              className="mr-auto"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Quiz
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoadingQuiz}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingQuiz ? "Update Quiz" : "Create Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
