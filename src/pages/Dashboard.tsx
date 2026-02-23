import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Building2, 
  UserCog, 
  CheckSquare, 
  FileText, 
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Mail
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import api from '../api/axiosConfig';
import { motion } from 'motion/react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-slate-900 border border-slate-800 p-6 rounded-2xl"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500 border border-${color}-500/20`}>
        <Icon size={24} />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      {trend > 0 ? (
        <span className="text-emerald-500 flex items-center text-xs font-bold">
          <ArrowUpRight size={14} /> +{trend}%
        </span>
      ) : (
        <span className="text-rose-500 flex items-center text-xs font-bold">
          <ArrowDownRight size={14} /> {trend}%
        </span>
      )}
      <span className="text-slate-500 text-xs">vs last month</span>
    </div>
  </motion.div>
);

export const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await api.get('/api/stats');
      return res.data;
    }
  });

  const departmentData = [
    { name: 'Software', value: 40 },
    { name: 'Support', value: 30 },
    { name: 'Network', value: 30 },
  ];

  const activityData = [
    { name: 'Jan', tasks: 40, memos: 24 },
    { name: 'Feb', tasks: 30, memos: 13 },
    { name: 'Mar', tasks: 20, memos: 98 },
    { name: 'Apr', tasks: 27, memos: 39 },
    { name: 'May', tasks: 18, memos: 48 },
    { name: 'Jun', tasks: 23, memos: 38 },
  ];

  if (isLoading) return <div className="animate-pulse space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-slate-800 rounded-2xl"></div>)}
    </div>
  </div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-slate-400 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Admins" value={stats?.totalAdmins} icon={Users} trend={12} color="indigo" />
        <StatCard title="Total Departments" value={stats?.totalDepartments} icon={Building2} trend={5} color="emerald" />
        <StatCard title="Total Employees" value={stats?.totalEmployees} icon={Users} trend={-2} color="amber" />
        <StatCard title="Total HR Members" value={stats?.totalHR} icon={UserCog} trend={8} color="violet" />
        <StatCard title="Pending Tasks" value={stats?.pendingTasks} icon={CheckSquare} trend={15} color="rose" />
        <StatCard title="Active Memorandums" value={stats?.activeMemos} icon={FileText} trend={0} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-6">Monthly Activity</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Line type="monotone" dataKey="tasks" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="memos" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-6">Department Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {departmentData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                <span className="text-xs text-slate-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="mt-1">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                    <Clock size={18} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">New Memorandum Created</p>
                    <span className="text-xs text-slate-500">2 hours ago</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">Admin John Doe published "Quarterly Safety Guidelines" for all departments.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800 hover:bg-indigo-600 transition-colors group">
              <FileText className="mb-2 text-indigo-400 group-hover:text-white" size={24} />
              <span className="text-xs font-medium">New Memo</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800 hover:bg-emerald-600 transition-colors group">
              <CheckSquare className="mb-2 text-emerald-400 group-hover:text-white" size={24} />
              <span className="text-xs font-medium">Assign Task</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800 hover:bg-amber-600 transition-colors group">
              <UserCog className="mb-2 text-amber-400 group-hover:text-white" size={24} />
              <span className="text-xs font-medium">Add HR</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800 hover:bg-rose-600 transition-colors group">
              <Mail className="mb-2 text-rose-400 group-hover:text-white" size={24} />
              <span className="text-xs font-medium">Send Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
