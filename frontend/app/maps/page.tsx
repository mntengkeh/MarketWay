'use client';

import DynamicMap from '../../components/DynamicMap';
import marketDataRaw from '../../marketway_.json';
import { MARKET_LAYOUT, getPathToLine } from '../../config/market_layout';
import Link from 'next/link';
import { useMemo, useState } from 'react';

// Define the shape of the raw JSON
interface RawMarketData {
    [key: string]: {
        name: string;
        items_sold: string[];
    }
}

export default function MapsPage() {
    const marketData = marketDataRaw as RawMarketData;
    const marketName = "Bamenda Main Market";

    // State for Search and Navigation
    const [searchQuery, setSearchQuery] = useState('');
    const [activeLineId, setActiveLineId] = useState<string | undefined>(undefined);
    const [path, setPath] = useState<[number, number][] | undefined>(undefined);

    // Transform raw data into array for the component
    const lines = useMemo(() => {
        return Object.entries(marketData).map(([key, value]) => ({
            id: key,
            name: value.name,
            items: value.items_sold
        }));
    }, [marketData]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const lowerQuery = query.toLowerCase();

        if (!lowerQuery) {
            setActiveLineId(undefined);
            setPath(undefined);
            return;
        }

        // Search logic: Find first line that has the item or matches line name
        const match = lines.find(line =>
            line.name.toLowerCase().includes(lowerQuery) ||
            line.items.some(item => item.toLowerCase().includes(lowerQuery))
        );

        if (match) {
            setActiveLineId(match.id);
            const newPath = getPathToLine(match.id);
            setPath(newPath);
        } else {
            setActiveLineId(undefined);
            setPath(undefined);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{marketName} Map</h1>
                        <p className="text-gray-500 mt-2">Interactive map showing market lines and commodities.</p>
                    </div>

                    {/* Search Bar */}
                    <div className="w-full md:w-96 relative">
                        <input
                            type="text"
                            placeholder="Find product (e.g. shoes)..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                        <div className="absolute right-3 top-3 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <Link
                        href="/"
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors shadow-sm font-medium whitespace-nowrap"
                    >
                        Back to Home
                    </Link>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="w-full">
                        <DynamicMap lines={lines} layout={MARKET_LAYOUT} activeLineId={activeLineId} path={path} />
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lines.map((line) => (
                        <div
                            key={line.id}
                            className={`bg-white p-6 rounded-lg shadow-sm border transition-all ${activeLineId === line.id ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-200 hover:shadow-md'}`}
                        >
                            <h2 className="text-xl font-semibold text-gray-800 mb-3">{line.name} ({line.id})</h2>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {line.items.slice(0, 3).map((item, i) => (
                                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full capitalize">
                                        {item}
                                    </span>
                                ))}
                                {line.items.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                        +{line.items.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
