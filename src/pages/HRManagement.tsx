import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Edit2, Trash2, X, UserCog, Download, CheckCircle2 } from 'lucide-react';
import { HRSchema, HRMember } from '../types';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const HRManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: hrMembers, isLoading } = useQuery({
    queryKey: ['hr-members'],
    queryFn: async () => {
      const res = await api.get('/admin/users/hr-management');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/users/hr-management', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-members'] });
      toast.success('HR Profile created successfully');
      setIsModalOpen(false);
      setStep(1);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Creation failed');
    }
  });

  const { register, handleSubmit, reset, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(HRSchema),
    defaultValues: {
      isWorking: true,
      gender: 'male'
    }
  });

  const nextStep = async () => {
    let fields: any[] = [];
    if (step === 1) fields = ['username', 'fullName', 'email', 'phone'];
    if (step === 2) fields = ['password', 'address', 'salary'];
    
    const isValid = await trigger(fields);
    if (isValid) setStep(step + 1);
  };

  const onSubmit = (data: any) => createMutation.mutate(data);

  const filteredHR = hrMembers?.filter((hr: HRMember) => 
    hr.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hr.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">HR Management</h2>
          <p className="text-slate-400">Manage human resources profiles and account details.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Download size={20} />
            Export CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Create HR Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-6 rounded-2xl text-white">
          <p className="text-indigo-100 text-sm font-medium">Total HR Members</p>
          <h3 className="text-4xl font-bold mt-2">{hrMembers?.length || 0}</h3>
        </div>
        <div className="bg-emerald-600 p-6 rounded-2xl text-white">
          <p className="text-emerald-100 text-sm font-medium">Active HR</p>
          <h3 className="text-4xl font-bold mt-2">{hrMembers?.filter((h: any) => h.isWorking).length || 0}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-400 text-sm font-medium">System Status</p>
          <h3 className="text-4xl font-bold mt-2 text-indigo-400">Stable</h3>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
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
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">HR Member</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
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
                filteredHR?.map((hr: HRMember) => (
                  <tr key={hr.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold">
                          {hr.fullName?.[0] || 'H'}
                        </div>
                        <div>
                          <p className="font-bold">{hr.fullName}</p>
                          <p className="text-xs text-slate-500">Joined {format(new Date(hr.createdAt), 'MMM yyyy')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-indigo-400">@{hr.username}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{hr.email}</p>
                      <p className="text-xs text-slate-500">{hr.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        hr.isWorking 
                          ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' 
                          : 'bg-rose-400/10 text-rose-400 border-rose-400/20'
                      }`}>
                        {hr.isWorking ? 'Working' : 'Not Working'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all">
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

      {/* Multi-step Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold">Create HR Profile</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="px-6 pt-6 flex justify-between">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex flex-col items-center gap-2 flex-1 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    step >= s ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-700 text-slate-500'
                  }`}>
                    {step > s ? <CheckCircle2 size={16} /> : s}
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${step >= s ? 'text-indigo-400' : 'text-slate-600'}`}>
                    {s === 1 ? 'Basic' : s === 2 ? 'Account' : 'Personal'}
                  </span>
                  {s < 3 && <div className={`absolute top-4 left-[60%] w-[80%] h-0.5 ${step > s ? 'bg-indigo-600' : 'bg-slate-800'}`}></div>}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
                    <input {...register('username')} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="hr_manager" />
                    {errors.username && <p className="text-rose-500 text-xs mt-1">{errors.username.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                    <input {...register('fullName')} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="Sarah Johnson" />
                    {errors.fullName && <p className="text-rose-500 text-xs mt-1">{errors.fullName.message as string}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                      <input {...register('email')} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="sarah@company.com" />
                      {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message as string}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Phone</label>
                      <input {...register('phone')} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="1234567890" />
                      {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone.message as string}</p>}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                    <input type="password" {...register('password')} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="••••••••" />
                    {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Address</label>
                    <input {...register('address')} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="123 Main St" />
                    {errors.address && <p className="text-rose-500 text-xs mt-1">{errors.address.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Salary</label>
                    <input {...register('salary')} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="50000" />
                    {errors.salary && <p className="text-rose-500 text-xs mt-1">{errors.salary.message as string}</p>}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Age</label>
                      <input {...register('age')} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="30" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Gender</label>
                      <select {...register('gender')} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" {...register('isWorking')} id="isWorking" className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500/50" />
                    <label htmlFor="isWorking" className="text-sm font-medium text-slate-400">Is Working</label>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                {step > 1 && (
                  <button type="button" onClick={() => setStep(step - 1)} className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium hover:bg-slate-800 transition-colors">
                    Back
                  </button>
                )}
                {step < 3 ? (
                  <button type="button" onClick={nextStep} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
                    Next Step
                  </button>
                ) : (
                  <button type="submit" disabled={createMutation.isPending} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
                    {createMutation.isPending ? 'Creating...' : 'Complete Profile'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
