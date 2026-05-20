import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';

const Myprojecttask = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskDesc, setNewTaskDesc] = useState('');

  // Load project details & tasks
  useEffect(() => {
    const savedProjects = localStorage.getItem('my_projects');
    if (savedProjects) {
      const projs = JSON.parse(savedProjects);
      const found = projs.find((p) => p.id === projectId);
      if (found) {
        setProject(found);
      } else {
        toast.error('Project not found');
        navigate('/my-projects');
        return;
      }
    } else {
      navigate('/my-projects');
      return;
    }

    const savedTasks = localStorage.getItem('my_project_tasks');
    if (savedTasks) {
      const allTasks = JSON.parse(savedTasks);
      const filtered = allTasks.filter((t) => t.projectId === projectId);
      setTasks(filtered);
    }
  }, [projectId, navigate]);

  const saveAllTasksToStorage = (updatedProjectTasks) => {
    const savedTasks = localStorage.getItem('my_project_tasks');
    let allTasks = [];
    if (savedTasks) {
      allTasks = JSON.parse(savedTasks);
    }
    
    const filteredOthers = allTasks.filter((t) => t.projectId !== projectId);
    const finalTasks = [...filteredOthers, ...updatedProjectTasks];
    
    localStorage.setItem('my_project_tasks', JSON.stringify(finalTasks));
    setTasks(updatedProjectTasks);
  };

  const handleCreateTaskInline = () => {
    const desc = newTaskDesc.trim();
    if (!desc) return;

    const newTask = {
      id: `TSK-${Date.now()}`,
      projectId,
      description: desc,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [...tasks, newTask];
    saveAllTasksToStorage(updated);
    setNewTaskDesc('');
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  const handleUpdateTaskField = (taskId, field, value) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, [field]: value };
      }
      return t;
    });
    setTasks(updated);
  };

  const handlePersistTaskChange = (taskId) => {
    const taskToSave = tasks.find(t => t.id === taskId);
    if (!taskToSave) return;
    
    if (!taskToSave.description.trim()) {
      const updated = tasks.filter(t => t.id !== taskId);
      saveAllTasksToStorage(updated);
    } else {
      saveAllTasksToStorage(tasks);
    }
  };

  const handleToggleTask = (taskId) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, isCompleted: !t.isCompleted };
      }
      return t;
    });
    saveAllTasksToStorage(updated);
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Delete this task?')) {
      const updated = tasks.filter((t) => t.id !== taskId);
      saveAllTasksToStorage(updated);
      toast.success('Task removed.');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.isCompleted && !b.isCompleted) return 1;
    if (!a.isCompleted && b.isCompleted) return -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (!project) return null;

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;

  return (
    <div className="p-4 md:p-6 space-y-5 flex flex-col h-full min-h-0 bg-white">
      {/* Header */}
      <div className="pb-2.5 flex items-center gap-3.5 bg-white border-b border-gray-100">
        <button
          onClick={() => navigate('/my-projects')}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-gray-500 hover:text-indigo-650 transition active:scale-95 border border-gray-200 shadow-sm"
          title="Back to Projects"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-gray-850">{project.name}</h1>
          <p className="text-xs text-gray-400 mt-0.5">Project Checklist & Notes</p>
        </div>
      </div>

      {/* Lined Notebook Paper Card */}
      <div className="flex-1 bg-white border border-gray-250/90 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] max-w-2xl flex flex-col overflow-hidden relative">
        
        {/* Paper top binder decoration */}
        <div className="h-6 bg-slate-50 border-b border-gray-200/80 flex items-center px-4 gap-1.5 select-none">
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <span className="text-[10px] text-gray-400 font-bold ml-auto">
            {completedCount} of {totalCount} completed
          </span>
        </div>

        <div className="flex-1 relative flex flex-col min-h-0">
          {/* Vertical Red Margin Line (matches physical legal pad layout) */}
          <div className="absolute left-[44px] top-0 bottom-0 border-l-[1.5px] border-red-300/60 pointer-events-none z-10"></div>

          {/* Ruled lines sheet */}
          <div 
            className="flex-1 overflow-y-auto pr-1"
            style={{ 
              backgroundImage: 'linear-gradient(rgba(226, 232, 240, 0.7) 1px, transparent 1px)',
              backgroundSize: '100% 40px',
            }}
          >
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center h-[40px] relative group hover:bg-slate-50/40 transition-colors duration-150`}
              >
                {/* Checkbox (Left of margin line) */}
                <div className="w-[44px] flex items-center justify-center flex-shrink-0 z-20">
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    className={`focus:outline-none flex-shrink-0 transition-all duration-200 active:scale-90 ${
                      task.isCompleted ? 'text-indigo-600' : 'text-gray-450 hover:text-indigo-650'
                    }`}
                  >
                    {task.isCompleted ? (
                      <CheckSquare size={19} className="fill-indigo-50" />
                    ) : (
                      <Square size={19} />
                    )}
                  </button>
                </div>
                
                {/* Editable Task Description input (Right of margin line) */}
                <div className="flex-1 flex items-center pl-3.5 pr-2 h-full z-20 min-w-0">
                  <input
                    type="text"
                    value={task.description}
                    onChange={(e) => handleUpdateTaskField(task.id, 'description', e.target.value)}
                    onBlur={() => handlePersistTaskChange(task.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.target.blur();
                      }
                    }}
                    className={`flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm font-semibold p-0 w-full h-[40px] leading-[40px] ${
                      task.isCompleted ? 'line-through text-gray-400 font-normal decoration-gray-300' : 'text-gray-800'
                    }`}
                  />
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  className="absolute right-2 text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0 z-30"
                  title="Delete Task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            
            {/* Notepad Input Line (Direct Typing) */}
            <div className="flex items-center h-[40px] relative group hover:bg-slate-50/40 transition-colors duration-150">
              <div className="w-[44px] flex items-center justify-center flex-shrink-0 z-20 text-gray-300">
                <Plus size={16} />
              </div>
              <div className="flex-1 flex items-center pl-3.5 pr-2 h-full z-20 min-w-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateTaskInline();
                    }
                  }}
                  onBlur={handleCreateTaskInline}
                  placeholder="Type a new task here and press Enter..."
                  className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm font-semibold text-gray-400 placeholder-gray-300 p-0 w-full h-[40px] leading-[40px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Myprojecttask;
