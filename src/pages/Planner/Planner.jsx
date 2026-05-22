import React, { useState, useEffect, useMemo } from 'react';
import { Clock, ChevronLeft, ChevronRight, Plus, Trash2, Search, SlidersHorizontal, Save } from 'lucide-react';
import DataTable from '../../components/DataTable';
import ModalForm from '../../components/ModalForm';
import ModalAlert from '../../components/ModalAlert';
import { getTasks, saveTasks, getCompletions, saveCompletions } from '../../utils/storageManager';
import { getCategoryEmoji } from '../../utils/helpers';

const formatDateLocal = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function Planner() {
  const [selectedDate, setSelectedDate] = useState(formatDateLocal(new Date()));
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [weekOffset, setWeekOffset] = useState(0);
  
  const [masterTasks, setMasterTasks] = useState([]);
  const [completions, setCompletions] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showFrogModal, setShowFrogModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Total');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDuration, setFilterDuration] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFrog, setFilterFrog] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'success', title: '', message: '', onConfirm: () => {} });

  // Custom categories list loaded from localStorage if it exists
  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem('index_custom_categories');
    return saved ? JSON.parse(saved) : ['Work', 'Meeting', 'Call', 'Personal', 'Review', 'Break', 'Health'];
  });

  const durationOptions = ['Morning', 'Afternoon', 'Evening', 'Night'];
  const priorityOptions = ['Low', 'Medium', 'High'];

  // Form states
  const [formData, setFormData] = useState({
    date: selectedDate
  });

  // Dynamic row array of descriptions, duration, category, and priority selections
  const [tasksList, setTasksList] = useState([
    { description: '', duration: 'Morning', category: customCategories[0] || 'Work', priority: '' }
  ]);

  // Keep date sync when active date selector changes
  useEffect(() => {
    setFormData({ date: selectedDate });
  }, [selectedDate]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDuration, filterCategory, filterFrog, activeFilter, selectedDate]);

  // Load tasks and completions
  useEffect(() => {
    setMasterTasks(getTasks());
    setCompletions(getCompletions());
  }, []);

  const [committedDoneTaskIds, setCommittedDoneTaskIds] = useState([]);

  // Hide already Done tasks on load or date change
  useEffect(() => {
    const tasks = getTasks();
    const doneIds = tasks
      .filter(t => (!t.date || t.date === selectedDate) && t.selectValue === 'Done')
      .map(t => t.id);
    setCommittedDoneTaskIds(doneIds);
  }, [selectedDate]);

  // Generate current week dates
  const weekDates = useMemo(() => {
    const dates = [];
    const curr = new Date();
    curr.setDate(curr.getDate() + (weekOffset * 7));
    
    // Start from Monday
    const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1); 
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(curr.getFullYear(), curr.getMonth(), first + i);
      dates.push(day);
    }
    return dates;
  }, [weekOffset]);

  const headers = ['Action', 'Status', 'Remarks', 'Time', 'Task Description', 'Category'];

  // Map master tasks to include date-specific completion status & priority
  const filteredTasks = useMemo(() => {
    const dateCompletions = completions[selectedDate] || [];
    const mapped = masterTasks
      .filter(task => !task.date || task.date === selectedDate) // Show recurring task OR task scheduled for this specific date
      .map(task => {
        const isDone = dateCompletions.includes(task.id);
        let calculatedStatus = 'Pending';
        if (isDone) {
          calculatedStatus = 'Completed';
        } else if (task.category === 'Review' || task.category === 'Call') {
          calculatedStatus = 'Delayed';
        } else if (task.duration === 'Morning' || task.duration === 'Afternoon') {
          calculatedStatus = 'Progress';
        }
        return {
          ...task,
          time: task.duration,
          status: calculatedStatus
        };
      });

    let result = mapped.filter(t => !committedDoneTaskIds.includes(t.id));

    if (activeFilter === 'Active') {
      result = result.filter(t => t.status !== 'Completed');
    } else if (activeFilter === 'Completed') {
      result = result.filter(t => t.status === 'Completed');
    } else if (activeFilter === 'Pending') {
      result = result.filter(t => t.status === 'Pending');
    } else if (activeFilter === 'Progress') {
      result = result.filter(t => t.status === 'Progress');
    } else if (activeFilter === 'Delayed') {
      result = result.filter(t => t.status === 'Delayed');
    }

    // Search query filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.description.toLowerCase().includes(q));
    }

    // Duration filter
    if (filterDuration) {
      result = result.filter(t => t.duration === filterDuration);
    }

    // Category filter
    if (filterCategory) {
      result = result.filter(t => t.category === filterCategory);
    }

    // Frog task filter
    if (filterFrog === 'Frog') {
      result = result.filter(t => t.priority === 'Frog');
    }

    return result;
  }, [masterTasks, completions, selectedDate, activeFilter, searchQuery, filterDuration, filterCategory, filterFrog, committedDoneTaskIds]);

  // Compute stats for current day's KPI filter cards
  const stats = useMemo(() => {
    const dateCompletions = completions[selectedDate] || [];
    const dayTasks = masterTasks.filter(task => !task.date || task.date === selectedDate);
    const todayStr = formatDateLocal(new Date());
    const currentHour = new Date().getHours();

    // Which time slots are "past" right now (for today's overdue calc)
    // Morning = before 12pm, Afternoon = 12pm-5pm, Evening = 5pm-9pm, Night = 9pm+
    const passedSlots = new Set();
    if (currentHour >= 12) passedSlots.add('Morning');
    if (currentHour >= 17) passedSlots.add('Afternoon');
    if (currentHour >= 21) passedSlots.add('Evening');

    let total = dayTasks.length;
    let completed = 0;
    let active = 0;
    let pending = 0;
    let progress = 0;
    let delayed = 0;
    let pendingFrogs = 0;
    let overdue = 0;

    dayTasks.forEach(task => {
      const isDone = dateCompletions.includes(task.id);
      if (isDone) {
        completed++;
      } else {
        if (committedDoneTaskIds.includes(task.id)) {
          total--;
          return;
        }
        active++;
        if (task.priority === 'Frog') pendingFrogs++;
        if (task.category === 'Review' || task.category === 'Call') {
          delayed++;
        } else if (task.duration === 'Morning' || task.duration === 'Afternoon') {
          progress++;
        } else {
          pending++;
        }

        // Overdue calculation:
        // - Past date → all pending tasks are overdue
        // - Today → only pending tasks whose time slot has already passed
        // - Future date → 0
        if (selectedDate < todayStr) {
          overdue++;
        } else if (selectedDate === todayStr && passedSlots.has(task.duration)) {
          overdue++;
        }
      }
    });

    return { total, active, completed, pending, progress, delayed, pendingFrogs, overdue };
  }, [masterTasks, completions, selectedDate, committedDoneTaskIds]);

  // Get all Frog Tasks for selected date
  const allTodayFrogTasks = useMemo(() => {
    const dateCompletions = completions[selectedDate] || [];
    return masterTasks
      .filter(t => !t.date || t.date === selectedDate)
      .filter(t => t.priority === 'Frog')
      .map(t => ({
        ...t,
        isCompleted: dateCompletions.includes(t.id)
      }));
  }, [masterTasks, completions, selectedDate]);

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDayNumber = (date) => {
    return date.getDate();
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Toggle completion status for specific date
  const handleToggleStatus = (taskId) => {
    const currentCompleted = completions[selectedDate] || [];
    let newCompleted;
    const isAdding = !currentCompleted.includes(taskId);
    if (!isAdding) {
      newCompleted = currentCompleted.filter(id => id !== taskId);
    } else {
      newCompleted = [...currentCompleted, taskId];
    }
    const updatedCompletions = {
      ...completions,
      [selectedDate]: newCompleted
    };
    setCompletions(updatedCompletions);
    saveCompletions(updatedCompletions);

    if (isAdding) {
      handleUpdateTaskField(taskId, 'selectValue', 'Done');
      setSelectedTaskIds(prev => [...prev, taskId]);
    } else {
      handleUpdateTaskField(taskId, 'selectValue', 'Select');
      setSelectedTaskIds(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleSaveAll = () => {
    saveTasks(masterTasks);
    const doneIds = masterTasks
      .filter(t => (!t.date || t.date === selectedDate) && t.selectValue === 'Done')
      .map(t => t.id);
    setCommittedDoneTaskIds(prev => {
      const merged = new Set([...prev, ...doneIds]);
      return Array.from(merged);
    });
    showAlert('success', 'Saved Successfully!', 'All task updates, remarks, and selections have been saved.');
  };
  
  const handleUpdateTaskField = (taskId, field, value) => {
    const updatedTasks = masterTasks.map(t => {
      if (t.id === taskId) {
        return { ...t, [field]: value };
      }
      return t;
    });
    setMasterTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const handleAddTaskClick = () => {
    setFormData({
      date: selectedDate
    });
    setTasksList([{ description: '', duration: 'Morning', category: customCategories[0] || 'Work', priority: '' }]);
    setShowModal(true);
  };

  const handleAddRow = () => {
    setTasksList([...tasksList, { description: '', duration: 'Morning', category: customCategories[0] || 'Work', priority: '' }]);
  };

  const handleFieldChange = (index, field, value) => {
    const newList = [...tasksList];
    newList[index][field] = value;
    setTasksList(newList);
  };

  const handleRemoveRow = (index) => {
    if (tasksList.length > 1) {
      setTasksList(tasksList.filter((_, i) => i !== index));
    } else {
      setTasksList([{ description: '', duration: 'Morning', category: customCategories[0] || 'Work', priority: '' }]);
    }
  };

  const handleAddCategoryInline = (idx) => {
    const text = (tasksList[idx].newCategoryText || '').trim();
    if (!text) return;
    if (customCategories.includes(text)) {
      handleFieldChange(idx, 'category', text);
      handleFieldChange(idx, 'isCreatingCategory', false);
      return;
    }
    const updated = [...customCategories, text];
    localStorage.setItem('index_custom_categories', JSON.stringify(updated));
    setCustomCategories(updated);
    handleFieldChange(idx, 'category', text);
    handleFieldChange(idx, 'isCreatingCategory', false);
    handleFieldChange(idx, 'newCategoryText', '');
  };

  const handleCategorySelectChange = (idx, value) => {
    if (value === '__NEW__') {
      handleFieldChange(idx, 'isCreatingCategory', true);
    } else {
      handleFieldChange(idx, 'category', value);
    }
  };

  const showAlert = (type, title, message) => {
    setAlertConfig({ isOpen: true, type, title, message, onConfirm: () => {} });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validRows = tasksList.filter(row => row.description.trim().length > 0);

    if (validRows.length === 0) {
      showAlert('error', 'Validation Error', 'Please enter at least one task description.');
      return;
    }

    const newTasks = validRows.map((row, idx) => ({
      id: `TSK-${Date.now()}-${idx}`,
      description: row.description.trim(),
      duration: row.duration,
      category: row.category,
      priority: row.priority,
      date: formData.date,
      selectValue: 'Select',
      status: 'Pending',
      timestamp: new Date().toISOString()
    }));

    const updated = [...masterTasks, ...newTasks];
    saveTasks(updated);
    setMasterTasks(updated);
    showAlert('success', 'Created!', `${validRows.length} task(s) added successfully.`);
    setShowModal(false);
  };

  const renderRow = (item) => (
    <tr key={item.id} className="hover:bg-gray-50 transition-colors text-center text-sm border-b border-gray-100">
      {/* 1. Action Checkbox */}
      <td className="px-2 py-2 w-[60px] whitespace-nowrap">
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={item.status === 'Completed'}
            onChange={() => handleToggleStatus(item.id)}
            className="w-[18px] h-[18px] text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
          />
        </div>
      </td>
      {/* 2. Status Column (Dropdown Done/Pending/Select) */}
      <td className="px-2 py-2 w-[110px] whitespace-nowrap text-center">
        <select
          value={item.status === 'Completed' ? 'Done' : (item.selectValue === 'Done' ? 'Done' : (item.selectValue || 'Select'))}
          onChange={(e) => {
            const val = e.target.value;
            handleUpdateTaskField(item.id, 'selectValue', val);
            if (val === 'Done') {
              // Mark as complete
              const currentCompleted = completions[selectedDate] || [];
              if (!currentCompleted.includes(item.id)) {
                const updated = { ...completions, [selectedDate]: [...currentCompleted, item.id] };
                setCompletions(updated);
                saveCompletions(updated);
                setSelectedTaskIds(prev => [...prev, item.id]);
              }
            } else {
              // Remove from completed
              const currentCompleted = completions[selectedDate] || [];
              if (currentCompleted.includes(item.id)) {
                const updated = { ...completions, [selectedDate]: currentCompleted.filter(id => id !== item.id) };
                setCompletions(updated);
                saveCompletions(updated);
                setSelectedTaskIds(prev => prev.filter(id => id !== item.id));
              }
            }
          }}
          className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
        >
          <option value="Select">Select</option>
          <option value="Pending">Pending</option>
          <option value="Done">Done</option>
        </select>
      </td>
      {/* 3. Remarks Column (Input text box) */}
      <td className="px-2 py-2 w-[180px] whitespace-nowrap text-center">
        <input
          type="text"
          value={item.remarks || ''}
          onChange={(e) => handleUpdateTaskField(item.id, 'remarks', e.target.value)}
          placeholder="Remarks..."
          className="border border-gray-355 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full max-w-[150px] font-medium"
        />
      </td>
      {/* 4. Time */}
      <td className="px-2 py-2 w-[110px] text-gray-900 font-bold whitespace-nowrap text-xs md:text-sm">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-sm leading-none select-none">
            {item.time === 'Morning' ? '🌅' : item.time === 'Afternoon' ? '☀️' : item.time === 'Evening' ? '🌆' : item.time === 'Night' ? '🌙' : '⏰'}
          </span>
          <span>{item.time}</span>
        </div>
      </td>
      {/* 5. Task Description */}
      <td className="px-4 py-2 text-gray-800 text-xs md:text-sm text-center font-medium">
        <div className="flex items-center justify-center gap-2">
          {item.priority === 'Frog' && (
            <span className="text-base select-none flex-shrink-0" title="Frog Task">🐸</span>
          )}
          <span>{item.description}</span>
        </div>
      </td>
      {/* 6. Category */}
      <td className="px-2 py-2 w-[140px] text-gray-700 whitespace-nowrap text-xs md:text-sm text-center">
        <span className="font-extrabold uppercase text-[11px] text-gray-650 tracking-wider flex items-center justify-center gap-1.5 select-none">
          <span>{getCategoryEmoji(item.category)}</span>
          <span>{item.category}</span>
        </span>
      </td>
    </tr>
  );

  const renderCard = (item) => (
    <div key={item.id} className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm space-y-1.5">
      <div className="flex justify-between items-start border-b border-gray-100 pb-1">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 uppercase tracking-widest">
              {getCategoryEmoji(item.category)} {item.category}
            </span>
          </div>
          <h3 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-left flex items-start gap-1.5">
            {item.priority === 'Frog' && (
              <span className="text-base select-none flex-shrink-0" title="Frog Task">🐸</span>
            )}
            <span>{item.description}</span>
          </h3>
        </div>
        <div className="flex ml-2 items-center">
          <input
            type="checkbox"
            checked={item.status === 'Completed'}
            onChange={() => handleToggleStatus(item.id)}
            className="w-5 h-5 text-emerald-650 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
          />
        </div>
      </div>
      <div className="pt-1 flex items-center justify-between text-gray-500">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="text-sm leading-none select-none">
            {item.time === 'Morning' ? '🌅' : item.time === 'Afternoon' ? '☀️' : item.time === 'Evening' ? '🌆' : item.time === 'Night' ? '🌙' : '⏰'}
          </span>
          <span>{item.time}</span>
        </div>
      </div>
      {/* Mobile Card inputs for Status & Remarks */}
      <div className="pt-1.5 border-t border-gray-100 flex flex-col gap-1.5">
      {/* Mobile Card Status select — same fix */}
        <div className="flex items-center justify-between text-xs md:text-sm">
          <span className="font-bold text-gray-500">Status:</span>
          <select
            value={item.status === 'Completed' ? 'Done' : (item.selectValue === 'Done' ? 'Done' : (item.selectValue || 'Select'))}
            onChange={(e) => {
              const val = e.target.value;
              handleUpdateTaskField(item.id, 'selectValue', val);
              if (val === 'Done') {
                const currentCompleted = completions[selectedDate] || [];
                if (!currentCompleted.includes(item.id)) {
                  const updated = { ...completions, [selectedDate]: [...currentCompleted, item.id] };
                  setCompletions(updated);
                  saveCompletions(updated);
                }
              } else {
                const currentCompleted = completions[selectedDate] || [];
                if (currentCompleted.includes(item.id)) {
                  const updated = { ...completions, [selectedDate]: currentCompleted.filter(id => id !== item.id) };
                  setCompletions(updated);
                  saveCompletions(updated);
                }
              }
            }}
            className="border border-gray-300 rounded px-2 py-0.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
          >
            <option value="Select">Select</option>
            <option value="Pending">Pending</option>
            <option value="Done">Done</option>
          </select>
        </div>
        <div className="flex flex-col gap-0.5 text-xs md:text-sm text-left">
          <span className="font-bold text-gray-500">Remarks:</span>
          <input
            type="text"
            value={item.remarks || ''}
            onChange={(e) => handleUpdateTaskField(item.id, 'remarks', e.target.value)}
            placeholder="Enter remarks..."
            className="border border-gray-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full font-medium"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-0 sm:p-2 md:p-4 space-y-2 md:space-y-3 flex flex-col h-full min-h-0">
      {/* ── Today's 5 KPI Count Cards ── */}
      <div className="grid grid-cols-5 gap-1.5 flex-shrink-0">
        {[
          {
            label: 'Total',
            value: stats.total,
            filter: 'Total',
            mobileLabel: 'Total',
            activeCls: 'bg-slate-700 border-slate-800 text-white',
            inactiveCls: 'bg-slate-50 border-slate-200 text-slate-700',
            valueCls: 'text-slate-800'
          },
          {
            label: 'Completed',
            value: stats.completed,
            filter: 'Completed',
            mobileLabel: 'Done',
            activeCls: 'bg-emerald-600 border-emerald-700 text-white',
            inactiveCls: 'bg-emerald-50 border-emerald-200 text-emerald-700',
            valueCls: 'text-emerald-700'
          },
          {
            label: 'Pending',
            value: stats.active - stats.pendingFrogs,
            filter: 'Active',
            mobileLabel: 'Pending',
            activeCls: 'bg-amber-600 border-amber-700 text-white',
            inactiveCls: 'bg-amber-50 border-amber-200 text-amber-700',
            valueCls: 'text-amber-700'
          },
          {
            label: '🐸 Frogs',
            value: stats.pendingFrogs,
            filter: null,
            mobileLabel: '🐸 Frogs',
            activeCls: 'bg-green-700 border-green-800 text-white',
            inactiveCls: 'bg-green-50 border-green-200 text-green-800',
            valueCls: 'text-green-800'
          },
          {
            label: 'Overdue',
            value: stats.overdue,
            filter: null,
            mobileLabel: 'Overdue',
            activeCls: 'bg-rose-600 border-rose-700 text-white',
            inactiveCls: 'bg-rose-50 border-rose-200 text-rose-700',
            valueCls: 'text-rose-700'
          },
        ].map(({ label, value, filter, mobileLabel, activeCls, inactiveCls, valueCls }) => {
          const isActive = filter && activeFilter === filter;
          return (
            <button
              key={label}
              onClick={() => filter && setActiveFilter(filter)}
              className={`flex flex-col items-center justify-center rounded-xl border transition-all font-bold w-full shadow-sm
                h-[44px] md:h-[58px]
                ${ isActive ? activeCls : `${inactiveCls} hover:shadow-md` }
                ${ !filter ? 'cursor-default' : 'active:scale-95' }`}
            >
              {/* Number */}
              <span className={`text-sm md:text-xl font-extrabold leading-none ${ isActive ? 'text-white' : valueCls }`}>
                {value}
              </span>
              {/* Label */}
              <span className={`text-[7px] md:text-[9px] uppercase tracking-tight leading-none mt-0.5 ${ isActive ? 'text-white/80' : 'opacity-70' }`}>
                <span className="md:hidden">{mobileLabel}</span>
                <span className="hidden md:inline">{label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Weekly Date Selector — compact on mobile */}
      <div className="flex flex-col w-full flex-shrink-0">
        <div className="flex items-center gap-1">
          {/* Prev */}
          <button 
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="flex-shrink-0 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300 transition-colors shadow-sm h-[30px] w-[24px] md:h-[44px] md:w-[36px]"
          >
            <ChevronLeft size={13} className="md:hidden" />
            <ChevronLeft size={16} className="hidden md:block" />
          </button>
          
          {/* Day buttons */}
          <div className="flex-1 flex gap-1 md:gap-1.5 items-center">
            {weekDates.map((date, idx) => {
              const dateStr = formatDateLocal(date);
              const isSelected = selectedDate === dateStr;
              const isTodayDate = isToday(date);
              
              let btnClass = '';
              let textDayNameClass = '';
              let textDayNumberClass = '';

              if (isTodayDate) {
                btnClass = isSelected
                  ? 'bg-blue-600 border-blue-700 text-white shadow-md shadow-blue-200 scale-105'
                  : 'bg-blue-500 border-blue-500 text-white shadow-sm hover:bg-blue-600';
                textDayNameClass = 'text-blue-100 font-semibold';
                textDayNumberClass = 'text-white';
              } else if (isSelected) {
                btnClass = 'bg-sky-100 border-sky-300 text-sky-700 font-bold';
                textDayNameClass = 'text-sky-600';
                textDayNumberClass = 'text-sky-900';
              } else {
                btnClass = 'bg-sky-50/40 border-sky-100 text-sky-500 hover:bg-sky-100/30 hover:border-sky-200';
                textDayNameClass = 'text-sky-400 font-medium';
                textDayNumberClass = 'text-sky-700 font-bold';
              }
              
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex flex-col items-center justify-center flex-1 border transition-all rounded md:rounded-lg
                    py-0.5 md:py-1 ${btnClass}`}
                >
                  {/* Day name — very small on mobile */}
                  <span className={`text-[6px] md:text-[9px] uppercase tracking-wide leading-none ${textDayNameClass}`}>
                    {getDayName(date)}
                  </span>
                  {/* Day number */}
                  <span className={`text-[11px] md:text-base font-bold leading-tight mt-0.5 ${textDayNumberClass}`}>
                    {getDayNumber(date)}
                  </span>
                  {/* Today indicator dot */}
                  {isTodayDate && !isSelected && (
                    <span className="w-[3px] h-[3px] rounded-full bg-white mt-0.5 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Next */}
          <button 
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="flex-shrink-0 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300 transition-colors shadow-sm h-[30px] w-[24px] md:h-[44px] md:w-[36px]"
          >
            <ChevronRight size={13} className="md:hidden" />
            <ChevronRight size={16} className="hidden md:block" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden mt-0">
        {/* ══════════════════════════════════════════
             TOOLBAR — Mobile: 2-row  |  Desktop: 1-row
        ══════════════════════════════════════════ */}
        <div className="border-b border-gray-100 bg-white">

          {/* ── ROW 1: always visible ── */}
          <div className="px-3 py-2 flex items-center gap-2">

            {/* Title (desktop only) */}
            <h2 className="hidden md:block text-xs font-extrabold text-gray-800 whitespace-nowrap flex-shrink-0">
              Tasks for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            <div className="hidden md:block h-4 w-px bg-gray-200 flex-shrink-0" />

            {/* Search — full width on mobile */}
            <div className="relative flex-1 md:flex-shrink-0 md:flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="pl-6 pr-2 py-0.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 h-[32px] md:h-[26px] w-full"
              />
            </div>

            {/* Mobile ONLY: Filter toggle button
                - Single click: show/hide filter panel
                - Double click: clear all active filters */}
            <button
              onClick={() => setShowMobileFilters(prev => !prev)}
              onDoubleClick={() => {
                setSearchQuery('');
                setFilterDuration('');
                setFilterCategory('');
                setFilterFrog('');
                setShowMobileFilters(false);
              }}
              className={`md:hidden relative flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                showMobileFilters || filterDuration || filterCategory || filterFrog
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                  : 'bg-white border-gray-300 text-gray-500'
              }`}
              title="Tap to filter · Double-tap to clear all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {(filterDuration || filterCategory || filterFrog) && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
              )}
            </button>

            {/* Desktop: filter controls inline */}
            <div className="hidden md:flex items-center gap-2">
              <select value={filterDuration} onChange={(e) => setFilterDuration(e.target.value)}
                className="border border-gray-300 rounded-lg text-xs px-1.5 bg-white text-gray-700 font-semibold focus:outline-none h-[26px]">
                <option value="">All Times</option>
                {durationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-lg text-xs px-1.5 bg-white text-gray-700 font-semibold focus:outline-none h-[26px]">
                <option value="">All Categories</option>
                {customCategories.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <button onClick={() => setFilterFrog(prev => prev === 'Frog' ? '' : 'Frog')}
                className={`px-2 h-[26px] rounded-lg text-xs font-bold border flex items-center gap-1 transition-all ${
                  filterFrog === 'Frog' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}>
                🐸 Frog Tasks
                {filterFrog === 'Frog' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
              </button>
              {(searchQuery || filterDuration || filterCategory || filterFrog) && (
                <button onClick={() => { setSearchQuery(''); setFilterDuration(''); setFilterCategory(''); setFilterFrog(''); }}
                  className="text-[10px] text-red-500 hover:text-red-700 font-bold hover:underline">Clear</button>
              )}
            </div>


            {/* Selection counter (desktop) */}
            {selectedTaskIds.length > 0 && (
              <span className="flex-shrink-0 px-2 h-[26px] hidden md:flex items-center bg-emerald-600 text-white text-[10px] font-extrabold rounded-lg shadow-sm">
                {selectedTaskIds.length} Selected
              </span>
            )}

            {/* Frog Info (desktop only) */}
            {allTodayFrogTasks.length > 0 && (
              <button onClick={() => setShowFrogModal(true)}
                className="hidden md:flex flex-shrink-0 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg items-center gap-1 px-2 h-[26px] text-xs font-bold shadow-sm transition active:scale-95">
                🐸 Frog Info ({allTodayFrogTasks.filter(t => t.isCompleted).length}/{allTodayFrogTasks.length})
              </button>
            )}

            {/* Save — icon on mobile, text on desktop */}
            <button onClick={handleSaveAll}
              className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center md:px-3 w-8 md:w-auto h-8 md:h-[26px] text-xs font-bold shadow-sm transition active:scale-95"
              title="Save">
              <Save className="w-4 h-4 md:hidden" />
              <span className="hidden md:inline">Save</span>
            </button>

            {/* Add Task — icon on mobile, text on desktop */}
            <button onClick={handleAddTaskClick}
              className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center md:px-3 w-8 md:w-auto h-8 md:h-[26px] text-xs font-semibold shadow-sm transition active:scale-95"
              title="Add Task">
              <Plus className="w-4 h-4 md:hidden" />
              <span className="hidden md:inline">Add Task</span>
            </button>
          </div>

          {/* ── ROW 2 (mobile only): filter panel — 2 sub-rows ── */}
          {showMobileFilters && (
            <div className="md:hidden px-3 pb-2 flex flex-col gap-2">

              {/* Sub-row A: Time + Category */}
              <div className="flex items-center gap-2">
                <select value={filterDuration} onChange={(e) => setFilterDuration(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg text-xs px-2 bg-white text-gray-700 font-semibold focus:outline-none h-[32px]">
                  <option value="">All Times</option>
                  {durationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg text-xs px-2 bg-white text-gray-700 font-semibold focus:outline-none h-[32px]">
                  <option value="">All Categories</option>
                  {customCategories.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              {/* Sub-row B: Frog toggle + Frog Info */}
              <div className="flex items-center gap-2">
                <button onClick={() => setFilterFrog(prev => prev === 'Frog' ? '' : 'Frog')}
                  className={`flex-1 h-[32px] rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    filterFrog === 'Frog' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                  🐸 Frog Tasks
                  {filterFrog === 'Frog' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                </button>
                {allTodayFrogTasks.length > 0 && (
                  <button onClick={() => setShowFrogModal(true)}
                    className="flex-1 h-[32px] bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center justify-center gap-1 text-xs font-bold">
                    🐸 Frog Info ({allTodayFrogTasks.filter(t => t.isCompleted).length}/{allTodayFrogTasks.length})
                  </button>
                )}
              </div>

            </div>
          )}
        </div>

        
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 pt-1">
          <DataTable 
            headers={headers} 
            data={paginatedTasks}
            renderRow={renderRow}
            renderCard={renderCard}
            minWidth="800px"
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalResults={filteredTasks.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* DYNAMIC POPUP MODAL FORM FOR NEW TASKS */}
      <ModalForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Task(s)"
        onSubmit={handleSubmit}
        submitText="Save Schedule"
      >
        <div className="space-y-4 text-left">
          
          {/* Select the date */}
          <div className="space-y-1">
            <label className="block text-[10px] md:text-[11px] text-gray-650 font-bold uppercase tracking-wider">Select the date *</label>
            <input 
              type="date"
              required 
              value={formData.date} 
              onChange={(e) => setFormData({...formData, date: e.target.value})} 
              className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[11px] md:text-[13px] h-[34px] bg-white" 
            />
          </div>

          {/* Dynamic Task List Items - Multi-field Rows */}
          <div className="space-y-3.5 border-t border-gray-150 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Task Item Rows</h4>
                <p className="text-[9px] text-gray-405">Configure duration, category, priority, and description for each task item</p>
              </div>
              <button
                type="button"
                onClick={handleAddRow}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg border border-indigo-200 transition active:scale-95 flex items-center gap-1 shadow-sm"
              >
                <Plus size={12} /> Add Task Row
              </button>
            </div>

            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {tasksList.map((row, idx) => (
                <div key={idx} className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200 relative space-y-2.5 text-left">
                  
                  <div className="flex justify-between items-center border-b border-gray-200 pb-1.5">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">
                      Task Item #{idx + 1}
                    </span>
                    
                    {tasksList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="text-red-500 hover:text-red-750 hover:bg-rose-50 p-1 rounded-md transition"
                        title="Remove task row"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* Task Description Field */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-gray-550 uppercase tracking-wide">Task Description *</label>
                    <input
                      type="text"
                      required
                      placeholder="What needs to be done?"
                      value={row.description}
                      onChange={(e) => handleFieldChange(idx, 'description', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[11px] md:text-[13px] h-[32px] bg-white font-medium shadow-sm"
                    />
                  </div>

                  {/* Grid Fields: Duration, Category, Priority */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Time Select */}
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-gray-550 uppercase tracking-wide">Time *</label>
                      <select
                        required
                        value={row.duration}
                        onChange={(e) => handleFieldChange(idx, 'duration', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[10px] md:text-[12px] h-[32px] bg-white font-medium"
                      >
                        {durationOptions.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* Category Select / Add */}
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-gray-550 uppercase tracking-wide">Category *</label>
                      {row.isCreatingCategory ? (
                        <div className="flex gap-1 items-center">
                          <input
                            type="text"
                            placeholder="New category..."
                            value={row.newCategoryText || ''}
                            onChange={(e) => handleFieldChange(idx, 'newCategoryText', e.target.value)}
                            className="w-full border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[10px] h-[32px] bg-white font-medium"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCategoryInline(idx);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCategoryInline(idx)}
                            className="h-[32px] w-[30px] flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-bold shrink-0"
                            title="Confirm"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFieldChange(idx, 'isCreatingCategory', false)}
                            className="h-[32px] w-[30px] flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-600 rounded text-[11px] shrink-0"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <select
                          required
                          value={row.category}
                          onChange={(e) => handleCategorySelectChange(idx, e.target.value)}
                          className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[10px] md:text-[12px] h-[32px] bg-white font-medium"
                        >
                          {customCategories.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                          <option value="__NEW__">+ New Category...</option>
                        </select>
                      )}
                    </div>

                    {/* Frog Toggle */}
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-gray-550 uppercase tracking-wide">Frog Task?</label>
                      <button
                        type="button"
                        onClick={() => handleFieldChange(idx, 'priority', row.priority === 'Frog' ? '' : 'Frog')}
                        className={`w-full border rounded text-[10px] md:text-[11px] h-[32px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm ${
                          row.priority === 'Frog'
                            ? 'bg-emerald-50 border-emerald-355 text-emerald-700 font-extrabold'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {row.priority === 'Frog' ? '🐸 Frog!' : '🐸 Mark Frog'}
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      </ModalForm>

      <ModalAlert 
        {...alertConfig} 
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })} 
      />

      {/* FROG TASK DETAILS DIALOG MODAL */}
      {showFrogModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden border border-gray-150 animate-in zoom-in-95 duration-200" style={{ maxHeight: '80vh' }}>
            
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50 text-emerald-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐸</span>
                <div>
                  <h2 className="text-sm font-extrabold tracking-tight">Today's Frog Tasks</h2>
                  <p className="text-[10px] text-emerald-600 font-medium">High priority tasks that must be accomplished first</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-250 text-[10px] font-black rounded-full">
                {allTodayFrogTasks.filter(t => t.isCompleted).length} / {allTodayFrogTasks.length} Done
              </span>
            </div>

            {/* Scrollable list of Frog Tasks */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {allTodayFrogTasks.length > 0 ? (
                allTodayFrogTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`p-3 border rounded-xl flex items-center justify-between gap-3 transition-all ${
                      task.isCompleted 
                        ? 'bg-gray-50 border-gray-205 opacity-70' 
                        : 'bg-white border-emerald-150 hover:border-emerald-250 shadow-sm'
                    }`}
                  >
                    <div className="space-y-1 text-left min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded uppercase">
                          {task.duration}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 uppercase">
                          {task.category}
                        </span>
                      </div>
                      <p className={`text-xs font-bold text-gray-800 break-words ${task.isCompleted ? 'line-through text-gray-405 font-semibold' : ''}`}>
                        {task.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(task.id)}
                      className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg border shadow-sm transition-all flex-shrink-0 ${
                        task.isCompleted
                          ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-500 hover:text-white'
                          : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                      }`}
                    >
                      {task.isCompleted ? 'Undo' : '🐸 Eat Frog'}
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 font-bold space-y-2">
                  <span className="text-2xl">💤</span>
                  <p className="text-xs">No Frog tasks scheduled for today.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowFrogModal(false)}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 font-bold border border-gray-300 rounded-xl text-xs shadow-sm transition active:scale-95"
              >
                Close Dialog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
