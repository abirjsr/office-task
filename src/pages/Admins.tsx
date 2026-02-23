import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Edit2, Trash2, X, Phone } from 'lucide-react';
import { AdminSchema, Admin } from '../types';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const Admins = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: admins, isLoading } = useQuery({
    queryKey: ['admins', searchTerm],
    queryFn: async () => {
      const url = searchTerm 
        ? `/admin/users/fullName?fullName=${searchTerm}`
        : '/admin/users';
      const res = await api.get(url);
      return res.data;
    }
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/users/register', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin registered successfully');
      setIsModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin deleted');
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(AdminSchema),
    defaultValues: {
      isActive: true
    }
  });

  const onSubmit = (data: any) => registerMutation.mutate(data);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Management</h2>
          <p className="text-slate-400">Manage system administrators and their access.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Add Admin
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Filter by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4 h-16 bg-slate-800/20"></td>
                  </tr>
                ))
              ) : (
                admins?.map((admin: Admin) => (
                  <tr key={admin.adminId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">
                          {admin.fullName?.[0] || 'A'}
                        </div>
                        <div>
                          <p className="font-bold">{admin.fullName || 'N/A'}</p>
                          <p className="text-xs text-slate-500 font-mono">{admin.adminId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{admin.email}</p>
                      <p className="text-xs text-slate-500">{admin.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        admin.isActive 
                          ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' 
                          : 'bg-slate-400/10 text-slate-400 border-slate-400/20'
                      }`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {format(new Date(admin.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this admin?')) {
                              deleteMutation.mutate(admin.adminId);
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

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold">Register New Admin</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                <input 
                  {...register('fullName')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  placeholder="John Doe"
                />
                {errors.fullName && <p className="text-rose-500 text-xs mt-1">{errors.fullName.message as string}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
                  <input 
                    type="number"
                    {...register('phone', { valueAsNumber: true })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    placeholder="1234567890"
                  />
                  {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                  <input 
                    type="email"
                    {...register('email')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message as string}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                <input 
                  type="password"
                  {...register('password')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message as string}</p>}
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
                  disabled={registerMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {registerMutation.isPending ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
