import React from 'react';

interface StatCardProps {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => {
    return (
        <div className="group relative flex flex-col items-center justify-center p-8 bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(45,212,191,0.3)] hover:border-teal-400/50 overflow-hidden">
            {/* Animated gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 via-cyan-500/0 to-purple-500/0 group-hover:from-teal-500/10 group-hover:via-cyan-500/10 group-hover:to-purple-500/10 transition-all duration-500 rounded-2xl"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
                {icon && (
                    <div className="mb-4 text-teal-400 group-hover:text-teal-300 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                        {icon}
                    </div>
                )}
                <h3 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-100 to-cyan-100 mb-2 group-hover:from-teal-200 group-hover:via-cyan-200 group-hover:to-purple-200 transition-all duration-300">
                    {value}
                </h3>
                <p className="text-sm md:text-base text-slate-300 group-hover:text-slate-200 uppercase tracking-widest font-semibold transition-colors duration-300">
                    {label}
                </p>
            </div>

            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-teal-400/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
    );
};

export default StatCard;
