import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Plus, Search, Trash2, Pencil, SlidersHorizontal, CalendarDays } from 'lucide-react';
import { getTasks as getMasterTasks, saveTasks as saveMasterTasks } from '../../utils/storageManager';
import DataTable from '../../components/DataTable';
import ModalForm from '../../components/ModalForm';
import ModalAlert from '../../components/ModalAlert';
import { getCategoryEmoji, formatDate } from '../../utils/helpers';

const STORAGE_KEY = 'upcoming_planner_tasks';

const DUMMY_TASKS = [
  { id: 'UPTSK-DEMO-1',  description: 'Prepare Q3 strategy presentation slides', duration: 'Morning',   category: 'Work',     priority: 'Frog', date: '2026-05-22', status: 'Pending',   selectValue: 'Pending', remarks: '',                      timestamp: '' },
  { id: 'UPTSK-DEMO-2',  description: 'Team standup & sprint planning meeting',   duration: 'Morning',   category: 'Meeting',  priority: '',     date: '2026-05-22', status: 'Pending',   selectValue: 'Pending', remarks: 'Zoom link sent',        timestamp: '' },
  { id: 'UPTSK-DEMO-3',  description: 'Review client proposal and send feedback', duration: 'Afternoon', category: 'Review',   priority: '',     date: '2026-05-22', status: 'Pending',   selectValue: 'Pending', remarks: '',                      timestamp: '' },
  { id: 'UPTSK-DEMO-4',  description: 'Follow-up call with Rajesh – partnership', duration: 'Afternoon', category: 'Call',     priority: 'Frog', date: '2026-05-23', status: 'Pending',   selectValue: 'Pending', remarks: 'Confirm availability',  timestamp: '' },
  { id: 'UPTSK-DEMO-5',  description: 'Submit monthly expense report to finance',  duration: 'Morning',   category: 'Work',     priority: '',     date: '2026-05-23', status: 'Pending',   selectValue: 'Pending', remarks: '',                      timestamp: '' },
  { id: 'UPTSK-DEMO-6',  description: 'Gym session – upper body strength training',duration: 'Evening',   category: 'Health',   priority: '',     date: '2026-05-23', status: 'Pending',   selectValue: 'Pending', remarks: '',                      timestamp: '' },
  { id: 'UPTSK-DEMO-7',  description: 'Onboarding session for new joinee Priya',   duration: 'Morning',   category: 'Meeting',  priority: '',     date: '2026-05-26', status: 'Pending',   selectValue: 'Pending', remarks: 'Prepare welcome kit',   timestamp: '' },
  { id: 'UPTSK-DEMO-8',  description: 'Finalise and publish blog post on AI tools', duration: 'Afternoon', category: 'Work',     priority: '',     date: '2026-05-26', status: 'Pending',   selectValue: 'Pending', remarks: '',                      timestamp: '' },
  { id: 'UPTSK-DEMO-9',  description: 'Annual health check-up appointment',         duration: 'Morning',   category: 'Health',   priority: 'Frog', date: '2026-05-27', status: 'Pending',   selectValue: 'Pending', remarks: 'Carry previous reports', timestamp: '' },
  { id: 'UPTSK-DEMO-10', description: 'Investor deck review with co-founders',      duration: 'Evening',   category: 'Meeting',  priority: 'Frog', date: '2026-05-28', status: 'Pending',   selectValue: 'Pending', remarks: '',                      timestamp: '' },
  { id: 'UPTSK-DEMO-11', description: 'Code review – payment gateway integration',  duration: 'Afternoon', category: 'Work',     priority: '',     date: '2026-05-29', status: 'Completed', selectValue: 'Done',    remarks: 'Approved & merged',     timestamp: '' },
  { id: 'UPTSK-DEMO-12', description: 'Personal – read 30 pages of Deep Work',      duration: 'Night',     category: 'Personal', priority: '',     date: '2026-05-30', status: 'Pending',   selectValue: 'Pending', remarks: '',                      timestamp: '' },
];

const getTasks = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    // First visit – seed dummy data
    saveTasks(DUMMY_TASKS);
    return DUMMY_TASKS;
  } catch { return DUMMY_TASKS; }
};

