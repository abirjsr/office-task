import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Edit2, Trash2, X, Filter } from 'lucide-react';
import { DepartmentSchema, Department, Employee } from '../types';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const Departments = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('');
  const { currentAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: departments, isLoading: isDeptsLoading } = useQuery({
    queryKey: ['departments', currentAdmin?.adminId],
    queryFn: async () => {
      if (!currentAdmin) return [];
      const res = await api.get(`/admin/users/departments/${currentAdmin.adminId}`);
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

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/admin/users/departments/${currentAdmin?.adminId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department assigned successfully');
      setIsModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Assignment failed');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${currentAdmin?.adminId}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department removed');
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(DepartmentSchema),
    defaultValues: {
      isActive: true,
      joiningDate: new Date().toISOString().split('T')[0]
    }
  });

  const onSubmit = (data: any) => createMutation.mutate(data);

  const filteredDepts = departments?.filter((d: Department) => 
    !filterType || d.departmentType === filterType
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Software Engineer': return 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20';
      case 'Technical Supporter': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
      case 'Network Engineer': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
      default: return 'bg-slate-400/10 text-slate-400 border-slate-400/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Department Management</h2>
          <p className="text-slate-400">Assign employees to departments and manage roles.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Assign Department
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-wrap gap-4">
          <div className="relative flex-1 max-w-sm">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
            >
              <option value="">All Department Types</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Technical Supporter">Technical Supporter</option>
              <option value="Network Engineer">Network Engineer</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Joining Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isDeptsLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4 h-16 bg-slate-800/20"></td>
                  </tr>
                ))
              ) : (
                filteredDepts?.map((dept: Department) => (
                  <tr key={dept.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold">{dept.employeeName}</p>
                      <p className="text-xs text-slate-500">ID: {dept.employeeId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(dept.departmentType)}`}>
                        {dept.departmentType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{dept.role}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {format(new Date(dept.joiningDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        dept.isActive 
                          ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' 
                          : 'bg-slate-400/10 text-slate-400 border-slate-400/20'
                      }`}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to remove this department assignment?')) {
                              deleteMutation.mutate(dept.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold">Assign Department</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Employee</label>
                <select 
                  {...register('employeeId', { valueAsNumber: true })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                >
                  <option value="">Select Employee</option>
                  {employees?.map((emp: Employee) => (
                    <option key={emp.id} value={emp.id}>{emp.fullName} (ID: {emp.id})</option>
                  ))}
                </select>
                {errors.employeeId && <p className="text-rose-500 text-xs mt-1">{errors.employeeId.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Department Type</label>
                <select 
                  {...register('departmentType')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Technical Supporter">Technical Supporter</option>
                  <option value="Network Engineer">Network Engineer</option>
                </select>
                {errors.departmentType && <p className="text-rose-500 text-xs mt-1">{errors.departmentType.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                <input 
                  {...register('role')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  placeholder="e.g. Senior Developer"
                />
                {errors.role && <p className="text-rose-500 text-xs mt-1">{errors.role.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Joining Date</label>
                <input 
                  type="date"
                  {...register('joiningDate')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                />
                {errors.joiningDate && <p className="text-rose-500 text-xs mt-1">{errors.joiningDate.message as string}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  {...register('isActive')}
                  id="isActive"
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500/50"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-400">Is Active</label>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
