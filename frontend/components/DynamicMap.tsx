'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the MapComponent with SSR disabled
const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-lg border border-gray-200 flex items-center justify-center text-gray-400">
            Loading Map...
        </div>
    )
});

interface MarketLineData {
    id: string;
    name: string;
    items: string[];
}

interface MarketLayoutData {
    id: string;
    coordinates: [number, number][];
    labelPosition: [number, number];
    color: string;
}

interface DynamicMapProps {
    lines: MarketLineData[];
    layout: Record<string, MarketLayoutData>;
    activeLineId?: string;
    path?: [number, number][];
}

export default function DynamicMap(props: DynamicMapProps) {
    return <MapComponent {...props} />;
}
