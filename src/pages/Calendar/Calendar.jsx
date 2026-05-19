import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Daily from './Daily';
import Weekly from './Weekly';
import Monthly from './Monthly';
import { getTasks, getCompletions, saveCompletions } from '../../utils/storageManager';

export default function Calendar() {
  const [view, setView] = useState('Monthly'); // Today, Weekly, Monthly
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Load tasks & completions from storage
  const [tasks, setTasks] = useState([]);
  const [completions, setCompletions] = useState({});

  useEffect(() => {
    setTasks(getTasks());
    setCompletions(getCompletions());
  }, []);

  const handleToggleStatus = (taskId, dateStr) => {
    const currentCompleted = completions[dateStr] || [];
    let updated;
    if (currentCompleted.includes(taskId)) {
      updated = currentCompleted.filter(id => id !== taskId);
    } else {
      updated = [...currentCompleted, taskId];
    }
    const newCompletions = { ...completions, [dateStr]: updated };
    setCompletions(newCompletions);
    saveCompletions(newCompletions);
  };

  // Helper to generate days for the monthly grid
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  // Helper to format Date to YYYY-MM-DD
  const formatDateStr = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Dynamically compute Frog tasks events list for the views
  const events = useMemo(() => {
    const list = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (view === 'Monthly') {
      const days = new Date(year, month + 1, 0).getDate();
      for (let d = 1; d <= days; d++) {
        const dateObj = new Date(year, month, d);
        const dateStr = formatDateStr(dateObj);
        const doneIds = completions[dateStr] || [];
        
        const activeTasks = tasks.filter(t => !t.date || t.date === dateStr);
        const pendingTasksForDay = activeTasks.filter(t => !doneIds.includes(t.id));
        
        pendingTasksForDay.forEach(t => {
          list.push({
            id: t.id,
            date: d, // day number for Monthly.jsx matching
            dateStr: dateStr,
            title: t.description,
            time: t.duration,
            type: t.category,
            priority: t.priority,
            isCompleted: false
          });
        });
      }
    }
    else if (view === 'Weekly') {
      const startOfWeek = new Date(currentDate);
      const dayVal = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - dayVal + (dayVal === 0 ? -6 : 1);
      startOfWeek.setDate(diff);

      for (let i = 0; i < 7; i++) {
        const dateObj = new Date(startOfWeek);
        dateObj.setDate(startOfWeek.getDate() + i);
        const dateStr = formatDateStr(dateObj);
        const doneIds = completions[dateStr] || [];
        
        const activeTasks = tasks.filter(t => !t.date || t.date === dateStr);
        const pendingTasksForDay = activeTasks.filter(t => !doneIds.includes(t.id));
        
        pendingTasksForDay.forEach(t => {
          list.push({
            id: t.id,
            date: dateObj.getDate(), // day number for Weekly.jsx matching
            dateStr: dateStr,
            title: t.description,
            time: t.duration,
            type: t.category,
            priority: t.priority,
            isCompleted: false
          });
        });
      }
    }
    else {
      // Today (Daily)
      const dateStr = formatDateStr(currentDate);
      const doneIds = completions[dateStr] || [];
      const activeTasks = tasks.filter(t => !t.date || t.date === dateStr);
      const pendingTasksForDay = activeTasks.filter(t => !doneIds.includes(t.id));
      
      pendingTasksForDay.forEach(t => {
        list.push({
          id: t.id,
          date: currentDate.getDate(),
          dateStr: dateStr,
          title: t.description,
          time: t.duration,
          type: t.category,
          priority: t.priority,
          isCompleted: false
        });
      });
    }

    return list;
  }, [tasks, completions, currentDate, view]);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'Monthly') newDate.setMonth(newDate.getMonth() - 1);
    else if (view === 'Weekly') newDate.setDate(newDate.getDate() - 7);
    else if (view === 'Today') newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };
  
  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'Monthly') newDate.setMonth(newDate.getMonth() + 1);
    else if (view === 'Weekly') newDate.setDate(newDate.getDate() + 7);
    else if (view === 'Today') newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  return (
    <div className="p-0 sm:p-2 md:p-6 space-y-2 md:space-y-6 flex flex-col h-full min-h-0">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3.5 w-full border-b border-gray-100 pb-3">
        
        <div className="flex bg-gray-100 rounded-lg p-1 shadow-inner w-full sm:w-auto">
          {['Today', 'Weekly', 'Monthly'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-md transition-all ${view === v ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3.5 w-full sm:w-auto">
          <h2 className="text-xs sm:text-sm md:text-base font-bold text-gray-700 truncate">
            {view === 'Monthly' && currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            {view === 'Weekly' && `Week of ${currentDate.toLocaleString('default', { month: 'short', day: 'numeric' })}`}
            {view === 'Today' && currentDate.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
          <div className="flex gap-1 items-center">
            <button onClick={handlePrev} className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm text-gray-600 active:scale-95"><ChevronLeft size={16} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm text-[10px] font-bold text-gray-700 active:scale-95">Today</button>
            <button onClick={handleNext} className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm text-gray-600 active:scale-95"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {view === 'Monthly' && <Monthly events={events} currentDate={currentDate} onToggleStatus={handleToggleStatus} />}
        {view === 'Weekly' && <Weekly events={events} currentDate={currentDate} onToggleStatus={handleToggleStatus} />}
        {view === 'Today' && <Daily events={events} onToggleStatus={handleToggleStatus} />}
      </div>

    </div>
  );
}
