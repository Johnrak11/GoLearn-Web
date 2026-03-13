import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { RegisterForm } from "@/features/auth/components/register-form";
import { GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Register - DevAcademy",
  description: "Join DevAcademy and share your expertise with the world",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0a0c] text-white flex-col justify-between p-16 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950 opacity-100" />
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
          <div
            className="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"
            style={{ animationDelay: "1.5s" }}
          />
        </div>

        {/* Logo Section */}
        <div className="relative z-10 flex items-center gap-3 group transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
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
              Empower the Next{" "}
              <span className="text-purple-400">Generation</span>
            </h2>
            <p className="text-lg text-white/50 leading-relaxed font-light">
              Join an elite circle of instructors. Transform your knowledge into
              a legacy and reach thousands of passionate developers worldwide.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors group">
              <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-white/90">
                  Curate Global Talent
                </p>
                <p className="text-sm text-white/40">
                  Build courses that define careers and set the standard for
                  digital education.
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
              Specialties
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              10K+
            </p>
            <p className="text-xs font-medium uppercase tracking-widest text-white/30 mt-1">
              Community
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              98%
            </p>
            <p className="text-xs font-medium uppercase tracking-widest text-white/30 mt-1">
              Impact
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel — Register Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-8 py-12 relative text-slate-900">
        <div className="w-full max-w-[440px] space-y-8 relative z-10">
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
              <span className="text-xl font-bold text-slate-800">
                DevAcademy
              </span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Join the Academy
              </h1>
              <p className="text-slate-500">
                Start your journey as a world-class instructor today.
              </p>
            </div>
          </div>

          {/* Register container */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
            <RegisterForm />
          </div>

          <div className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Sign in
            </Link>
          </div>

          <footer className="text-center text-xs text-slate-400 pt-4">
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
