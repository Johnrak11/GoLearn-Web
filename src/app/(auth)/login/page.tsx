import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/features/auth/components/login-form";
import { LayoutDashboard } from "lucide-react";
export const metadata: Metadata = {
  title: "Login - DevAcademy",
  description: "Sign in to your DevAcademy instructor or admin account",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0a0c] text-white flex-col justify-between p-16 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 opacity-100" />
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
          <div
            className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-purple-500/10 rounded-full blur-[100px] animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        {/* Logo Section */}
        <div className="relative z-10 flex items-center gap-3 group transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
            <Image
              src="/logo.png"
              alt="DevAcademy"
              width={32}
              height={32}
              className="h-8 w-8 brightness-0 invert"
            />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            DevAcademy
          </span>
        </div>

        {/* Feature highlights */}
        <div className="relative z-10 space-y-10 max-w-lg">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight">
              Master the Art of{" "}
              <span className="text-indigo-400">Digital Creation</span>
            </h2>
            <p className="text-lg text-white/50 leading-relaxed font-light">
              The professional environment for architects of the future. Create,
              manage, and scale your educational empire with pinpoint precision.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors group">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-white/90">
                  Unified Control Center
                </p>
                <p className="text-sm text-white/40">
                  Manage every aspect of your teaching workflow from one elegant
                  dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
          <div>
            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              500+
            </p>
            <p className="text-xs font-medium uppercase tracking-widest text-white/30 mt-1">
              Courses
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              10K+
            </p>
            <p className="text-xs font-medium uppercase tracking-widest text-white/30 mt-1">
              Learners
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              98%
            </p>
            <p className="text-xs font-medium uppercase tracking-widest text-white/30 mt-1">
              Growth
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-8 py-12 relative">
        <div className="w-full max-w-[440px] space-y-10 relative z-10">
          {/* Mobile Header */}
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <div className="lg:hidden flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Image
                  src="/logo.png"
                  alt="DevAcademy Logo"
                  width={24}
                  height={24}
                  className="h-6 w-6 brightness-0 invert"
                />
              </div>
              <span className="text-xl font-bold text-slate-900">
                DevAcademy
              </span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h1>
              <p className="text-slate-500">
                Access your professional dashboard to continue creating.
              </p>
            </div>
          </div>

          {/* Login container */}
          <div className="bg-white rounded-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
            <LoginForm />
          </div>

          <div className="text-center text-sm text-slate-500">
            New to the academy?{" "}
            <Link
              href="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Request Access
            </Link>
          </div>

          <footer className="text-center text-xs text-slate-400 pt-8">
            <p>
              &copy; {new Date().getFullYear()} DevAcademy. All rights reserved.
            </p>
            <div className="flex justify-center gap-4 mt-2">
              <Link
                href="/terms"
                className="hover:text-slate-600 transition-colors"
              >
                Terms
              </Link>
              <span>&bull;</span>
              <Link
                href="/privacy"
                className="hover:text-slate-600 transition-colors"
              >
                Privacy
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
