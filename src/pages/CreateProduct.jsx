// src/pages/CreateProduct.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/app';
import toast from 'react-hot-toast';
import { ArrowLeft, Package, Building2, Hash, Calendar, FileText, Loader, CheckCircle } from 'lucide-react';

export default function CreateProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manufacturer: '',
    batchNumber: '',
    manufactureDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await productAPI.create(formData);
      toast.success('Tạo sản phẩm thành công!');
      navigate(`/products/${data.product.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* HEADER */}
      <div className="bg-white border-b-2 border-gray-200 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex items-center gap-3 mb-4 px-4 py-2 hover:bg-gray-100 rounded-2xl transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
            <span className="font-bold text-gray-600 group-hover:text-gray-900">Quay lại Dashboard</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Package className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tạo sản phẩm mới</h1>
              <p className="text-base text-gray-600 font-medium">Thêm sản phẩm vào blockchain</p>
            </div>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Product Name */}
            <div>
              <label className="block text-base font-bold text-gray-700 mb-3">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  Tên sản phẩm *
                </div>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="block w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-base font-medium"
                placeholder="VD: iPhone 15 Pro Max 256GB"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-base font-bold text-gray-700 mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Mô tả
                </div>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="block w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all resize-none text-base font-medium"
                placeholder="Mô tả chi tiết về sản phẩm..."
              />
            </div>

            {/* Grid 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Manufacturer */}
              <div>
                <label className="block text-base font-bold text-gray-700 mb-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    Nhà sản xuất *
                  </div>
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  required
                  className="block w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all text-base font-medium"
                  placeholder="VD: Apple Inc."
                />
              </div>

              {/* Batch Number */}
              <div>
                <label className="block text-base font-bold text-gray-700 mb-3">
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-orange-600" />
                    Số lô sản xuất *
                  </div>
                </label>
                <input
                  type="text"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  required
                  className="block w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all text-base font-medium"
                  placeholder="VD: BATCH-2024-001"
                />
              </div>
            </div>

            {/* Manufacture Date */}
            <div>
              <label className="block text-base font-bold text-gray-700 mb-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Ngày sản xuất *
                </div>
              </label>
              <input
                type="date"
                name="manufactureDate"
                value={formData.manufactureDate}
                onChange={handleChange}
                required
                className="block w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-base font-medium"
              />
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <p className="text-base text-blue-900 font-medium leading-relaxed">
                  <strong className="font-bold">Lưu ý:</strong> Sau khi tạo, sản phẩm sẽ được lưu lên Ethereum blockchain. 
                  Hệ thống sẽ tự động tạo mã hash unique và QR code để in lên bao bì sản phẩm.
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all text-lg"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {loading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <Package className="w-6 h-6" />
                    <span>Tạo sản phẩm</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}