import { useState } from 'react';
import apiClient from '../api/client';

export default function ContactPicker({ onParticipantAdd }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  // Dummy contacts fallback
  const fallbackContacts = [
    { user_id: null, name: 'John Doe', email: 'john@example.com', phone: '+15551234567' },
    { user_id: 'user_xyz', name: 'Jane Smith', email: 'jane@example.com', phone: null }
  ];

  const handleSearch = async (e) => {
    const val = e.target.value;
    setQuery(val);
    
    if (val.length > 1) {
      try {
        const response = await apiClient.get(`/contacts/search?query=${val}`);
        setResults(response.data.results.length > 0 ? response.data.results : fallbackContacts.filter(c => c.name.toLowerCase().includes(val.toLowerCase())));
      } catch {
        setResults(fallbackContacts.filter(c => c.name.toLowerCase().includes(val.toLowerCase())));
      }
    } else {
      setResults([]);
    }
  };

  const handleSelect = (contact) => {
    onParticipantAdd({
      user_id: contact.user_id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      status: 'pending'
    });
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-700 mb-1">Invite Participants</label>
      <input 
        type="text" 
        value={query}
        onChange={handleSearch}
        placeholder="Search contacts by name or email..."
        className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      {results.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-slate-200 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map((r, i) => (
            <li 
              key={i} 
              onClick={() => handleSelect(r)}
              className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 flex justify-between items-center"
            >
              <div>
                <div className="font-medium text-sm">{r.name}</div>
                <div className="text-xs text-slate-500">{r.email}</div>
              </div>
              <button className="text-blue-600 text-xs font-semibold px-2 py-1 bg-blue-50 rounded">Add</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
