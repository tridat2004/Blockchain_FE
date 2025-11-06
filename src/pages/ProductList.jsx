// src/pages/ProductList.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/app';
import toast from 'react-hot-toast';
import { 
  Package, 
  Search, 
  Plus, 
  Eye, 
  Download,
  Filter,
  Calendar,
  Building2,
  Hash,
  ArrowLeft,
  ExternalLink,
  Loader
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const qrRefs = useRef({});

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data } = await productAPI.getAll({ page, limit: 6, search });
      console.log('📦 Products data:', data)
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = (product) => {
    try {
      const qrElement = qrRefs.current[product.id];
      if (!qrElement) {
        toast.error('Không tìm thấy mã QR');
        return;
      }

      const canvas = document.createElement('canvas');
      const svg = qrElement.querySelector('svg');
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${product.name.replace(/\s+/g, '-')}-QR.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        toast.success('Đã tải mã QR thành công!');
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      console.error('Error downloading QR:', error);
      toast.error('Không thể tải mã QR');
    }
  };

  const viewProductDetail = (product) => {
    navigate(`/products/${product.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* HEADER */}
      <div className="bg-white border-b-2 border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex items-center gap-3 mb-4 px-4 py-2 hover:bg-gray-100 rounded-2xl transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
            <span className="font-bold text-gray-600 group-hover:text-gray-900">Quay lại Dashboard</span>
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Package className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Danh sách sản phẩm</h1>
                <p className="text-base text-gray-600 font-medium">
                  {pagination?.total || 0} sản phẩm
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/products/create')}
              className="flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              <Plus className="w-6 h-6" />
              Tạo sản phẩm
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Search & Filter */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border-2 border-gray-100">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-base font-medium"
              />
            </div>
            <button className="px-6 py-4 border-2 border-gray-300 rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-2 font-bold">
              <Filter className="w-5 h-5" />
              Lọc
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 animate-pulse">
                <div className="w-full h-52 bg-gray-200 rounded-2xl mb-6"></div>
                <div className="h-7 bg-gray-200 rounded-xl mb-3"></div>
                <div className="h-5 bg-gray-200 rounded-xl w-2/3"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-xl border-2 border-gray-100">
            <Package className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có sản phẩm</h3>
            <p className="text-gray-600 mb-8 text-lg">Tạo sản phẩm đầu tiên của bạn</p>
            <button
              onClick={() => navigate('/products/create')}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Tạo ngay
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 transform hover:-translate-y-2"
                >
                  {/* QR Code */}
                  <div 
                    onClick={() => viewProductDetail(product)}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-6 flex items-center justify-center cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all group"
                    ref={el => qrRefs.current[product.id] = el}
                  >
                    <div className="relative">
                      <QRCodeSVG
                        value={product.productHash || `${window.location.origin}/verify/${product.id}`}
                        size={140}
                        level="H"
                        includeMargin={true}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/60 rounded-full p-3 backdrop-blur">
                          <Eye className="w-7 h-7 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div 
                    onClick={() => viewProductDetail(product)}
                    className="cursor-pointer hover:bg-gray-50 rounded-2xl p-3 -m-3 mb-6 transition-all"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2">
                      {product.name}
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-base text-gray-700">
                        <Building2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                        <span className="truncate font-medium">{product.manufacturer}</span>
                      </div>
                      <div className="flex items-center gap-3 text-base text-gray-700">
                        <Hash className="w-5 h-5 flex-shrink-0 text-orange-600" />
                        <span className="font-mono truncate font-medium">{product.batchNumber}</span>
                      </div>
                      <div className="flex items-center gap-3 text-base text-gray-700">
                        <Calendar className="w-5 h-5 flex-shrink-0 text-blue-600" />
                        <span className="font-medium">{new Date(product.manufactureDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">
                        {product.verificationCount || 0}
                      </p>
                      <p className="text-sm text-gray-500 font-medium">Lượt xác thực</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewProductDetail(product);
                        }}
                        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all shadow-md"
                        title="Xem chi tiết"
                      >
                        <ExternalLink className="w-6 h-6" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadQR(product);
                        }}
                        className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all shadow-md"
                        title="Tải QR"
                      >
                        <Download className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div  className="flex items-center justify-between gap-6 mt-12" >
                {/* Info text */}
                <p className="text-gray-600 font-medium text-base">
                  Hiển thị <span className="font-bold text-emerald-600">{((page - 1) * 6) + 1}</span> -{' '}
                  <span className="font-bold text-emerald-600">
                    {Math.min(page * 6, pagination.total)}
                  </span>{' '}
                  trong tổng <span className="font-bold text-gray-900">{pagination.total}</span> lượt
                </p>

                {/* Pagination buttons */}
                <div className="flex items-center gap-3">
                  {/* Button Trước */}
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                  >
                    Trước
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`min-w-[48px] h-12 px-4 rounded-xl font-bold transition-all shadow-md ${
                          page === pageNum
                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white scale-110 shadow-emerald-500/50'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-emerald-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  {/* Button Sau */}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.totalPages}
                    className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}