import api from "@/lib/axios";

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: "ACTIVE" | "COMPLETED" | "DROPPED" | "EXPIRED";
  progress_pct: number;
  enrolled_at: string;
  completed_at?: string;
  course?: {
    id: string;
    title: string;
    thumbnail_url: string | null;
    instructor?: {
      full_name: string;
    };
  };
}

export const enrollmentService = {
  checkEnrollmentStatus: async (courseId: string) => {
    const response = await api.get<{ isEnrolled: boolean }>(
      `/enrollments/${courseId}/status`,
    );
    return response.data;
  },

  enrollInCourse: async (courseId: string) => {
    const response = await api.post<Enrollment>(`/enrollments/${courseId}`);
    return response.data;
  },

  getMyEnrollments: async (status?: "in_progress" | "completed") => {
    const params = status ? { status } : {};
    const response = await api.get<{ data: Enrollment[] }>(
      "/enrollments/my-courses",
      { params },
    );
    return response.data.data;
  },
};