const saveTasks = (tasks) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export default function NextDayPlanner() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Total');
  const [inlineDate, setInlineDate] = useState('');
  const [inlineDesc, setInlineDesc] = useState('');
  const [inlineTime, setInlineTime] = useState('Morning');
  const [inlineCat, setInlineCat] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'success', title: '', message: '', onConfirm: () => {} });

  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem('index_custom_categories');
    return saved ? JSON.parse(saved) : ['Work', 'Meeting', 'Call', 'Personal', 'Review', 'Break', 'Health'];
  });

  const durationOptions = ['Morning', 'Afternoon', 'Evening', 'Night'];

  const [formData, setFormData] = useState({ date: '' });
  const [tasksList, setTasksList] = useState([
    { description: '', duration: 'Morning', category: 'Work', priority: '' }
  ]);

  useEffect(() => {
    setTasks(getTasks());
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const showAlert = (type, title, message) => {
    setAlertConfig({ isOpen: true, type, title, message, onConfirm: () => {} });
  };

  const handleUpdateTaskField = (taskId, field, value) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t);
    setTasks(updated);
    saveTasks(updated);
  };

  const handleDeleteTask = (taskId) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    saveTasks(updated);
  };

  const handleEditTask = (item) => {
    setEditingTask(item);
    setFormData({ date: item.date || '' });
    setTasksList([{ description: item.description, duration: item.duration, category: item.category, priority: item.priority || '' }]);
    setShowModal(true);
  };

  const filteredTasks = useMemo(() => {
    let result = tasks.map(t => ({
      ...t,
      time: t.duration,
      status: t.status || 'Pending'
    }));

    if (activeFilter === 'Active') result = result.filter(t => t.status !== 'Completed');
    else if (activeFilter === 'Completed') result = result.filter(t => t.status === 'Completed');
    else if (activeFilter === 'Pending') result = result.filter(t => t.status === 'Pending');

    return result;
  }, [tasks, activeFilter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const pending = tasks.filter(t => t.status === 'Pending' || !t.status).length;
    const active = total - completed;
    return { total, completed, pending, active };
  }, [tasks]);

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const headers = ['Action', 'Date', 'Time', 'Task Description', 'Category'];

  // --- Form handlers ---
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
    const updated = customCategories.includes(text) ? customCategories : [...customCategories, text];
    if (!customCategories.includes(text)) {
      localStorage.setItem('index_custom_categories', JSON.stringify(updated));
      setCustomCategories(updated);
    }
    handleFieldChange(idx, 'category', text);
    handleFieldChange(idx, 'isCreatingCategory', false);
    handleFieldChange(idx, 'newCategoryText', '');
  };

  const handleCategorySelectChange = (idx, value) => {
    if (value === '__NEW__') handleFieldChange(idx, 'isCreatingCategory', true);
    else handleFieldChange(idx, 'category', value);
  };

  const handleAddTaskClick = () => {
    setEditingTask(null);
    setFormData({ date: '' });
    setTasksList([{ description: '', duration: 'Morning', category: customCategories[0] || 'Work', priority: '' }]);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validRows = tasksList.filter(r => r.description.trim().length > 0);
    if (validRows.length === 0) {
      showAlert('error', 'Validation Error', 'Please enter at least one task description.');
      return;
    }

    if (editingTask) {
      // Edit mode – update single task
      const row = validRows[0];
      const updated = tasks.map(t => t.id === editingTask.id
        ? { ...t, description: row.description.trim(), duration: row.duration, category: row.category, priority: row.priority, date: formData.date }
        : t
      );
      saveTasks(updated);
      setTasks(updated);
      showAlert('success', 'Updated!', 'Task updated successfully.');
    } else {
      // Create mode
      const newTasks = validRows.map((row, idx) => ({
        id: `UPTSK-${Date.now()}-${idx}`,
        description: row.description.trim(),
        duration: row.duration,
        category: row.category,
        priority: row.priority,
        date: formData.date,
        status: 'Pending',
        selectValue: 'Select',
        timestamp: new Date().toISOString()
      }));
      const updated = [...tasks, ...newTasks];
      saveTasks(updated);
      setTasks(updated);
      showAlert('success', 'Created!', `${validRows.length} upcoming task(s) added successfully.`);
    }

    setEditingTask(null);
    setShowModal(false);
  };

  // --- Inline Form Handlers ---
  const handleInlineAddTask = () => {
    if (!inlineDesc.trim() || !inlineDate) return;
    const newTask = {
      id: `UPTSK-${Date.now()}`,
      description: inlineDesc.trim(),
      duration: inlineTime,
      category: inlineCat || customCategories[0] || 'Work',
      priority: '',
      date: inlineDate,
      status: 'Pending',
      selectValue: 'Pending',
      timestamp: new Date().toISOString()
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    saveTasks(updated);
    setInlineDesc(''); // reset only description to allow fast entry
  };

  const handleSaveAllToMaster = () => {
    if (tasks.length === 0) return;
    const masterTasks = getMasterTasks() || [];
    const updatedMaster = [...masterTasks, ...tasks];
    saveMasterTasks(updatedMaster);
    
    // Clear Upcoming Planner
    setTasks([]);
    saveTasks([]);
    showAlert('success', 'Tasks Saved', 'All tasks have been moved to All Tasks successfully.');
  };
  const renderRow = (item) => (
    <tr key={item.id} className="hover:bg-gray-50 transition-colors text-center text-sm border-b border-gray-100">
      {/* Action */}
      <td className="px-2 py-2 w-[80px] whitespace-nowrap">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleEditTask(item)}
            className="text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded transition"
            title="Edit task"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => handleDeleteTask(item.id)}
            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition"
            title="Delete task"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
      {/* Date */}
      <td className="px-2 py-2 w-[120px] text-gray-700 font-semibold whitespace-nowrap text-xs">
        {item.date ? formatDate(item.date) : '—'}
      </td>
      {/* Time */}
      <td className="px-2 py-2 w-[110px] text-gray-900 font-bold whitespace-nowrap text-xs md:text-sm">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-sm leading-none select-none">
            {item.time === 'Morning' ? '🌅' : item.time === 'Afternoon' ? '☀️' : item.time === 'Evening' ? '🌆' : item.time === 'Night' ? '🌙' : '⏰'}
          </span>
          <span>{item.time}</span>
        </div>
      </td>
      {/* Task Description */}
      <td className="px-4 py-2 text-gray-800 text-xs md:text-sm text-center font-medium">
        <div className="flex items-center justify-center gap-2">
          {item.priority === 'Frog' && <span className="text-base select-none flex-shrink-0" title="Frog Task">🐸</span>}
          <span>{item.description}</span>
        </div>
      </td>
      {/* Category */}
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
            {item.priority === 'Frog' && <span className="text-base select-none flex-shrink-0" title="Frog Task">🐸</span>}
            <span>{item.description}</span>
          </h3>
        </div>
        <div className="flex ml-2 items-center gap-1.5">
          <button onClick={() => handleEditTask(item)} className="text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded transition" title="Edit task">
            <Pencil size={14} />
          </button>
          <button onClick={() => handleDeleteTask(item.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition" title="Delete task">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="pt-1 flex items-center justify-between text-gray-500">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="text-sm leading-none select-none">
            {item.time === 'Morning' ? '🌅' : item.time === 'Afternoon' ? '☀️' : item.time === 'Evening' ? '🌆' : item.time === 'Night' ? '🌙' : '⏰'}
          </span>
          <span>{item.time}</span>
        </div>
        <span className="text-[10px] text-gray-400 font-semibold">
          {item.date ? formatDate(item.date) : ''}
        </span>
      </div>

    </div>
  );

  return (
    <div className="p-0 sm:p-2 md:p-4 space-y-2 md:space-y-3 flex flex-col h-full min-h-0">

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* ── INLINE TASK ENTRY FORM (Replaces Filters) ── */}
        <div className="border-b border-gray-100 flex flex-col shrink-0 bg-indigo-50/20">
          <div className="px-3 py-2 flex flex-wrap md:flex-nowrap items-center gap-2">
            
            {/* Date */}
            <div className="flex-shrink-0 w-full md:w-36 relative">
              <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input 
                type="date" 
                value={inlineDate} 
                onChange={e => setInlineDate(e.target.value)}
                className="w-full pl-8 pr-2 border border-gray-300 rounded-lg text-xs h-[32px] md:h-[28px] focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white" 
              />
            </div>

            {/* Description */}
            <div className="relative flex-1 w-full min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                value={inlineDesc}
                onChange={(e) => setInlineDesc(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleInlineAddTask(); }}
                placeholder="Task Description..."
                className="pl-7 pr-3 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 h-[32px] md:h-[28px] w-full"
              />
            </div>

            {/* Time */}
            <select
              value={inlineTime}
              onChange={(e) => setInlineTime(e.target.value)}
              className="border border-gray-300 rounded-lg text-xs px-2 bg-white text-gray-700 font-semibold focus:outline-none h-[32px] md:h-[28px] w-full md:w-auto"
            >
              {durationOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>

            {/* Category */}
            <select
              value={inlineCat}
              onChange={(e) => setInlineCat(e.target.value)}
              className="border border-gray-300 rounded-lg text-xs px-2 bg-white text-gray-700 font-semibold focus:outline-none h-[32px] md:h-[28px] w-full md:w-auto"
            >
              <option value="" disabled>Select Category</option>
              {customCategories.map(o => <option key={o} value={o}>{o}</option>)}
            </select>

            {/* Add Task Button */}
            <div className="flex items-center gap-1.5 w-full md:w-auto shrink-0 justify-end md:justify-start">
              <button 
                onClick={handleInlineAddTask}
                disabled={!inlineDesc.trim() || !inlineDate}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg flex items-center justify-center px-3 h-[32px] md:h-[28px] text-[11px] font-bold shadow-sm transition active:scale-95 whitespace-nowrap flex-1 md:flex-none"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Task
              </button>

              {/* Save All to All Tasks Button */}
              <button 
                onClick={handleSaveAllToMaster}
                disabled={tasks.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-lg flex items-center justify-center px-3 h-[32px] md:h-[28px] text-[11px] font-bold shadow-sm transition active:scale-95 whitespace-nowrap"
              >
                Save to All Tasks
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <DataTable
            headers={headers}
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

      {/* Modal Form */}
      <ModalForm
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingTask(null); }}
        title={editingTask ? 'Edit Task' : 'Add Upcoming Task(s)'}
        onSubmit={handleSubmit}
        submitText={editingTask ? 'Update Task' : 'Save Tasks'}
      >
        <div className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="block text-[10px] md:text-[11px] text-gray-650 font-bold uppercase tracking-wider">Scheduled Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[11px] md:text-[13px] h-[34px] bg-white"
            />
          </div>

          <div className="space-y-3.5 border-t border-gray-150 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Task Item Rows</h4>
                <p className="text-[9px] text-gray-405">Configure duration, category, priority, and description for each task item</p>
              </div>
              <button type="button" onClick={handleAddRow} className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg border border-indigo-200 transition active:scale-95 flex items-center gap-1 shadow-sm">
                <Plus size={12} /> Add Task Row
              </button>
            </div>

            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {tasksList.map((row, idx) => (
                <div key={idx} className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200 relative space-y-2.5 text-left">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-1.5">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">Task Item #{idx + 1}</span>
                    {tasksList.length > 1 && (
                      <button type="button" onClick={() => handleRemoveRow(idx)} className="text-red-500 hover:text-red-750 hover:bg-rose-50 p-1 rounded-md transition" title="Remove task row">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

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

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-gray-550 uppercase tracking-wide">Time *</label>
                      <select
                        required
                        value={row.duration}
                        onChange={(e) => handleFieldChange(idx, 'duration', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[10px] md:text-[12px] h-[32px] bg-white font-medium"
                      >
                        {durationOptions.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

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
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategoryInline(idx); } }}
                          />
                          <button type="button" onClick={() => handleAddCategoryInline(idx)} className="h-[32px] w-[30px] flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-bold shrink-0">✓</button>
                          <button type="button" onClick={() => handleFieldChange(idx, 'isCreatingCategory', false)} className="h-[32px] w-[30px] flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-600 rounded text-[11px] shrink-0">✕</button>
                        </div>
                      ) : (
                        <select
                          required
                          value={row.category}
                          onChange={(e) => handleCategorySelectChange(idx, e.target.value)}
                          className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[10px] md:text-[12px] h-[32px] bg-white font-medium"
                        >
                          {customCategories.map(c => <option key={c} value={c}>{c}</option>)}
                          <option value="__NEW__">+ New Category...</option>
                        </select>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-gray-550 uppercase tracking-wide">Frog Task?</label>
                      <button
                        type="button"
                        onClick={() => handleFieldChange(idx, 'priority', row.priority === 'Frog' ? '' : 'Frog')}
                        className={`w-full border rounded text-[10px] md:text-[11px] h-[32px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm ${row.priority === 'Frog' ? 'bg-emerald-50 border-emerald-355 text-emerald-700 font-extrabold' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
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
    </div>
  );
}
