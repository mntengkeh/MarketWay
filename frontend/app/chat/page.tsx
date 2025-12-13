'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import VoiceInput, { speakText } from '@/components/VoiceInput';
import { MARKET_LAYOUT, getPathToLine } from '@/config/market_layout';
import marketDataRaw from '@/marketway_.json';

// Dynamic import for Map to avoid SSR issues
const DynamicMap = dynamic(() => import('@/components/DynamicMap'), { ssr: false });

interface Message {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    hasMapAction?: boolean;
    relatedLineId?: string;
    images?: string[];
}

interface RawMarketData {
    [key: string]: {
        name: string;
        items_sold: string[];
    }
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [activeLineId, setActiveLineId] = useState<string | undefined>(undefined);
    const [path, setPath] = useState<[number, number][] | undefined>(undefined);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const marketData = marketDataRaw as RawMarketData;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Transform raw data for map search logic
    const marketLines = React.useMemo(() => {
        return Object.entries(marketData).map(([key, value]) => ({
            id: key,
            name: value.name,
            items: value.items_sold
        }));
    }, [marketData]);

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: text
        };

        setMessages(prev => [...prev, newMessage]);
        setInputText('');

        // Simulate Bot Response
        setTimeout(() => {
            processBotResponse(text);
        }, 1000);
    };

    const processBotResponse = async (query: string) => {
        const lowerQuery = query.toLowerCase();
        let botText = '';
        let foundLineId: string | undefined;
        let images: string[] = [];

        try {
            // Try Backend API First (using proxy)
            const res = await fetch('/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: query })
            });

            if (!res.ok) throw new Error('API Error');

            const data = await res.json();
            botText = data.answer;
            images = data.images || [];

            if (data.found_lines && data.found_lines.length > 0) {
                foundLineId = data.found_lines[0].id; // Use the first found line for now
            }

        } catch (error) {
            console.warn("Backend unavailable, falling back to local search", error);

            // Fallback: Local Search logic
            const match = marketLines.find(line =>
                line.name.toLowerCase().includes(lowerQuery) ||
                line.items.some(item => item.toLowerCase().includes(lowerQuery))
            );

            if (match) {
                const foundItem = match.items.find(item => item.toLowerCase().includes(lowerQuery));
                const itemText = foundItem ? `You can find ${foundItem}` : `You can find that`;
                botText = `${itemText} in ${match.name} (${match.id}). Would you like to see it on the map?`;
                foundLineId = match.id;
            } else {
                botText = "I'm sorry, I couldn't find that product in the market. Try searching for 'shoes', 'medicine', or 'bags'.";
            }
        }

        const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: botText,
            hasMapAction: !!foundLineId,
            relatedLineId: foundLineId,
            images: images
        };

        setMessages(prev => [...prev, botMessage]);
        speakText(botText);
    };



    const handleViewMap = (lineId: string) => {
        setActiveLineId(lineId);
        const newPath = getPathToLine(lineId);
        setPath(newPath);
        setIsMapOpen(true);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(inputText);
        }
    };

    return (
        <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900/50 p-4">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-purple-500"></div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-purple-400">Sabi Chat</h1>
                </div>

                <button className="flex items-center gap-2 px-4 py-3 bg-teal-600/20 text-teal-300 rounded-lg hover:bg-teal-600/30 transition-colors mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Chat
                </button>

                <div className="flex-1 overflow-y-auto">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent</h3>
                    <div className="space-y-1">
                        <button className="w-full text-left px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors text-sm truncate">
                            Where are shoes?
                        </button>
                        <button className="w-full text-left px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors text-sm truncate">
                            Finding pharmacy
                        </button>
                    </div>
                </div>

                <div className="mt-auto border-t border-slate-800 pt-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs">U</div>
                        <div className="text-sm">
                            <p className="font-medium">User</p>
                            <p className="text-xs text-slate-500">Free Plan</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col relative">
                {/* Map Overlay/Modal */}
                {isMapOpen && (
                    <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-12">
                        <div className="bg-white w-full h-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col relative text-black">
                            <button
                                onClick={() => setIsMapOpen(false)}
                                className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white shadow-md transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="flex-1 relative">
                                <DynamicMap
                                    lines={marketLines}
                                    layout={MARKET_LAYOUT}
                                    activeLineId={activeLineId}
                                    path={path}
                                />
                            </div>
                            <div className="p-4 bg-slate-50 border-t flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">Market Map</h3>
                                    <p className="text-sm text-slate-500">Showing route to selected line.</p>
                                </div>
                                <button
                                    onClick={() => setIsMapOpen(false)}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Image Modal */}
                {selectedImage && (
                    <div className="absolute inset-0 z-[60] flex items-center justify-center" onClick={() => setSelectedImage(null)}>
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-6 right-6 z-10 p-3 bg-white/90 hover:bg-white rounded-full transition-all shadow-lg"
                            aria-label="Close image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={selectedImage}
                            alt="Full view"
                            className="w-screen h-screen object-cover"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}


                {/* Chat Content */}
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-fade-in-up">
                        <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-t from-teal-500/20 to-purple-500/20 flex items-center justify-center relative">
                            <div className="absolute w-16 h-16 bg-gradient-to-r from-teal-400 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                            <div className="w-16 h-16 bg-gradient-to-r from-teal-400 to-purple-500 rounded-full shadow-lg relative z-10"></div>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Ready to find something?</h2>
                        <p className="text-slate-400 max-w-md">
                            Ask me about any product, store, or location in the market. I can guide you there directly.
                        </p>
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <button onClick={() => handleSendMessage("Where can I find shoes?")} className="px-4 py-3 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-sm transition-all text-left">
                                👟 Where can I find shoes?
                            </button>
                            <button onClick={() => handleSendMessage("Show me pharmacies")} className="px-4 py-3 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-sm transition-all text-left">
                                💊 Show me pharmacies
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] md:max-w-xl p-4 rounded-2xl ${msg.sender === 'user'
                                    ? 'bg-teal-600 text-white rounded-tr-sm'
                                    : 'bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700'
                                    }`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>

                                    {/* Display Images if any */}
                                    {msg.images && msg.images.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            {msg.images.map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative h-32 rounded-lg overflow-hidden border border-slate-600 cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => setSelectedImage(img.startsWith('http') ? img : img)}
                                                >
                                                    {/* Using full URL if it starts with http, otherwise assume backend relative path via proxy */}
                                                    <img
                                                        src={img.startsWith('http') ? img : img}
                                                        alt="Market item"
                                                        className="object-cover w-full h-full pointer-events-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {msg.sender === 'bot' && msg.hasMapAction && (
                                        <button
                                            onClick={() => msg.relatedLineId && handleViewMap(msg.relatedLineId)}
                                            className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors w-full justify-center border border-slate-600"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                            </svg>
                                            View on Map
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md">
                    <div className="max-w-4xl mx-auto relative flex items-center gap-3">
                        <div className="flex-1 relative">
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Ask knowing..."
                                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-2xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none h-[52px]"
                                rows={1}
                            />
                            <button
                                onClick={() => handleSendMessage(inputText)}
                                disabled={!inputText.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-teal-500 hover:text-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        <VoiceInput onTranscript={(text) => handleSendMessage(text)} isListening={isListening} setIsListening={setIsListening} />
                    </div>
                    <p className="text-center text-xs text-slate-600 mt-2">
                        Ai can make mistakes, so double check it.
                    </p>
                </div>
            </main>
        </div>
    );
}
