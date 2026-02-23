import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Download, User, Mail, Phone, MapPin } from 'lucide-react';
import api from '../api/axiosConfig';
import { Employee } from '../types';

export const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/admin/users/employees');
      return res.data;
    }
  });

  const filteredEmployees = employees?.filter((emp: Employee) => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employee Directory</h2>
          <p className="text-slate-400">View and manage all office employees.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Download size={20} />
          Export to Excel
        </button>
      </div>

      <div className="flex flex-wrap gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
        <div className="w-48">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          [...Array(8)].map((_, i) => <div key={i} className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>)
        ) : (
          filteredEmployees?.map((emp: Employee) => (
            <div key={emp.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all group">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-2xl border border-indigo-500/20 mb-4 group-hover:scale-110 transition-transform">
                  {emp.fullName[0]}
                </div>
                <h3 className="text-lg font-bold">{emp.fullName}</h3>
                <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider mt-1">Employee ID: {emp.id}</p>
                
                <div className="mt-4 flex gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    emp.status === 'active' 
                      ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' 
                      : 'bg-slate-400/10 text-slate-400 border-slate-400/20'
                  }`}>
                    {emp.status}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700">
                    {emp.gender}
                  </span>
                </div>

                <div className="mt-6 w-full space-y-3 text-left">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Mail size={14} className="text-slate-500" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Phone size={14} className="text-slate-500" />
                    <span>{emp.phoneNumber}</span>
                  </div>
                </div>

                <button className="mt-6 w-full py-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
