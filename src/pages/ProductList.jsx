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
  ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const qrRefs = useRef({});

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data } = await productAPI.getAll({ page, limit: 10, search });
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
      // Get the QR SVG element
      const qrElement = qrRefs.current[product.id];
      if (!qrElement) {
        toast.error('Không tìm thấy mã QR');
        return;
      }

      // Create canvas
      const canvas = document.createElement('canvas');
      const svg = qrElement.querySelector('svg');
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // Download
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại Dashboard</span>
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Danh sách sản phẩm</h1>
                <p className="text-sm text-gray-500">
                  {pagination?.total || 0} sản phẩm
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/products/create')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Tạo sản phẩm
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500"
              />
            </div>
            <button className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Lọc
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có sản phẩm</h3>
            <p className="text-gray-600 mb-6">Tạo sản phẩm đầu tiên của bạn</p>
            <button
              onClick={() => navigate('/products/create')}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-xl font-semibold hover:shadow-xl"
            >
              Tạo ngay
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  {/* QR Code - Clickable */}
                  <div 
                    onClick={() => viewProductDetail(product)}
                    className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 mb-4 flex items-center justify-center cursor-pointer hover:from-primary-100 hover:to-primary-200 transition-all group"
                    ref={el => qrRefs.current[product.id] = el}
                  >
                    <div className="relative">
                      <QRCodeSVG
                        value={product.productHash || `${window.location.origin}/verify/${product.id}`}
                        size={128}
                        level="H"
                        includeMargin={true}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/50 rounded-full p-2">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Info - Clickable */}
                  <div 
                    onClick={() => viewProductDetail(product)}
                    className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 mb-4 transition-colors"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{product.manufacturer}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Hash className="w-4 h-4 flex-shrink-0" />
                        <span className="font-mono truncate">{product.batchNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{new Date(product.manufactureDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary-600">
                        {product.verificationCount || 0}
                      </p>
                      <p className="text-xs text-gray-500">Lượt xác thực</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewProductDetail(product);
                        }}
                        className="p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                        title="Xem chi tiết"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadQR(product);
                        }}
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        title="Tải QR"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Trước
                </button>
                <span className="px-4 py-2 font-medium">
                  Trang {page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">{selectedProduct.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 font-semibold">Mô tả:</label>
                <p className="font-medium mt-1">{selectedProduct.description || 'Không có'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-semibold">Product Hash:</label>
                <p className="font-mono text-sm break-all bg-gray-50 p-3 rounded-lg mt-1">
                  {selectedProduct.productHash}
                </p>
              </div>
              {selectedProduct.txHash && (
                <div>
                  <label className="text-sm text-gray-600 font-semibold">Transaction Hash:</label>
                  <p className="font-mono text-sm break-all bg-gray-50 p-3 rounded-lg mt-1">
                    {selectedProduct.txHash}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  viewProductDetail(selectedProduct);
                }}
                className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors"
              >
                Xem chi tiết đầy đủ
              </button>
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}