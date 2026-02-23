import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Edit2, Trash2, X, FileText, Calendar, User } from 'lucide-react';
import { MemorandumSchema, Memorandum } from '../types';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';

export const Memorandums = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: memorandums, isLoading } = useQuery({
    queryKey: ['memorandums', currentAdmin?.adminId],
    queryFn: async () => {
      if (!currentAdmin) return [];
      const res = await api.get(`/admin/users/${currentAdmin.adminId}/memorandums`);
      return res.data;
    },
    enabled: !!currentAdmin
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/admin/users/${currentAdmin?.adminId}/memorandums`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memorandums'] });
      toast.success('Memorandum created');
      setIsModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Creation failed');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${currentAdmin?.adminId}/memorandums/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memorandums'] });
      toast.success('Memorandum deleted');
    }
  });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(MemorandumSchema)
  });

  const titleValue = watch('title', '');
  const contentValue = watch('content', '');

  const onSubmit = (data: any) => createMutation.mutate(data);

  const filteredMemos = memorandums?.filter((m: Memorandum) => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Memorandums</h2>
          <p className="text-slate-400">Official office communications and announcements.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Create Memo
        </button>
      </div>

      <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search memorandums..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>
          ))
        ) : (
          filteredMemos?.map((memo: Memorandum) => (
            <div key={memo.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col group hover:border-indigo-500/50 transition-all">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <FileText size={20} />
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 text-slate-500 hover:text-indigo-400 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Delete this memorandum?')) {
                          deleteMutation.mutate(memo.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold line-clamp-1 mb-2">{memo.title}</h3>
                <div className="text-sm text-slate-400 line-clamp-3 mb-4 prose prose-invert prose-sm">
                  <ReactMarkdown>{memo.content}</ReactMarkdown>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <User size={12} />
                  <span>{memo.adminName || 'Admin'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  <span>{formatDistanceToNow(new Date(memo.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold">Create Memorandum</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-400">Title</label>
                    <span className="text-xs text-slate-500">{titleValue.length}/100</span>
                  </div>
                  <input 
                    {...register('title')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    placeholder="Memo Title"
                  />
                  {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Content (Markdown supported)</label>
                  <textarea 
                    {...register('content')}
                    rows={12}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none font-mono"
                    placeholder="Write your memorandum here..."
                  />
                  {errors.content && <p className="text-rose-500 text-xs mt-1">{errors.content.message as string}</p>}
                </div>
                <div className="flex gap-3">
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
                    {createMutation.isPending ? 'Publishing...' : 'Publish Memo'}
                  </button>
                </div>
              </form>

              <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 overflow-auto">
                <div className="flex items-center gap-2 mb-4 text-slate-500 uppercase tracking-widest text-[10px] font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                  Preview
                </div>
                <h2 className="text-2xl font-bold mb-4">{titleValue || 'Untitled Memo'}</h2>
                <div className="prose prose-invert prose-indigo max-w-none">
                  <ReactMarkdown>{contentValue || '*No content yet...*'}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
