import api from "@/lib/axios";

export interface Course {
  id: string;
  title: string;
  description?: string;
  course_image: string;
  preview_video: string;
  instructor: {
    name: string;
    rating: number;
  };
  curriculum?: CurriculumModule[];
  pricing: {
    amount: number;
    currency: string;
    discount_available: boolean;
  };
  tags: string[];
  // Dashboard-only fields (from /my-courses)
  slug?: string;
  thumbnail_url?: string | null;
  price?: number;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  created_at?: string;
  modules?: Module[];
  _count?: {
    enrollments: number;
    modules: number;
  };
}

export interface CurriculumModule {
  module_id: number;
  title: string;
  lessons: CurriculumLesson[];
}

export interface CurriculumLesson {
  id: string;
  title: string;
  type: string;
  duration_minutes: number;
  video_url: string;
  resources?: string[];
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  type: "VIDEO" | "TEXT" | "QUIZ" | "PDF";
  order_index: number;
  is_free_preview: boolean;
  video?: {
    id: string;
    url: string | null;
    duration: number;
    status: string;
  } | null;
}

export const coursesService = {
  // ============ Course ============
  getMyCourses: async (search?: string) => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    const response = await api.get<Course[]>("/courses/my-courses", { params });
    return response.data;
  },

  getPublishedCourses: async (search?: string) => {
    const params = search ? { search } : {};
    const response = await api.get<Course[]>("/courses", { params });
    return response.data;
  },

  createCourse: async (data: {
    title: string;
    description: string;
    price: number;
    image_url?: string;
  }) => {
    const response = await api.post("/courses", data);
    return response.data;
  },

  getCourseById: async (id: string) => {
    const response = await api.get<Course>(`/courses/${id}`);
    return response.data;
  },

  getCourseByIdRaw: async (id: string) => {
    const response = await api.get<Course>(`/courses/${id}/raw`);
    return response.data;
  },

  updateCourse: async (
    id: string,
    data: {
      title?: string;
      description?: string;
      price?: number;
      image_url?: string;
    },
  ) => {
    const response = await api.patch(`/courses/${id}`, data);
    return response.data;
  },

  deleteCourse: async (id: string) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  toggleCourseStatus: async (
    id: string,
    status: "PUBLISHED" | "DRAFT" | "ARCHIVED",
  ) => {
    const response = await api.patch(`/courses/${id}/status`, { status });
    return response.data;
  },

  // ============ Modules ============
  createModule: async (courseId: string, title: string) => {
    const response = await api.post<Module>(`/courses/${courseId}/modules`, {
      title,
    });
    return response.data;
  },

  updateModule: async (moduleId: string, title: string) => {
    const response = await api.patch<Module>(`/courses/modules/${moduleId}`, {
      title,
    });
    return response.data;
  },

  deleteModule: async (moduleId: string) => {
    const response = await api.delete(`/courses/modules/${moduleId}`);
    return response.data;
  },

  // ============ Lessons ============
  createLesson: async (
    moduleId: string,
    data: {
      title: string;
      type: string;
      videoUrl?: string;
      content?: string;
      duration?: number;
      isFree?: boolean;
    },
  ) => {
    const response = await api.post<Lesson>(
      `/courses/modules/${moduleId}/lessons`,
      data,
    );
    return response.data;
  },

  updateLesson: async (
    lessonId: string,
    data: {
      title?: string;
      type?: string;
      videoUrl?: string;
      content?: string;
      duration?: number;
      isFree?: boolean;
    },
  ) => {
    const response = await api.patch<Lesson>(
      `/courses/lessons/${lessonId}`,
      data,
    );
    return response.data;
  },

  deleteLesson: async (lessonId: string) => {
    const response = await api.delete(`/courses/lessons/${lessonId}`);
    return response.data;
  },
};
