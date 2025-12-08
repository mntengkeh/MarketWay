import React from 'react';

interface StatCardProps {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => {
    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg transition-transform hover:scale-105">
            {icon && <div className="mb-2 text-teal-400">{icon}</div>}
            <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
            <p className="text-sm text-gray-300 uppercase tracking-widest">{label}</p>
        </div>
    );
};

export default StatCard;
