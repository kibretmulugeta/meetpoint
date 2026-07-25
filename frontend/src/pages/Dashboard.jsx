import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import Calendar from '../components/Calendar';
import { useState } from 'react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await apiClient.get('/appointments');
      return response.data;
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Scheduler</h1>
          <div className="flex items-center gap-4">
            <span className="font-medium">{user?.full_name}</span>
            <button 
              onClick={() => navigate('/appointments/new')}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
            >
              + New Appointment
            </button>
            <button 
              onClick={logout}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
        </header>

        <section className="mb-8">
          <Calendar 
            appointments={appointments || []} 
            onDateSelect={(date) => console.log("Selected date:", date)}
            onAppointmentClick={(app) => setSelectedAppointment(app)}
          />
        </section>

        {selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full m-4">
              <h2 className="text-2xl font-bold mb-2">{selectedAppointment.title}</h2>
              <p className="text-slate-600 mb-4">{new Date(selectedAppointment.start_time).toLocaleString()}</p>
              
              <div className="bg-slate-50 p-4 rounded-lg mb-4">
                <p className="font-semibold">{selectedAppointment.location.name}</p>
                <p className="text-sm text-slate-600">{selectedAppointment.location.address}</p>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Upcoming Appointments List</h2>
            <button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors">
              + New Appointment
            </button>
          </div>
          
          {isLoading ? (
            <p className="text-slate-500">Loading appointments...</p>
          ) : appointments?.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>You have no upcoming appointments.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments?.map(app => (
                <div key={app._id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center hover:border-blue-300 transition-colors cursor-pointer">
                  <div>
                    <h3 className="font-bold text-lg">{app.title}</h3>
                    <p className="text-sm text-slate-600">
                      {new Date(app.start_time).toLocaleString()} at {app.location.name}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${app.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {app.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
