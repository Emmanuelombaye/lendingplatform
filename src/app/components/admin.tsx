import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  PieChart, 
  Settings, 
  AlertTriangle, 
  FileCheck, 
  BarChart3,
  Search,
  Bell,
  MoreVertical,
  Check,
  Clock,
  X,
  Eye,
  Download
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Card, Badge, Button, cn } from './ui';

// --- ADMIN COMPONENTS ---

export const AdminSidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'applications', label: 'Applications', icon: <Users size={20} /> },
    { id: 'processing-fees', label: 'Processing Fees', icon: <FileCheck size={20} /> },
    { id: 'loans', label: 'Active Loans', icon: <CreditCard size={20} /> },
    { id: 'defaulters', label: 'Defaulters', icon: <AlertTriangle size={20} />, danger: true },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-72 bg-[#0F172A] min-h-screen fixed left-0 top-0 flex flex-col p-6 z-50">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <FileCheck className="text-white" size={18} />
        </div>
        <span className="text-white font-bold text-xl tracking-tight">Kredo Admin</span>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium",
              activeTab === item.id 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" 
                : item.danger 
                  ? "text-red-400 hover:bg-red-950/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">Jane Doe</p>
            <p className="text-xs text-slate-500 truncate">Senior Underwriter</p>
          </div>
          <Button variant="ghost" className="p-1 h-auto text-slate-500 hover:text-white">
            <Settings size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const AdminHeader = ({ title, onNavigate }: { title: string, onNavigate: (v: string) => void }) => (
  <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
    <h1 className="text-2xl font-bold text-[#0F172A]">{title}</h1>
    <div className="flex items-center gap-6">
      <div className="relative group hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search applications..." 
          className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
        />
      </div>
      <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
        <Bell size={20} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
      <div className="w-px h-8 bg-slate-100" />
      <Button variant="outline" size="sm" onClick={() => onNavigate('home')}>
        Public Site
      </Button>
    </div>
  </header>
);

export const DashboardOverview = () => {
  const stats = [
    { label: "Total Applications", value: "1,284", change: "+12.5%", icon: <Users className="text-blue-600" /> },
    { label: "Pending Review", value: "48", change: "-4", icon: <Clock className="text-amber-600" /> },
    { label: "Approved (MTD)", value: "312", change: "+8.2%", icon: <Check className="text-emerald-600" /> },
    { label: "Disbursed Capital", value: "KES 42.5M", change: "+14.3%", icon: <CreditCard className="text-indigo-600" /> },
  ];

  const chartData = [
    { name: 'Jan', apps: 400, disbursed: 240 },
    { name: 'Feb', apps: 300, disbursed: 139 },
    { name: 'Mar', apps: 520, disbursed: 380 },
    { name: 'Apr', apps: 480, disbursed: 390 },
    { name: 'May', apps: 610, disbursed: 480 },
    { name: 'Jun', apps: 590, disbursed: 420 },
  ];

  const statusData = [
    { name: 'Approved', value: 65, color: '#10b981' },
    { name: 'Rejected', value: 20, color: '#f43f5e' },
    { name: 'Pending', value: 15, color: '#f59e0b' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                {stat.icon}
              </div>
              <Badge variant={stat.change.startsWith('+') ? 'success' : 'warning'}>
                {stat.change}
              </Badge>
            </div>
            <div className="text-sm font-medium text-slate-500 mb-1">{stat.label}</div>
            <div className="text-3xl font-bold text-[#0F172A]">{stat.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-8 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Loan Disbursement vs Applications</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-xs font-medium text-slate-500">Applications</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-slate-500">Disbursed (M)</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="apps" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="disbursed" fill="#10B981" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8">
          <h3 className="font-bold text-lg mb-8">Approval Distribution</h3>
          <div className="h-[240px] w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {statusData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="text-sm font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-lg">Recent Applications</h3>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Applied Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: "Samuel Kamau", email: "sam.k@gmail.com", amount: "KES 150,000", date: "Oct 12, 2026", status: "Pending" },
                { name: "Faith Wambui", email: "faith.w@outlook.com", amount: "KES 50,000", date: "Oct 11, 2026", status: "Approved" },
                { name: "David Mutua", email: "dmutua@business.ke", amount: "KES 300,000", date: "Oct 10, 2026", status: "Rejected" },
                { name: "Alice Njeri", email: "alice.n@gmail.com", amount: "KES 80,000", date: "Oct 10, 2026", status: "Pending" }
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-bold text-slate-900">{row.name}</div>
                      <div className="text-xs text-slate-500">{row.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#0F172A]">{row.amount}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{row.date}</td>
                  <td className="px-6 py-4">
                    <Badge variant={row.status === 'Approved' ? 'success' : row.status === 'Rejected' ? 'danger' : 'warning'}>
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                       <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={18} /></button>
                       <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Check size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export const ApplicationManagement = () => (
  <div className="p-8">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A]">Loan Applications</h2>
        <p className="text-slate-500">Review and manage incoming loan requests.</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" size="md">
          <Download className="mr-2 w-4 h-4" /> Export CSV
        </Button>
        <Button size="md">Filter Results</Button>
      </div>
    </div>

    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Full Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Phone</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">ID Number</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Loan Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Period</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Docs</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5, 6, 7].map((_, i) => (
              <tr key={i} className="hover:bg-slate-50/30">
                <td className="px-6 py-4 font-medium">Customer {i + 1}</td>
                <td className="px-6 py-4 text-sm text-slate-600">+254 712 345 67{i}</td>
                <td className="px-6 py-4 text-sm text-slate-600">334455{i}</td>
                <td className="px-6 py-4 font-bold">KES {(40000 + i * 20000).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">{Math.floor(Math.random() * 6) + 1} Months</td>
                <td className="px-6 py-4"><Badge variant="info">In Review</Badge></td>
                <td className="px-6 py-4 text-blue-600 font-bold cursor-pointer hover:underline text-xs">View Docs (6)</td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="text-emerald-600">Approve</Button>
                    <Button variant="ghost" size="sm" className="text-rose-600">Reject</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);

export const Reports = () => {
  const data = [
    { month: 'Jan', profit: 2400, capital: 4000, defaults: 120 },
    { month: 'Feb', profit: 1398, capital: 3000, defaults: 80 },
    { month: 'Mar', profit: 9800, capital: 12000, defaults: 200 },
    { month: 'Apr', profit: 3908, capital: 5000, defaults: 150 },
    { month: 'May', profit: 4800, capital: 6000, defaults: 90 },
    { month: 'Jun', profit: 3800, capital: 5500, defaults: 110 },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6">
           <h4 className="text-slate-500 text-sm font-medium">Monthly Profit</h4>
           <div className="text-2xl font-bold mt-2 text-emerald-600">KES 1.4M</div>
        </Card>
        <Card className="p-6">
           <h4 className="text-slate-500 text-sm font-medium">Total Interest Earned</h4>
           <div className="text-2xl font-bold mt-2">KES 8.2M</div>
        </Card>
        <Card className="p-6">
           <h4 className="text-slate-500 text-sm font-medium">Capital Deployed</h4>
           <div className="text-2xl font-bold mt-2 text-blue-600">KES 142.5M</div>
        </Card>
        <Card className="p-6">
           <h4 className="text-slate-500 text-sm font-medium">Default Rate</h4>
           <div className="text-2xl font-bold mt-2 text-rose-600">2.4%</div>
        </Card>
      </div>

      <Card className="p-8">
        <h3 className="font-bold text-lg mb-8">Revenue Growth Analysis</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip />
              <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} dot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="capital" stroke="#2563EB" strokeWidth={3} dot={{ r: 6, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export const SettingsPage = () => (
  <div className="p-8 max-w-4xl">
    <h2 className="text-2xl font-bold mb-8">System Settings</h2>
    <Card className="p-8 space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Monthly Interest Rate (%)</label>
          <input type="number" defaultValue={6} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Processing Fee (%)</label>
          <input type="number" defaultValue={6.5} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Minimum Loan Amount (KES)</label>
          <input type="number" defaultValue={40000} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Maximum Loan Amount (KES)</label>
          <input type="number" defaultValue={300000} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Max Repayment Period (Months)</label>
          <select className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">
             <option>6 Months</option>
             <option>12 Months</option>
             <option>24 Months</option>
          </select>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save System Settings</Button>
      </div>
    </Card>

    <div className="mt-8">
       <Card className="p-8 border-rose-100 bg-rose-50/20">
          <h3 className="font-bold text-rose-800 mb-2">Danger Zone</h3>
          <p className="text-sm text-rose-600 mb-6">These actions are irreversible. Please proceed with caution.</p>
          <Button variant="danger">Reset All Loan Data</Button>
       </Card>
    </div>
  </div>
);

export const PlaceholderView = ({ title }: { title: string }) => (
  <div className="p-8">
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-2xl font-bold text-[#0F172A]">{title}</h2>
    </div>
    <Card className="p-20 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <Clock className="text-slate-300 w-10 h-10" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title} Module</h3>
      <p className="text-slate-500 max-w-sm">This module is currently being populated with real-time financial data. Please check back shortly.</p>
    </Card>
  </div>
);
