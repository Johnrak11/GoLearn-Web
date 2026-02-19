import api from "@/lib/axios";

export interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  status: "ACTIVE" | "INACTIVE" | "BANNED" | "PENDING";
  roles: string[];
  created_at: string;
  enrollments_count: number;
}

export interface UsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateUserDto {
  full_name?: string;
  status?: string;
  roles?: string[];
}

export const usersService = {
  getUsers: async (
    page = 1,
    limit = 10,
    search = "",
    role = "",
    status = "",
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      role,
      status,
    });
    const response = await api.get<UsersResponse>(
      `/users?${params.toString()}`,
    );
    return response.data;
  },

  deleteUser: async (id: string) => {
    await api.delete(`/users/${id}`);
  },

  updateUserStatus: async (id: string, status: string) => {
    await api.put(`/users/${id}`, { status });
  },

  updateUser: async (id: string, data: UpdateUserDto) => {
    await api.put(`/users/${id}`, data);
  },
};
