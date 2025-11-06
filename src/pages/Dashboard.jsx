// src/pages/Dashboard.jsx
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
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: '+12.5%',
      trend: 'up',
    },
    {
      title: 'Lượt xác thực',
      value: stats?.totalVerifications || 0,
      icon: ShieldCheck,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      change: '+23.1%',
      trend: 'up',
    },
    {
      title: 'Sản phẩm chính hãng',
      value: stats?.totalAuthentic || 0,
      icon: CheckCircle,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      change: '+18%',
      trend: 'up',
    },
    {
      title: 'Phát hiện giả mạo',
      value: stats?.totalFake || 0,
      icon: AlertTriangle,
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

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-bold text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 py-3 z-50">
                  <div className="px-5 py-4 border-b-2 border-gray-100">
                    <p className="text-base font-bold text-gray-900">{user?.username}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <p className="text-xs text-blue-600 font-bold mt-2">Role: {user?.role || 'Admin'}</p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-5 h-5 text-red-600" />
                    <span className="text-base text-red-600 font-bold">Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Stats Cards - 4 cards đều nhau */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold ${
                  stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-semibold mb-2">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
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
        <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-600" />
            Hoạt động gần đây
          </h2>
          <div className="space-y-4">
            {stats?.recentVerifications && stats.recentVerifications.length > 0 ? (
              stats.recentVerifications.map((verification) => (
                <div 
                  key={verification.id} 
                  className={`flex items-center gap-4 p-5 rounded-2xl transition-all hover:shadow-lg ${
                    verification.isAuthentic 
                      ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200' 
                      : 'bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                    verification.isAuthentic 
                      ? 'bg-emerald-500' 
                      : 'bg-red-500'
                  }`}>
                    {verification.isAuthentic ? (
                      <ShieldCheck className="w-6 h-6 text-white" />
                    ) : (
                      <ShieldAlert className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-base ${
                      verification.isAuthentic ? 'text-emerald-900' : 'text-red-900'
                    }`}>
                      {verification.isAuthentic ? '✅ Sản phẩm chính hãng' : '⚠️ Phát hiện giả mạo'}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      {verification.productName} - {verification.batchNumber}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {verification.location} • {new Date(verification.verifiedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-12 text-base font-medium">Chưa có hoạt động nào</p>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </div>
  );
}