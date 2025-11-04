// src/pages/ProductDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/app';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Package,
  Calendar,
  Hash,
  Building2,
  CheckCircle,
  Clock,
  Download,
  Share2,
  MapPin,
  Activity,
  Link as LinkIcon,
} from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    loadProduct();
    loadQRCode();
  }, [id]);

  const loadProduct = async () => {
    try {
      const { data } = await productAPI.getProductById(id);
      setProduct(data.product);
    } catch (error) {
      toast.error('Không thể tải thông tin sản phẩm');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const loadQRCode = async () => {
    try {
      const { data } = await productAPI.getQRCode(id);
      setQrCode(data.qrCode);
    } catch (error) {
      console.error('QR code error:', error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `QR-${product?.name || 'product'}-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã tải xuống QR Code');
  };

  const copyProductHash = () => {
    if (product?.productHash) {
      navigator.clipboard.writeText(product.productHash);
      toast.success('Đã sao chép mã hash');
    }
  };

  const shareProduct = async () => {
    const url = `${window.location.origin}/verify?hash=${product?.productHash}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Xác thực sản phẩm: ${product?.name}`,
          url: url,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          navigator.clipboard.writeText(url);
          toast.success('Đã sao chép link xác thực');
        }
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Đã sao chép link xác thực');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
          <button
            onClick={() => navigate('/products')}
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/products')}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chi tiết sản phẩm</h1>
                <p className="text-sm text-gray-500">Thông tin và lịch sử xác thực</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={shareProduct}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Chia sẻ
              </button>
              <button
                onClick={downloadQRCode}
                disabled={!qrCode}
                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Tải QR Code
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR Code Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Mã QR xác thực</h2>
              
              {qrCode ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-6 rounded-xl flex items-center justify-center">
                    <img src={qrCode} alt="QR Code" className="w-full max-w-[280px]" />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      Quét mã QR để xác thực sản phẩm
                    </p>
                    <button
                      onClick={downloadQRCode}
                      className="w-full px-4 py-3 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Tải xuống QR Code
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-8 rounded-xl text-center">
                  <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-4">Đang tạo QR Code...</p>
                </div>
              )}

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Lượt xác thực</span>
                  <span className="font-bold text-gray-900">{product.verificationCount || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Info */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
                  {product.description && (
                    <p className="text-gray-600">{product.description}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nhà sản xuất</p>
                    <p className="font-semibold text-gray-900">{product.manufacturer}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Số lô</p>
                    <p className="font-semibold text-gray-900">{product.batchNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày sản xuất</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(product.manufactureDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày tạo</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Blockchain Info */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin Blockchain</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">Mã Hash sản phẩm</p>
                    <button
                      onClick={copyProductHash}
                      className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      Sao chép
                    </button>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <code className="text-sm text-gray-900 font-mono truncate flex-1">
                      {product.productHash}
                    </code>
                  </div>
                </div>

                {product.txHash && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Transaction Hash</p>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <code className="text-sm text-gray-900 font-mono truncate flex-1">
                        {product.txHash}
                      </code>
                    </div>
                  </div>
                )}

                {product.blockNumber && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Block Number</p>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Activity className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-900 font-semibold">
                        {product.blockNumber}
                      </p>
                    </div>
                  </div>
                )}

                {product.contractAddress && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Contract Address</p>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <code className="text-sm text-gray-900 font-mono truncate flex-1">
                        {product.contractAddress}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Verification History */}
            {product.verifications && product.verifications.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Lịch sử xác thực</h3>
                
                <div className="space-y-3">
                  {product.verifications.map((verification, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Xác thực thành công</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          {verification.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {verification.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(verification.verifiedAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}