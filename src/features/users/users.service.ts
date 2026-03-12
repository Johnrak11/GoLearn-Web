import api from "@/lib/axios";

export interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  bio: string | null;
  skills: string | null;
  address: string | null;
  headline: string | null;
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
  email?: string;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  skills?: string | null;
  address?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  status?: string;
  roles?: string[];
}

export interface CreateUserDto {
  full_name: string;
  email: string;
  password: string;
  roles: string[];
  status?: string;
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

  getMe: async () => {
    const response = await api.get<User>("/users/me");
    return response.data;
  },

  updateMe: async (data: UpdateUserDto) => {
    const response = await api.patch("/users/me", data);
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

  createUser: async (data: CreateUserDto) => {
    const response = await api.post("/users", data);
    return response.data;
  },
};
