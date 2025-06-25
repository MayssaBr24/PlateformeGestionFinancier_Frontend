import React, { useState } from 'react';
import { Search } from 'lucide-react';

const Searchbar = ({ onSearch, isLoading = false }) => {
    const [searchInput, setSearchInput] = useState('');

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
         //  déclenche la recherche que si pas en chargement
            onSearch(value);

    };

    return (
        <div className="relative w-64">
            <div className={`flex items-center bg-white rounded-lg border border-gray-200 px-3 py-2 shadow-sm ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}>
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder={isLoading ? "Chargement..." : "Filtrer la liste"}
                    className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                    value={searchInput}
                    onChange={handleInputChange}
                    disabled={isLoading}
                />
                {isLoading && (
                    <span className="ml-2 text-xs text-gray-500">Chargement...</span>
                )}
            </div>
        </div>
    );
};

export default Searchbar;