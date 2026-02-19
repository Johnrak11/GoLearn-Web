import api from "@/lib/axios";
import { z } from "zod";

// Zod schema matching backend expectation
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    roles: string[];
    avatar_url: string | null;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },
};
