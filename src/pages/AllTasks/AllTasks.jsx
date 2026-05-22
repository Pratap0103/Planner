import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, Clock, Calendar, CheckSquare, Search, AlertCircle, SlidersHorizontal,
  Trash2, Edit, ListTodo, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { getTasks, getCompletions, saveCompletions } from '../../utils/storageManager';
import { getCategoryEmoji, formatDate } from '../../utils/helpers';
import DataTable from '../../components/DataTable';

export default function AllTasks() {
  const [tasks, setTasks] = useState([]);
  const [completions, setCompletions] = useState({});
  
  const [activeKpiFilter, setActiveKpiFilter] = useState('Total'); // Total, Completed, Pending, Frogs, Overdue
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDuration, setFilterDuration] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFrog, setFilterFrog] = useState(''); // "" or "Frog"
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [datePreset, setDatePreset] = useState(''); // 'day' | 'week' | 'month' | ''

  // Pagination states (showing 100 rows by default)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);

  // Base reference date (today)
  const today = useMemo(() => new Date(), []);

  // Custom Categories & Durations
  const [customCategories] = useState(() => {
    const saved = localStorage.getItem('index_custom_categories');
    return saved ? JSON.parse(saved) : ['Work', 'Meeting', 'Call', 'Personal', 'Review', 'Break', 'Health'];
  });
  const durationOptions = ['Morning', 'Afternoon', 'Evening', 'Night'];

  // Load storage data
  useEffect(() => {
    setTasks(getTasks());
    setCompletions(getCompletions());
  }, []);

  // Format date helper
  const formatDateStr = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Get list of all date strings that have completions or represent today (overall data)
  const dateStrings = useMemo(() => {
    const keys = Object.keys(completions);
    const todayStr = formatDateStr(today);
    if (!keys.includes(todayStr)) {
      keys.push(todayStr);
    }
    // Sort dates descending (newest first)
    return keys.sort((a, b) => b.localeCompare(a));
  }, [completions, today]);

  // Build the flat list of task instances for these dates
  const taskInstances = useMemo(() => {
    const list = [];
    dateStrings.forEach(dStr => {
      const doneIds = completions[dStr] || [];
      
      // Filter master tasks that are either recurring template (no date) or explicitly for this date
      const activeTasks = tasks.filter(t => !t.date || t.date === dStr);
      
      activeTasks.forEach(t => {
        const isDone = doneIds.includes(t.id);
        list.push({
          ...t,
          dateInstance: dStr,
          status: isDone ? 'Completed' : 'Pending'
        });
      });
    });
    return list;
  }, [tasks, completions, dateStrings]);

  // Compute overall KPI metrics
  const todayStr = useMemo(() => formatDateStr(today), [today]);

  const kpis = useMemo(() => {
    const activeInstances = taskInstances.filter(t => t.status === 'Completed' || t.selectValue !== 'Done');
    const total = activeInstances.length;
    const completed = activeInstances.filter(t => t.status === 'Completed').length;
    const pending = activeInstances.filter(t => t.status === 'Pending').length;
    const pendingFrog = activeInstances.filter(t => t.status === 'Pending' && t.priority === 'Frog').length;
    const overdue = activeInstances.filter(t => t.status === 'Pending' && t.dateInstance < todayStr).length;

    const categoryPending = {};
    activeInstances.forEach(t => {
      if (t.status === 'Pending') {
        categoryPending[t.category] = (categoryPending[t.category] || 0) + 1;
      }
    });

    return { total, completed, pending, pendingFrog, overdue, categoryPending };
  }, [taskInstances, todayStr]);

  // Toggle status handler
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

  // KPI filter click handler
  const handleKpiClick = (filter) => {
    setActiveKpiFilter(filter);
  };

  // Unified Filtered & Sorted Tasks based on activeKpiFilter
  const filteredTasks = useMemo(() => {
    return taskInstances
      .filter(item => {
        // 1. KPI Filter
        if (activeKpiFilter === 'Completed' && item.status !== 'Completed') return false;
        if (activeKpiFilter === 'Pending' && item.status !== 'Pending') return false;
        if (activeKpiFilter === 'Frogs' && (item.priority !== 'Frog' || item.status !== 'Pending')) return false;
        if (activeKpiFilter === 'Overdue' && (item.status !== 'Pending' || item.dateInstance >= todayStr)) return false;
        // Total Tasks shows both Completed and Pending

        if (filterFrog === 'Frog' && (item.priority !== 'Frog' || item.status !== 'Pending')) return false;

        // 3. Search filter
        if (searchQuery.trim().length > 0) {
          const q = searchQuery.toLowerCase();
          const match = item.description?.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q);
          if (!match) return false;
        }

        // 4. Duration filter
        if (filterDuration && item.duration !== filterDuration) return false;

        // 5. Category filter
        if (filterCategory && item.category !== filterCategory) return false;

        // 6. Date range filter
        if (filterFromDate && item.dateInstance < filterFromDate) return false;
        if (filterToDate   && item.dateInstance > filterToDate)   return false;

        return true;
      })
      .sort((a, b) => {
        if (a.dateInstance !== b.dateInstance) {
          return b.dateInstance.localeCompare(a.dateInstance);
        }
        if (a.priority === 'Frog' && b.priority !== 'Frog') return -1;
        if (a.priority !== 'Frog' && b.priority === 'Frog') return 1;
        return 0;
      });
  }, [taskInstances, searchQuery, filterDuration, filterCategory, filterFrog, filterFromDate, filterToDate, activeKpiFilter, todayStr]);

  // Dynamic Category Counts (respects all active filters except the category filter itself)
  const categoryCounts = useMemo(() => {
    const counts = {};
    
    // Initialize all custom categories to 0
    customCategories.forEach(cat => {
      counts[cat] = 0;
    });

    taskInstances.forEach(item => {
      // Apply all active filters except category filter itself
      // 1. KPI Filter
      if (activeKpiFilter === 'Completed' && item.status !== 'Completed') return;
      if (activeKpiFilter === 'Pending' && item.status !== 'Pending') return;
      if (activeKpiFilter === 'Frogs' && (item.priority !== 'Frog' || item.status !== 'Pending')) return;
      if (activeKpiFilter === 'Overdue' && (item.status !== 'Pending' || item.dateInstance >= todayStr)) return;

      if (filterFrog === 'Frog' && (item.priority !== 'Frog' || item.status !== 'Pending')) return;

      // 3. Search filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const match = item.description?.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q);
        if (!match) return;
      }

      // 4. Duration filter
      if (filterDuration && item.duration !== filterDuration) return;

      // 5. Date range filter
      if (filterFromDate && item.dateInstance < filterFromDate) return;
      if (filterToDate   && item.dateInstance > filterToDate)   return;

      // Increment count for this item's category
      if (counts[item.category] !== undefined) {
        counts[item.category] += 1;
      } else {
        counts[item.category] = 1;
      }
    });

    return counts;
  }, [taskInstances, searchQuery, filterDuration, filterFrog, filterFromDate, filterToDate, activeKpiFilter, customCategories, todayStr]);

  // Paginated list
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTasks.slice(start, start + itemsPerPage);
  }, [filteredTasks, currentPage, itemsPerPage]);

  // Total pages
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDuration, filterCategory, filterFrog, filterFromDate, filterToDate, activeKpiFilter]);

  // Quick date preset helper
  const applyPreset = (preset) => {
    const fmt = (d) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };
    const now = new Date();
    if (preset === 'day') {
      const t = fmt(now);
      setFilterFromDate(t); setFilterToDate(t);
    } else if (preset === 'week') {
      const day = now.getDay();
      const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      setFilterFromDate(fmt(mon)); setFilterToDate(fmt(sun));
    } else if (preset === 'month') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setFilterFromDate(fmt(first)); setFilterToDate(fmt(last));
    } else {
      setFilterFromDate(''); setFilterToDate('');
    }
    setDatePreset(preset);
  };

  // Table Headers
  const tableHeaders = React.useMemo(() => {
    const headers = ['Date', 'Task Description', 'Time', 'Category', 'Status'];
    // Show "Completed On" only when active tab can show completed tasks (Total or Completed)
    if (activeKpiFilter === 'Total' || activeKpiFilter === 'Completed') {
      headers.push('Completed On');
    }
    return headers;
  }, [activeKpiFilter]);

  // Unified Row Renderer (Handles both Pending and Completed)
  const renderRow = (item) => {
    const isCompleted = item.status === 'Completed';
    const showCompletedOn = activeKpiFilter === 'Total' || activeKpiFilter === 'Completed';
    return (
      <tr key={`task-${item.id}-${item.dateInstance}`} className="hover:bg-gray-50 transition-colors text-center text-sm border-b border-gray-100">
        <td className={`px-4 py-3.5 font-semibold whitespace-nowrap text-xs ${isCompleted ? 'text-gray-500' : 'text-gray-900'}`}>
          {formatDate(item.dateInstance)}
        </td>
        <td className={`px-4 py-3.5 text-center max-w-[200px] md:max-w-xs truncate ${isCompleted ? 'text-gray-400 line-through font-normal' : 'text-gray-900 font-medium'}`} title={item.description}>
          <div className="flex items-center justify-center gap-2">
            {item.priority === 'Frog' && (
              <span className="text-base select-none flex-shrink-0" title="Frog Task">🐸</span>
            )}
            <span>{item.description}</span>
          </div>
        </td>
        <td className={`px-4 py-3.5 whitespace-nowrap text-xs text-center font-bold ${isCompleted ? 'text-gray-500' : 'text-gray-650'}`}>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-sm leading-none select-none">
              {item.duration === 'Morning' ? '🌅' : item.duration === 'Afternoon' ? '☀️' : item.duration === 'Evening' ? '🌆' : item.duration === 'Night' ? '🌙' : '⏰'}
            </span>
            <span>{item.duration}</span>
          </div>
        </td>
        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-center">
          <span className={`font-extrabold uppercase text-[11px] tracking-wider flex items-center justify-center gap-1.5 select-none ${isCompleted ? 'text-gray-500' : 'text-gray-650'}`}>
            <span>{getCategoryEmoji(item.category)}</span>
            <span>{item.category}</span>
          </span>
        </td>
        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-center">
          {isCompleted ? (
            <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
              Completed
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider">
              Pending
            </span>
          )}
        </td>
        {showCompletedOn && (
          <td className={`px-4 py-3.5 whitespace-nowrap text-xs text-center font-semibold ${isCompleted ? 'text-emerald-700' : 'text-gray-400'}`}>
            {isCompleted ? formatDate(item.dateInstance) : '-'}
          </td>
        )}
      </tr>
    );
  };

  // Unified Card Renderer (Handles both Pending and Completed)
  const renderCard = (item) => {
    const isCompleted = item.status === 'Completed';
    return (
      <div key={`task-card-${item.id}-${item.dateInstance}`} className={`bg-white p-2 rounded-xl border border-gray-200 shadow-sm space-y-1.5 ${isCompleted ? 'opacity-75' : ''}`}>
        <div className="flex justify-between items-start border-b border-gray-100 pb-1">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold text-gray-550 border border-gray-200 px-2 py-0.5 rounded bg-gray-50 uppercase tracking-widest">
                {formatDate(item.dateInstance)}
              </span>
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 uppercase tracking-widest">
                {getCategoryEmoji(item.category)} {item.category}
              </span>
            </div>
            <h3 className={`text-xs md:text-sm font-bold leading-tight text-left flex items-start gap-1.5 ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
              {item.priority === 'Frog' && (
                <span className="text-base select-none flex-shrink-0" title="Frog Task">🐸</span>
              )}
              <span>{item.description}</span>
            </h3>
          </div>
          <div className="flex ml-2 items-center">
            <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-widest whitespace-nowrap ${isCompleted ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
              {isCompleted ? 'Completed' : 'Pending'}
            </span>
          </div>
        </div>
        <div className="pt-1 flex items-center justify-between text-gray-500">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-sm leading-none select-none">
              {item.duration === 'Morning' ? '🌅' : item.duration === 'Afternoon' ? '☀️' : item.duration === 'Evening' ? '🌆' : item.duration === 'Night' ? '🌙' : '⏰'}
            </span>
            <span>{item.duration}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-2 sm:p-3 md:p-4 lg:p-5 space-y-3 text-left flex flex-col min-h-0 h-full">
      
      {/* KPI Stats Grid — all cards are clickable filters */}
      <div className="grid grid-cols-5 gap-1 sm:gap-2 md:gap-2.5 flex-shrink-0">
        {[
          { key: 'Total',     label: 'Total',          value: kpis.total,       color: 'text-gray-800',    border: 'border-l-gray-400',    active: 'bg-gray-700 text-white border-gray-800' },
          { key: 'Completed', label: 'Completed',      value: kpis.completed,   color: 'text-emerald-600', border: 'border-l-emerald-500', active: 'bg-emerald-600 text-white border-emerald-700' },
          { key: 'Pending',   label: 'Pending',        value: kpis.pending,     color: 'text-amber-600',   border: 'border-l-amber-500',   active: 'bg-amber-500 text-white border-amber-600' },
          { key: 'Frogs',     label: '🐸 Frogs',       value: kpis.pendingFrog, color: 'text-emerald-800', border: 'border-l-emerald-600', active: 'bg-emerald-700 text-white border-emerald-800' },
          { key: 'Overdue',   label: 'Overdue',        value: kpis.overdue,     color: 'text-rose-600',    border: 'border-l-rose-500',    active: 'bg-rose-600 text-white border-rose-700' },
        ].map(({ key, label, value, color, border, active }) => (
          <button
            key={key}
            onClick={() => handleKpiClick(key)}
            className={`rounded-lg sm:rounded-xl p-1 px-1.5 sm:p-2.5 md:p-3 shadow-sm flex flex-col justify-between text-left border transition-all active:scale-95 border-l-2 sm:border-l-4 ${
              activeKpiFilter === key
                ? `${active} border`
                : `bg-white border-gray-200 ${border} hover:shadow-md`
            }`}
          >
            <span className={`text-[8px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider leading-tight whitespace-nowrap ${activeKpiFilter === key ? 'text-white/80' : 'text-gray-400'}`}>{label}</span>
            <span className={`text-xs sm:text-base md:text-2xl font-black mt-0.5 sm:mt-1 ${activeKpiFilter === key ? 'text-white' : color}`}>{value}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
           TOOLBAR — Mobile: 2-row  |  Desktop: 1-row
      ══════════════════════════════════════════ */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
        
        {/* ── TOOLBAR AREA ── */}
        <div className="border-b border-gray-100 flex flex-col shrink-0">
          {/* ── ROW 1: always visible ── */}
          <div className="px-3 py-2 flex items-center gap-2">

          {/* Category badges (desktop only) - Single click filters the category */}
          <div className="hidden md:flex items-center gap-1.5 flex-shrink-0 border-r border-gray-200 pr-3 mr-1">
            {customCategories.map(cat => {
              const count = categoryCounts[cat] || 0;
              const isActive = filterCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(prev => prev === cat ? '' : cat)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap border transition-all active:scale-95 ${
                    isActive 
                      ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm hover:bg-indigo-700'
                      : count > 0 
                        ? 'bg-indigo-50 border-indigo-150 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800' 
                        : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {cat}: {count}
                </button>
              );
            })}
          </div>

          {/* Search — flex-1 fills remaining space */}
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="pl-6 pr-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 h-[32px] md:h-[28px] w-full"
            />
          </div>

          {/* Mobile ONLY: Filter toggle (tap = show/hide, double-tap = clear all) */}
          <button
            onClick={() => setShowMobileFilters(prev => !prev)}
            onDoubleClick={() => {
              setSearchQuery(''); setFilterDuration(''); setFilterCategory('');
              setFilterFrog(''); setFilterFromDate(''); setFilterToDate(''); setDatePreset('');
              setShowMobileFilters(false);
            }}
            className={`md:hidden relative flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
              showMobileFilters || filterDuration || filterCategory || filterFrog || filterFromDate || filterToDate
                ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                : 'bg-white border-gray-300 text-gray-500'
            }`}
            title="Tap to filter · Double-tap to clear all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {(filterDuration || filterCategory || filterFrog || filterFromDate || filterToDate) && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
            )}
          </button>

          {/* Desktop: all filter controls inline */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {/* Day / Week / Month presets */}
            <div className="flex items-center h-[28px] border border-gray-300 rounded-lg overflow-hidden bg-white divide-x divide-gray-300">
              {[{ key: 'day', label: 'Day' }, { key: 'week', label: 'Week' }, { key: 'month', label: 'Month' }].map(({ key, label }) => (
                <button key={key} onClick={() => applyPreset(datePreset === key ? '' : key)}
                  className={`px-2.5 h-full text-[10px] font-bold transition-colors ${
                    datePreset === key ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}>{label}</button>
              ))}
            </div>
            {/* From – To */}
            <div className="flex items-center h-[28px] border border-gray-300 rounded-lg overflow-hidden bg-white divide-x divide-gray-300">
              <span className="text-[9px] font-bold text-gray-500 uppercase px-1.5 whitespace-nowrap bg-gray-50">From</span>
              <input type="date" value={filterFromDate}
                onChange={(e) => { setFilterFromDate(e.target.value); setDatePreset(''); }}
                className="text-[10px] px-1.5 h-full bg-white text-gray-700 font-semibold focus:outline-none" />
              <span className="text-[9px] font-bold text-gray-500 uppercase px-1.5 whitespace-nowrap bg-gray-50">To</span>
              <input type="date" value={filterToDate}
                onChange={(e) => { setFilterToDate(e.target.value); setDatePreset(''); }}
                className="text-[10px] px-1.5 h-full bg-white text-gray-700 font-semibold focus:outline-none" />
            </div>
            {/* All Times */}
            <select value={filterDuration} onChange={(e) => setFilterDuration(e.target.value)}
              className="border border-gray-300 rounded-lg text-[10px] px-2 bg-white text-gray-700 font-bold focus:outline-none h-[28px]">
              <option value="">All Times</option>
              {durationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {/* All Categories */}
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-lg text-[10px] px-2 bg-white text-gray-700 font-bold focus:outline-none h-[28px]">
              <option value="">All Categories</option>
              {customCategories.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {/* Frog */}
            <button onClick={() => setFilterFrog(prev => prev === 'Frog' ? '' : 'Frog')}
              className={`px-2.5 h-[28px] rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-all ${
                filterFrog === 'Frog' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}>
              🐸 Frog Tasks
              {filterFrog === 'Frog' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
            </button>
            {/* Clear */}
            {(searchQuery || filterDuration || filterCategory || filterFrog || filterFromDate || filterToDate) && (
              <button onClick={() => { setSearchQuery(''); setFilterDuration(''); setFilterCategory(''); setFilterFrog(''); setFilterFromDate(''); setFilterToDate(''); setDatePreset(''); }}
                className="text-[10px] text-red-500 hover:text-red-700 font-bold hover:underline px-1">Clear</button>
            )}
          </div>
        </div>

        {/* ── ROW 2 (mobile only): toggleable filter panel ── */}
        {showMobileFilters && (
          <div className="md:hidden px-3 pb-2 flex flex-col gap-2">
            
            {/* Row 1: Day / Week / Month Presets */}
            <div className="flex items-center h-[32px] border border-gray-300 rounded-lg overflow-hidden bg-white divide-x divide-gray-300 w-full">
              {[{ key: 'day', label: 'Day' }, { key: 'week', label: 'Week' }, { key: 'month', label: 'Month' }].map(({ key, label }) => (
                <button key={key} onClick={() => applyPreset(datePreset === key ? '' : key)}
                  className={`flex-1 h-full text-xs font-bold transition-colors ${
                    datePreset === key ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}>{label}</button>
              ))}
            </div>

            {/* Row 2: From and To Date Selection */}
            <div className="flex items-center h-[32px] border border-gray-300 rounded-lg overflow-hidden bg-white divide-x divide-gray-300 w-full">
              <span className="text-[10px] font-bold text-gray-500 uppercase px-2 bg-gray-50 whitespace-nowrap">From</span>
              <input type="date" value={filterFromDate}
                onChange={(e) => { setFilterFromDate(e.target.value); setDatePreset(''); }}
                className="text-[11px] px-2 h-full bg-white text-gray-700 font-semibold focus:outline-none flex-1 min-w-0" />
              <span className="text-[10px] font-bold text-gray-500 uppercase px-2 bg-gray-50 whitespace-nowrap border-l border-gray-300">To</span>
              <input type="date" value={filterToDate}
                onChange={(e) => { setFilterToDate(e.target.value); setDatePreset(''); }}
                className="text-[11px] px-2 h-full bg-white text-gray-700 font-semibold focus:outline-none flex-1 min-w-0" />
            </div>

            {/* Row 3: Time + Category + Frog */}
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
              <button onClick={() => setFilterFrog(prev => prev === 'Frog' ? '' : 'Frog')}
                className={`flex-1 h-[32px] rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                  filterFrog === 'Frog' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-gray-300 text-gray-500'
                }`}>
                🐸 Frog
                {filterFrog === 'Frog' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
              </button>
            </div>
          </div>
        )}
        </div> {/* End TOOLBAR AREA */}
        
        {/* Main Table Area (Shows Unified Table) */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <DataTable
          headers={tableHeaders}
          data={paginatedTasks}
          renderRow={renderRow}
          renderCard={renderCard}
          minWidth="900px"
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalResults={filteredTasks.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
        />

      </div>

    </div>
    </div>
  );
}
