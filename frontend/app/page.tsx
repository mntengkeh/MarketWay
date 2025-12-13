import Image from "next/image";
import Link from "next/link";
import StatCard from "../components/StatCard";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-white font-sans overflow-hidden">
      {/* Hero Section - 60% height */}
      <section className="h-[60vh] w-full relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="/friontmarket.jpg"
            alt="Sabi Market"
            fill
            style={{ objectFit: "cover" }}
            className="brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex items-center justify-center p-8">
          <div className="container mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-cyan-400 to-purple-400 mb-6 animate-fade-in">
                Sabi Market
              </h1>
              <p className="text-xl md:text-2xl text-slate-200 max-w-2xl mb-8 leading-relaxed">
                AI-powered product discovery. Find exactly what you need, instantly.
              </p>
              <Link href="/login">
                <button className="group relative px-10 py-5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold rounded-full text-xl transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(45,212,191,0.6)] active:scale-95">
                  <span className="relative z-10 flex items-center gap-3">
                    Get Started
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-6 h-6 group-hover:translate-x-1 transition-transform"
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
        </div>
      </section>

      {/* Stats Section - 30% height */}
      <section className="h-[30vh] w-full bg-white/5 backdrop-blur-sm border-t border-white/10 flex items-center justify-center p-6">
        <div className="container mx-auto max-w-4xl w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <StatCard
              label="Active Users"
              value="50k+"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
              label="Big Market Listed"
              value="1"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
                  className="h-6 w-6"
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
