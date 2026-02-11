import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoadingContextType {
    isLoading: boolean;
    navigateWithDelay: (path: string) => void;
    setLoadingManual: (state: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const navigateWithDelay = (path: string) => {
        setIsLoading(true);
        // Delay acak 800ms - 1200ms agar terasa natural
        const delay = Math.floor(Math.random() * 400) + 800;
        
        setTimeout(() => {
            navigate(path);
            setIsLoading(false);
        }, delay); 
    };

    const setLoadingManual = (state: boolean) => setIsLoading(state);

    return (
        <LoadingContext.Provider value={{ isLoading, navigateWithDelay, setLoadingManual }}>
            {/* GLOBAL LOADING OVERLAY */}
            {isLoading && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-300">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute animate-ping inline-flex h-16 w-16 rounded-full bg-primary-400 opacity-75"></div>
                        <div className="relative inline-flex rounded-full h-12 w-12 bg-white items-center justify-center shadow-lg">
                            <svg className="animate-spin h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    </div>
                    <p className="mt-4 text-white font-medium tracking-wider animate-pulse text-sm">Loading</p>
                </div>
            )}
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (!context) throw new Error("useLoading must be used within LoadingProvider");
    return context;
}