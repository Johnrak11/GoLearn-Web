"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  Clock,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";

// ============ Types ============
interface ExamOption {
  id?: string;
  text: string;
  is_correct: boolean;
}

interface ExamQuestion {
  id?: string;
  prompt: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SINGLE_CHOICE";
  points: number;
  options: ExamOption[];
}

interface Exam {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  passing_score: number;
  time_limit?: number;
  questions: ExamQuestion[];
}

// ============ Service calls ============
const examService = {
  getExam: async (courseId: string): Promise<Exam> => {
    const res = await api.get(`/exams/course/${courseId}`);
    return res.data;
  },
  createExam: async (courseId: string, data: Partial<Exam>): Promise<Exam> => {
    const res = await api.post(`/exams/course/${courseId}`, data);
    return res.data;
  },
  updateExam: async (examId: string, data: Partial<Exam>): Promise<Exam> => {
    const res = await api.patch(`/exams/${examId}`, data);
    return res.data;
  },
  deleteExam: async (examId: string) => {
    const res = await api.delete(`/exams/${examId}`);
    return res.data;
  },
};

interface ExamEditorProps {
  courseId: string;
}

// ============ Main Component ============
export function ExamEditor({ courseId }: ExamEditorProps) {
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("Final Exam");
  const [description, setDescription] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState<number | "">("");
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);

  // Fetch existing exam
  const {
    data: exam,
    isLoading,
    isError,
  } = useQuery<Exam>({
    queryKey: ["exam", courseId],
    queryFn: () => examService.getExam(courseId),
    retry: false,
  });

  // Populate from existing
  useEffect(() => {
    if (exam) {
      setTitle(exam.title);
      setDescription(exam.description || "");
      setPassingScore(exam.passing_score);
      setTimeLimit(exam.time_limit ?? "");
      setQuestions(
        exam.questions.map((q) => ({
          prompt: q.prompt,
          type: q.type,
          points: q.points,
          options: q.options.map((o) => ({
            text: o.text,
            is_correct: o.is_correct,
          })),
        })),
      );
    }
  }, [exam]);

  // Mutations
  const { mutate: createExam, isPending: isCreating } = useMutation({
    mutationFn: () =>
      examService.createExam(courseId, {
        title,
        description,
        passing_score: passingScore,
        time_limit: timeLimit === "" ? undefined : Number(timeLimit),
        questions,
      } as Partial<Exam>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam", courseId] });
      setIsEditing(false);
      alert("Exam created!");
    },
    onError: (e: Error & { response?: { data?: { error?: string } } }) =>
      alert(e?.response?.data?.error || "Failed to create exam"),
  });

  const { mutate: updateExam, isPending: isUpdating } = useMutation({
    mutationFn: () =>
      examService.updateExam(exam!.id, {
        title,
        description,
        passing_score: passingScore,
        time_limit: timeLimit === "" ? undefined : Number(timeLimit),
        questions,
      } as Partial<Exam>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam", courseId] });
      setIsEditing(false);
      alert("Exam updated!");
    },
    onError: () => alert("Failed to update exam"),
  });

  const { mutate: deleteExam, isPending: isDeleting } = useMutation({
    mutationFn: () => examService.deleteExam(exam!.id),
    onSuccess: () => {
      // Use removeQueries to immediately clear the cache (invalidateQueries would
      // re-fetch and get a 404 but keep stale data visible until then)
      queryClient.removeQueries({ queryKey: ["exam", courseId] });
    },
    onError: () => alert("Failed to delete exam"),
  });

  const handleStartCreate = () => {
    setTitle("Final Exam");
    setDescription("");
    setPassingScore(70);
    setTimeLimit("");
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
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("Exam title is required");
      return;
    }
    if (questions.length === 0) {
      alert("Add at least one question");
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.prompt.trim()) {
        alert(`Question ${i + 1} needs a prompt`);
        return;
      }
      if (q.options.length < 2) {
        alert(`Question ${i + 1} needs at least 2 options`);
        return;
      }
      if (!q.options.some((o) => o.is_correct)) {
        alert(`Question ${i + 1} needs a correct answer`);
        return;
      }
      if (q.options.some((o) => !o.text.trim())) {
        alert(`Question ${i + 1} has an empty option`);
        return;
      }
    }
    exam ? updateExam() : createExam();
  };

  // ───── Question helpers ─────
  const addQuestion = () =>
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

  const removeQuestion = (i: number) =>
    setQuestions(questions.filter((_, idx) => idx !== i));

  const updateQuestion = (
    i: number,
    field: keyof ExamQuestion,
    value: string | number,
  ) => {
    const q = [...questions];
    if (field === "prompt") q[i].prompt = value as string;
    else if (field === "type") q[i].type = value as ExamQuestion["type"];
    else if (field === "points") q[i].points = value as number;
    setQuestions(q);
  };

  const addOption = (qi: number) => {
    const q = [...questions];
    q[qi].options.push({ text: "", is_correct: false });
    setQuestions(q);
  };

  const removeOption = (qi: number, oi: number) => {
    const q = [...questions];
    q[qi].options = q[qi].options.filter((_, idx) => idx !== oi);
    setQuestions(q);
  };

  const toggleCorrect = (qi: number, oi: number) => {
    const q = [...questions];
    if (q[qi].type === "MULTIPLE_CHOICE") {
      q[qi].options[oi].is_correct = !q[qi].options[oi].is_correct;
    } else {
      q[qi].options = q[qi].options.map((o, idx) => ({
        ...o,
        is_correct: idx === oi,
      }));
    }
    setQuestions(q);
  };

  const updateOptionText = (qi: number, oi: number, text: string) => {
    const q = [...questions];
    q[qi].options[oi].text = text;
    setQuestions(q);
  };

  const isSaving = isCreating || isUpdating;

  // ─────────────────────── NO EXAM + NOT EDITING ───────────────────────
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!exam && !isEditing && isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
        <div className="rounded-full bg-muted p-5">
          <ClipboardCheck className="h-10 w-10 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">No Final Exam Yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Create a final exam that students can take after completing all
            lessons. Students must finish all lessons to unlock the exam.
          </p>
        </div>
        <Button onClick={handleStartCreate}>
          <Plus className="mr-2 h-4 w-4" /> Create Final Exam
        </Button>
      </div>
    );
  }

  // ─────────────────────── VIEW MODE ───────────────────────
  if (exam && !isEditing) {
    return (
      <div className="space-y-6">
        {/* Exam Summary Card */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">{exam.title}</h3>
            {exam.description && (
              <p className="text-sm text-muted-foreground">
                {exam.description}
              </p>
            )}
            <div className="flex gap-3 pt-1">
              <Badge variant="outline" className="gap-1">
                <BookOpen className="h-3 w-3" />
                {exam.questions.length} questions
              </Badge>
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                Pass: {exam.passing_score}%
              </Badge>
              {exam.time_limit && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {exam.time_limit} min
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Exam
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Delete this exam? This cannot be undone."))
                  deleteExam();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Questions preview */}
        <div className="space-y-3">
          {exam.questions.map((q, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                  Q{i + 1}
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] uppercase tracking-wide"
                >
                  {q.type.replace("_", " ")}
                </Badge>
                <span className="text-xs text-muted-foreground ml-auto">
                  {q.points} pt{q.points > 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-sm font-medium">{q.prompt}</p>
              <div className="pl-4 space-y-1">
                {q.options.map((o, oi) => (
                  <div key={oi} className="flex items-center gap-2 text-sm">
                    {o.is_correct ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                    )}
                    <span
                      className={
                        o.is_correct
                          ? "font-medium text-green-700"
                          : "text-muted-foreground"
                      }
                    >
                      {o.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─────────────────────── EDIT / CREATE MODE ───────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {exam ? "Edit Final Exam" : "Create Final Exam"}
        </h3>
        <Button
          variant="ghost"
          onClick={() => {
            if (exam) setIsEditing(false);
          }}
          disabled={!exam || isSaving}
        >
          Cancel
        </Button>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Exam Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Final Exam"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Passing Score (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Time Limit (min)</Label>
            <Input
              type="number"
              min={1}
              value={timeLimit}
              onChange={(e) =>
                setTimeLimit(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              placeholder="No limit"
            />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description (optional)</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Instructions for students..."
          rows={2}
        />
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">
            Questions ({questions.length})
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addQuestion}
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Question
          </Button>
        </div>

        {questions.map((q, qi) => (
          <div key={qi} className="border rounded-lg p-4 space-y-3 bg-muted/20">
            <div className="flex items-start gap-2">
              <span className="text-xs font-bold bg-muted text-muted-foreground rounded-full px-2 py-0.5 mt-1 shrink-0">
                Q{qi + 1}
              </span>
              <div className="flex-1 space-y-2">
                <Textarea
                  value={q.prompt}
                  onChange={(e) => updateQuestion(qi, "prompt", e.target.value)}
                  placeholder="Question text..."
                  rows={2}
                  className="resize-none"
                />
                <div className="flex gap-3 items-center">
                  <Select
                    value={q.type}
                    onValueChange={(v) => updateQuestion(qi, "type", v)}
                  >
                    <SelectTrigger className="w-[170px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE_CHOICE">
                        Single Choice
                      </SelectItem>
                      <SelectItem value="MULTIPLE_CHOICE">
                        Multiple Choice
                      </SelectItem>
                      <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-muted-foreground">
                      Pts:
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={q.points}
                      onChange={(e) =>
                        updateQuestion(
                          qi,
                          "points",
                          Number(e.target.value) || 1,
                        )
                      }
                      className="w-14 h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                onClick={() => removeQuestion(qi)}
                disabled={questions.length <= 1}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Options */}
            <div className="pl-9 space-y-2">
              <Label className="text-xs text-muted-foreground">
                Answer Options
              </Label>
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2 group">
                  <button
                    type="button"
                    className={`shrink-0 p-0.5 rounded-full transition-colors ${opt.is_correct ? "text-green-600" : "text-muted-foreground/30 hover:text-muted-foreground"}`}
                    onClick={() => toggleCorrect(qi, oi)}
                    title={opt.is_correct ? "Correct" : "Mark correct"}
                  >
                    {opt.is_correct ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </button>
                  <Input
                    value={opt.text}
                    onChange={(e) => updateOptionText(qi, oi, e.target.value)}
                    placeholder={`Option ${oi + 1}...`}
                    className="h-8 text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => removeOption(qi, oi)}
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
                onClick={() => addOption(qi)}
              >
                <Plus className="mr-1 h-3 w-3" /> Add Option
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Save */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {exam ? "Update Exam" : "Create Exam"}
        </Button>
      </div>
    </div>
  );
}
