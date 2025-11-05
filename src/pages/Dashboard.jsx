import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { statsAPI } from '../services/app';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Package,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Users,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
  User,
  Plus,
  Eye,

  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [chartData, setChartData] = useState({
    verifications: [],
    products: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await statsAPI.getChartData();
        const days = Array.isArray(data?.last7Days) ? data.last7Days : [];

        setChartData({
          verifications: days.map(d => ({
            name: d.day || '',
            value: Number(d.total) || 0
          })),
          products: days.map(d => ({
            name: d.day || '',
            authentic: Number(d.authentic) || 0,
            fake: Number(d.fake) || 0
          }))
        });
      } catch (err) {
        console.error('Error loading chart:', err);
        toast.error('Không thể tải dữ liệu biểu đồ');
      }
    };

    loadStats();
    fetchData();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await statsAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công!');
    navigate('/login');
  };

  const statCards = [
  {
    title: 'Tổng sản phẩm',
    value: stats?.totalProducts || 0,
    icon: Package,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    change: '+12.5%',
    trend: 'up',
  },
  {
    title: 'Lượt xác thực',
    value: stats?.totalVerifications || 0,
    icon: ShieldCheck,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    change: '+23.1%',
    trend: 'up',
  },
  {
    title: 'Sản phẩm chính hãng',
    value: stats?.totalAuthentic || 0,
    icon: CheckCircle,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    change: '+18%',
    trend: 'up',
  },
  {
    title: 'Phát hiện giả mạo',
    value: stats?.totalFake || 0,
    icon: AlertTriangle,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
    change: stats?.totalFake > 0 ? '+' + stats.totalFake : '0',
    trend: 'down',
  },
];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* HEADER */}
      <div className="bg-white border-b-2 border-gray-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
              <LayoutDashboard className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-base text-gray-600 font-medium">
                Chào mừng trở lại, {user?.username || user?.email}
              </p>
            </div>
          </div>

          {/* User + Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3.5 bg-white border-2 border-blue-500 text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transform hover:scale-105 transition-all shadow-lg flex items-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Danh sách sản phẩm
            </button>
            <button
              onClick={() => navigate('/products/create')}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tạo sản phẩm
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {statCards.map((stat, index) => (
            <div
              key={index}
              onClick={stat.onClick}
              className={`bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100 ${
                stat.onClick ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className={`w-9 h-9 ${stat.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1.5 text-base font-bold ${
                  stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5" />
                  )}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-gray-600 text-base font-semibold mb-3">{stat.title}</h3>
              <p className="text-4xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Verification Trend */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Xu hướng xác thực</h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData.verifications || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} fill="#bae6fd" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Product Statistics */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Thống kê sản phẩm</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData.products || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="authentic" stroke="#22c55e" strokeWidth={3} />
                <Line type="monotone" dataKey="fake" stroke="#ef4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
       
<div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-fade-in">
  <h2 className="text-lg font-bold text-gray-900 mb-6">Hoạt động gần đây</h2>
  <div className="space-y-4">
    {stats?.recentVerifications && stats.recentVerifications.length > 0 ? (
      stats.recentVerifications.map((verification) => (
        <div 
          key={verification.id} 
          className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
            verification.isAuthentic 
              ? 'hover:bg-green-50 border border-green-100' 
              : 'hover:bg-red-50 border border-red-100'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            verification.isAuthentic 
              ? 'bg-green-500' 
              : 'bg-red-500'
          }`}>
            {verification.isAuthentic ? (
              <ShieldCheck className="w-6 h-6 text-white" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1">
            <p className={`font-semibold ${
              verification.isAuthentic ? 'text-green-900' : 'text-red-900'
            }`}>
              {verification.isAuthentic ? '✅ Sản phẩm chính hãng' : '⚠️ Phát hiện giả mạo'}
            </p>
            <p className="text-sm text-gray-500">
              {verification.productName} - {verification.batchNumber}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {verification.location} • {new Date(verification.verifiedAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      ))
    ) : (
      <p className="text-center text-gray-500 py-8">Chưa có hoạt động nào</p>
    )}
  </div>
</div>
      </div>
    </div>
  );
}
