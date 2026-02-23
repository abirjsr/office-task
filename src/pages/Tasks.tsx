import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, CheckCircle2, Clock, AlertCircle, ExternalLink, X, User } from 'lucide-react';
import { TaskSchema, Task, Employee, HRMember } from '../types';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';

export const Tasks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'employee' | 'hr'>('employee');
  const { currentAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: employeeTasks, isLoading: isEmpTasksLoading } = useQuery({
    queryKey: ['employee-tasks', currentAdmin?.adminId],
    queryFn: async () => {
      if (!currentAdmin) return [];
      const res = await api.get(`/admin/users/${currentAdmin.adminId}/employee-tasks`);
      return res.data;
    },
    enabled: !!currentAdmin
  });

  const { data: hrTasks, isLoading: isHRTasksLoading } = useQuery({
    queryKey: ['hr-tasks', currentAdmin?.adminId],
    queryFn: async () => {
      if (!currentAdmin) return [];
      const res = await api.get(`/admin/users/${currentAdmin.adminId}/tasks`);
      return res.data;
    },
    enabled: !!currentAdmin
  });

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/admin/users/employees');
      return res.data;
    }
  });

  const { data: hrMembers } = useQuery({
    queryKey: ['hr-members'],
    queryFn: async () => {
      const res = await api.get('/admin/users/hr-management');
      return res.data;
    }
  });

  const assignMutation = useMutation({
    mutationFn: (data: any) => {
      const endpoint = activeTab === 'employee' 
        ? `/admin/users/${currentAdmin?.adminId}/employee-tasks`
        : `/admin/users/${currentAdmin?.adminId}/tasks`;
      return api.post(endpoint, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [activeTab === 'employee' ? 'employee-tasks' : 'hr-tasks'] });
      toast.success('Task assigned successfully');
      setIsModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Assignment failed');
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(TaskSchema)
  });

  const onSubmit = (data: any) => assignMutation.mutate(data);

  const TaskCard = ({ task }: { task: Task }) => {
    const isOverdue = isPast(new Date(task.dueDate)) && task.status === 'pending';
    
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all group">
        <div className="flex items-start justify-between mb-4">
          <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
            task.status === 'submitted' 
              ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' 
              : isOverdue 
                ? 'bg-rose-400/10 text-rose-400 border-rose-400/20'
                : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
          }`}>
            {task.status}
          </div>
          {task.submissionUrl && (
            <a href={task.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-400 transition-colors">
              <ExternalLink size={16} />
            </a>
          )}
        </div>
        <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-400 transition-colors">{task.title}</h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-4">{task.description}</p>
        
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock size={14} />
              <span>Due {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
            </div>
            {isOverdue && (
              <div className="flex items-center gap-1 text-rose-500 font-bold">
                <AlertCircle size={14} />
                <span>Overdue</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
              <User size={12} />
            </div>
            <span className="text-xs text-slate-400">
              {activeTab === 'employee' ? `Employee ID: ${task.assignedToId}` : task.hrName}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Task Management</h2>
          <p className="text-slate-400">Assign and track tasks for employees and HR members.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Assign New Task
        </button>
      </div>

      <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
        <button 
          onClick={() => setActiveTab('employee')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'employee' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          Employee Tasks
        </button>
        <button 
          onClick={() => setActiveTab('hr')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'hr' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          HR Tasks
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'employee' ? (
          isEmpTasksLoading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>)
          ) : (
            employeeTasks?.map((task: Task) => <TaskCard key={task.id} task={task} />)
          )
        ) : (
          isHRTasksLoading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>)
          ) : (
            hrTasks?.map((task: Task) => <TaskCard key={task.id} task={task} />)
          )
        )}
      </div>

      {/* Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold">Assign Task to {activeTab === 'employee' ? 'Employee' : 'HR'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Task Title</label>
                <input {...register('title')} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="Complete Project Report" />
                {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea {...register('description')} rows={3} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none" placeholder="Prepare quarterly report..." />
                {errors.description && <p className="text-rose-500 text-xs mt-1">{errors.description.message as string}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Due Date</label>
                  <input type="date" {...register('dueDate')} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none" />
                  {errors.dueDate && <p className="text-rose-500 text-xs mt-1">{errors.dueDate.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Assign To</label>
                  {activeTab === 'employee' ? (
                    <select {...register('employeeId', { valueAsNumber: true })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none">
                      <option value="">Select Employee</option>
                      {employees?.map((emp: Employee) => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
                    </select>
                  ) : (
                    <select {...register('hrId')} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none">
                      <option value="">Select HR Member</option>
                      {hrMembers?.map((hr: HRMember) => <option key={hr.id} value={hr.id}>{hr.fullName}</option>)}
                    </select>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Reference URL (Optional)</label>
                <input {...register('url')} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="https://docs.google.com/..." />
                {errors.url && <p className="text-rose-500 text-xs mt-1">{errors.url.message as string}</p>}
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={assignMutation.isPending} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
                  {assignMutation.isPending ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
