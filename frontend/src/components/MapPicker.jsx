import { useState } from 'react';
import apiClient from '../api/client';

export default function MapPicker({ onLocationSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 2) {
      setLoading(true);
      try {
        const response = await apiClient.get(`/maps/search?query=${val}`);
        setResults(response.data.results);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    } else {
      setResults([]);
    }
  };

  const handleSelect = async (place_id) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/maps/place/${place_id}`);
      setSelectedPlace(response.data);
      onLocationSelect(response.data);
      setResults([]);
      setQuery(response.data.name);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
      <input 
        type="text" 
        value={query}
        onChange={handleSearch}
        placeholder="Search Google Maps..."
        className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {loading && <div className="absolute right-3 top-9 text-sm text-slate-500">...</div>}
      
      {results.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-slate-200 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map((r) => (
            <li 
              key={r.place_id} 
              onClick={() => handleSelect(r.place_id)}
              className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
            >
              <div className="font-medium text-sm">{r.structured_formatting?.main_text || r.description}</div>
              <div className="text-xs text-slate-500">{r.structured_formatting?.secondary_text}</div>
            </li>
          ))}
        </ul>
      )}
      
      {selectedPlace && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
          <p className="font-bold text-blue-900">{selectedPlace.name}</p>
          <p className="text-blue-700">{selectedPlace.address}</p>
        </div>
      )}
    </div>
  );
}
