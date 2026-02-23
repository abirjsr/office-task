import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Mail, Send, History, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

export const EmailSystem = () => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      to: '',
      subject: '',
      text: ''
    }
  });

  const sendMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/users/send', data),
    onSuccess: () => {
      toast.success('Email sent successfully');
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to send email');
    }
  });

  const templates = [
    { name: 'Welcome Email', subject: 'Welcome to the Team!', text: 'Hello,\n\nWelcome to our office management system. We are excited to have you on board.\n\nBest regards,\nAdmin' },
    { name: 'Task Assignment', subject: 'New Task Assigned', text: 'Hello,\n\nA new task has been assigned to you. Please check your dashboard for details.\n\nBest regards,\nAdmin' },
    { name: 'Reminder', subject: 'Pending Task Reminder', text: 'Hello,\n\nThis is a friendly reminder about your pending tasks. Please ensure they are completed by the due date.\n\nBest regards,\nAdmin' },
  ];

  const applyTemplate = (tpl: any) => {
    setValue('subject', tpl.subject);
    setValue('text', tpl.text);
    toast.success(`${tpl.name} template applied`);
  };

  const onSubmit = (data: any) => sendMutation.mutate(data);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Email Notification System</h2>
        <p className="text-slate-400">Compose and send official emails to employees and HR.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">To</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    {...register('to', { required: 'Recipient is required' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    placeholder="recipient@example.com"
                  />
                </div>
                {errors.to && <p className="text-rose-500 text-xs mt-1">{errors.to.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
                <input 
                  {...register('subject', { required: 'Subject is required' })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  placeholder="Enter subject"
                />
                {errors.subject && <p className="text-rose-500 text-xs mt-1">{errors.subject.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Message Body</label>
                <textarea 
                  {...register('text', { required: 'Message is required' })}
                  rows={10}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none"
                  placeholder="Type your message here..."
                />
                {errors.text && <p className="text-rose-500 text-xs mt-1">{errors.text.message}</p>}
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={sendMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {sendMutation.isPending ? 'Sending...' : (
                    <>
                      <Send size={20} />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText size={20} className="text-indigo-400" />
              Templates
            </h3>
            <div className="space-y-3">
              {templates.map((tpl, i) => (
                <button 
                  key={i}
                  onClick={() => applyTemplate(tpl)}
                  className="w-full text-left p-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group"
                >
                  <p className="font-bold text-sm group-hover:text-indigo-400 transition-colors">{tpl.name}</p>
                  <p className="text-xs text-slate-500 mt-1 truncate">{tpl.subject}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <History size={20} className="text-emerald-400" />
              Recent History
            </h3>
            <div className="space-y-4">
              {[1, 2].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-1">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">jane@company.com</p>
                    <p className="text-[10px] text-slate-500">Welcome Email • 2 hours ago</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-3">
                <div className="mt-1">
                  <AlertCircle size={14} className="text-rose-500" />
                </div>
                <div>
                  <p className="text-xs font-bold">invalid-email@test</p>
                  <p className="text-[10px] text-slate-500">Failed to deliver • 5 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
