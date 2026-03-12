"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  authService,
  registerSchema,
  RegisterCredentials,
} from "@/features/auth/auth.service";
import { cn } from "@/lib/utils";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterCredentials>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "student",
    },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: RegisterCredentials) {
    setIsLoading(true);
    setError(null);

    try {
      // Role is now included in the form data
      await authService.register(data);

      window.alert("Account created successfully! Please sign in.");
      router.push("/login");
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error || "Failed to register. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2 mb-2">
            <Label>I want to sign up as a:</Label>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={cn(
                  "border text-sm rounded-lg p-3 cursor-pointer text-center hover:bg-muted font-medium transition-colors",
                  selectedRole === "student"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input",
                )}
                onClick={() => setValue("role", "student")}
              >
                Student
              </div>
              <div
                className={cn(
                  "border text-sm rounded-lg p-3 cursor-pointer text-center hover:bg-muted font-medium transition-colors",
                  selectedRole === "instructor"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input",
                )}
                onClick={() => setValue("role", "instructor")}
              >
                Instructor
              </div>
            </div>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              placeholder="John Doe"
              type="text"
              autoCapitalize="words"
              disabled={isLoading}
              {...register("full_name")}
            />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              autoCapitalize="none"
              autoComplete="new-password"
              disabled={isLoading}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <Button disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </div>
      </form>
    </div>
  );
}
