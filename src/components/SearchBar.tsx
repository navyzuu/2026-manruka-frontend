interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Cari data...", className = "" }: SearchBarProps) {
    return (
        <div className={`relative w-full ${className}`}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
            </div>
            <input 
                type="text" 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="block w-full p-2.5 pl-10 text-sm text-slate-900 border border-slate-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm focus:shadow-md" 
                placeholder={placeholder} 
            />
        </div>
    );
}