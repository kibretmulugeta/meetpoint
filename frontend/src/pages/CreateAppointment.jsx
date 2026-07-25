import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import MapPicker from '../components/MapPicker';
import ContactPicker from '../components/ContactPicker';

export default function CreateAppointment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  
  const [location, setLocation] = useState(null);
  const [participants, setParticipants] = useState([]);

  const handleAddParticipant = (p) => {
    if (!participants.find(existing => existing.email === p.email)) {
      setParticipants([...participants, p]);
    }
  };

  const removeParticipant = (email) => {
    setParticipants(participants.filter(p => p.email !== email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      alert("Please select a location");
      return;
    }
    
    setLoading(true);
    try {
      // Combine date and time to proper ISO UTC strings
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
      
      const payload = {
        title: formData.title,
        description: formData.description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        timezone: formData.timezone,
        location: location,
        participants: participants
      };
      
      await apiClient.post('/appointments', payload);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("Failed to create appointment");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Create Appointment</h1>
          <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-800">Cancel</button>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
          
          {/* Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b pb-2">1. Appointment Details</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Project Meeting" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" rows="3"></textarea>
            </div>
          </div>
          
          {/* Date & Time */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b pb-2">2. Date & Time</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                <input required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                <input required type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none" />
              </div>
            </div>
          </div>
          
          {/* Location */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b pb-2">3. Location</h2>
            <MapPicker onLocationSelect={setLocation} />
          </div>
          
          {/* Participants */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b pb-2">4. Participants</h2>
            <ContactPicker onParticipantAdd={handleAddParticipant} />
            
            {participants.length > 0 && (
              <div className="mt-4 space-y-2">
                {participants.map(p => (
                  <div key={p.email} className="flex justify-between items-center bg-slate-50 px-4 py-2 rounded-md border border-slate-200">
                    <div>
                      <p className="font-semibold text-sm">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.email}</p>
                    </div>
                    <button type="button" onClick={() => removeParticipant(p.email)} className="text-red-500 text-sm font-semibold hover:text-red-700">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Appointment & Send Invites'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
