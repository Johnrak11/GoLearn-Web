import api from "@/lib/axios";

export interface AdminStats {
  totalUsers: number;
  activeCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  growth: {
    users: string;
    courses: string;
    enrollments: string;
    revenue: string;
  };
}

export interface InstructorStats {
  totalStudents: number;
  activeCourses: number;
  totalEarnings: number;
  growth: {
    students: string;
    revenue: string;
  };
}

export type DashboardStats = AdminStats | InstructorStats;

export const statsService = {
  getDashboardStats: async () => {
    const response = await api.get<DashboardStats>("/stats/dashboard");
    return response.data;
  },
};
