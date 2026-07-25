import { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
} from 'date-fns';

export default function Calendar({ appointments = [], onDateSelect, onAppointmentClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const jumpToToday = () => setCurrentDate(new Date());

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center py-4 px-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button onClick={jumpToToday} className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
            Today
          </button>
          <button onClick={prevMonth} className="p-1 px-3 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
            &lt;
          </button>
          <button onClick={nextMonth} className="p-1 px-3 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
            &gt;
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-semibold text-sm text-slate-500 py-2">
          {format(addDays(startDate, i), 'EEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;

        // Filter appointments for this day
        const dayAppointments = appointments.filter(app => 
          isSameDay(new Date(app.start_time), cloneDay)
        );

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[100px] border-r border-b border-slate-100 p-2 cursor-pointer transition-colors ${
              !isSameMonth(day, monthStart)
                ? 'bg-slate-50 text-slate-400'
                : isSameDay(day, new Date())
                ? 'bg-blue-50/50'
                : 'hover:bg-slate-50'
            }`}
            onClick={() => onDateSelect && onDateSelect(cloneDay)}
          >
            <div className="flex justify-between items-start">
              <span
                className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                  isSameDay(day, new Date()) ? 'bg-blue-600 text-white' : ''
                }`}
              >
                {formattedDate}
              </span>
            </div>
            
            <div className="mt-1 flex flex-col gap-1">
              {dayAppointments.map(app => (
                <div
                  key={app._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppointmentClick && onAppointmentClick(app);
                  }}
                  className={`text-xs p-1 rounded truncate shadow-sm transition-opacity hover:opacity-80 ${
                    app.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                    app.status === 'tentative' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}
                  title={app.title}
                >
                  {format(new Date(app.start_time), 'h:mm a')} - {app.title}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
