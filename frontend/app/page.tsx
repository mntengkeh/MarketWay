import Image from "next/image";
import Link from "next/link";
import StatCard from "../components/StatCard";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-white font-sans overflow-hidden">
      {/* Hero Section - 60% height */}
      <section className="h-[60vh] w-full flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10 w-full">
          {/* Left Column: Logo */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 animate-float">
              <div className="absolute inset-0 bg-teal-500/30 rounded-full blur-3xl animate-pulse"></div>
              <Image
                src="/logo.png"
                alt="Sabi Market Logo"
                fill
                style={{ objectFit: "contain" }}
                className="drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* Right Column: App Name & CTA */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-cyan-400 to-purple-400">
              Sabi Market
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-md">
              AI-powered product discovery. Find exactly what you need, instantly.
            </p>
            <Link href="/login">
              <button className="group relative px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-full text-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(45,212,191,0.5)] active:scale-95">
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section - 40% height */}
      <section className="h-[40vh] w-full bg-white/5 backdrop-blur-sm border-t border-white/10 flex items-center justify-center p-6">
        <div className="container mx-auto max-w-6xl w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <StatCard
              label="Active Users"
              value="50k+"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              }
            />
            <StatCard
              label="Markets Listed"
              value="120+"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              }
            />
            <StatCard
              label="Products Found"
              value="1.2M"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}
