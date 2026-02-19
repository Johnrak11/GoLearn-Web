import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Login - GoLearn Admin",
  description: "Login to access the dashboard",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex-col justify-between p-12 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.15) 2px, transparent 0)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>
        {/* Glowing orb effects */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="GoLearn"
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <span className="text-xl font-bold tracking-tight">GoLearn</span>
        </div>

        {/* Feature highlights */}
        <div className="relative z-10 space-y-6">
          <blockquote className="text-2xl font-light leading-relaxed italic text-white/90">
            &ldquo;The platform that empowers educators to create, manage, and
            deliver world-class learning experiences.&rdquo;
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-lg font-bold">
              G
            </div>
            <div>
              <p className="font-medium">GoLearn Admin</p>
              <p className="text-sm text-white/60">
                Course Management Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-2xl font-bold">500+</p>
            <p className="text-xs text-white/50">Active Courses</p>
          </div>
          <div>
            <p className="text-2xl font-bold">10K+</p>
            <p className="text-xs text-white/50">Students</p>
          </div>
          <div>
            <p className="text-2xl font-bold">98%</p>
            <p className="text-xs text-white/50">Satisfaction</p>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12 bg-muted/30">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
            <div className="lg:hidden flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="GoLearn Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="text-lg font-bold text-primary">GoLearn</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in to your instructor or admin account
              </p>
            </div>
          </div>

          {/* Login card */}
          <div className="rounded-2xl bg-card text-card-foreground shadow-xl ring-1 ring-black/5 p-8">
            <LoginForm />
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary font-medium"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary font-medium"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
