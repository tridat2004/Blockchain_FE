// src/pages/ProductDetail.jsx
import { useState, useEffect, useRef } from 'react';
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
  Camera,
  AlertCircle,
} from 'lucide-react';
import QRScanner from '../components/QRScanner';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const scannedRef = useRef(false);
  const [page, setPage] = useState(1);
const itemsPerPage = 5;
const totalPages = Math.ceil((product?.verifications?.length || 0) / itemsPerPage);

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
      navigator.clipboard.writeText(product.productHash);
      toast.success('Đã sao chép mã hash');
  };

  const shareProduct = async () => {
    const url = `${window.location.origin}/verify/${product?.productHash}`;
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

  const handleQRScan = async (decodedText) => {
  if (scannedRef.current) return;
  scannedRef.current = true;

  console.log("QR Scanned:", decodedText);

  let scannedHash = null;

  try {
    const parsed = JSON.parse(decodedText);
    scannedHash = parsed.productHash;
  } catch {
    // Nếu không phải JSON, lấy hash từ URL hoặc plain text
    if (decodedText.includes('/verify/')) {
      scannedHash = decodedText.split('/verify/')[1].split('?')[0];
    } else if (decodedText.startsWith('0x')) {
      scannedHash = decodedText;
    }
  }

  if (!scannedHash) {
    toast.error("Không đọc được hash từ QR!");
    scannedRef.current = false;
    setShowScanner(false);
    return;
  }

  console.log("Hash từ QR:", scannedHash);
  console.log("Hash sản phẩm A:", product.productHash);

  // FIX CHÍNH: SO SÁNH CHÍNH XÁC
  // FIX: QUÉT ĐÚNG → TỰ ĐỘNG CHUYỂN TRANG XÁC THỰC
if (scannedHash.toLowerCase() === product.productHash.toLowerCase()) {
  toast.success(
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg">
        <CheckCircle className="w-8 h-8 text-emerald-600" />
      </div>
      <div>
        <p className="font-bold text-emerald-900 text-lg">QR ĐÚNG 100%!</p>
        <p className="text-emerald-700 font-medium">Đang chuyển trang xác thực...</p>
      </div>
    </div>,
    {
      duration: 1000,
      position: 'top-right',
      style: {
        background: 'linear-gradient(135deg, #d4f4e2 0%, #a7e8c4 100%)',
        border: '3px solid #34d399',
        borderRadius: '20px',
        padding: '16px 24px',
        boxShadow: '0 20px 40px rgba(52, 211, 153, 0.3)',
        maxWidth: '420px',
      },
      icon: false,
    }
  );

  // TỰ ĐỘNG CHUYỂN TRANG SAU 1.5 GIÂY
  setTimeout(() => {
    navigate(`/verify/${scannedHash}`);
  }, 1500);

} else {
  toast.error(
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shadow-lg">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <div>
        <p className="font-bold text-red-900 text-lg">QR SAI!</p>
        <p className="text-red-700 font-medium">Cảnh báo hàng giả!</p>
      </div>
    </div>,
    {
      duration: 1000,
      position: 'top-right',
      style: {
        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
        border: '3px solid #f87171',
        borderRadius: '20px',
        padding: '16px 24px',
        boxShadow: '0 20px 40px rgba(248, 113, 113, 0.3)',
        maxWidth: '420px',
      },
      icon: false,
    }
  );
}

  scannedRef.current = false;
  setShowScanner(false);
};
  const openScanner = () => {
    scannedRef.current = false;
    setShowScanner(true);
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
          <button onClick={() => navigate('/products')} className="text-primary-600 hover:text-primary-700 font-semibold">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">

      {/* HEADER SIÊU ĐẸP */}
      <div className="bg-white border-b border-gray-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/products')}
                className="group w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 shadow-md"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Package className="w-9 h-9 text-primary-600" />
                  Chi tiết sản phẩm
                </h1>
                <p className="text-sm text-gray-500 font-medium">Kiểm tra QR • Xác thực Blockchain • Chống hàng giả</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={openScanner}
                className="group relative px-7 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-2xl hover:shadow-emerald-500/60 transform hover:scale-110 transition-all duration-300 flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <Camera className="w-6 h-6 animate-pulse" />
                <span className="relative tracking-wider">KIỂM TRA QR CỦA TÔI</span>
                <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
              </button>

              <button
                onClick={shareProduct}
                className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Chia sẻ
              </button>

              <button
                onClick={downloadQRCode}
                disabled={!qrCode}
                className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-blue-500/40 transform hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                Tải QR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* QR CODE + GỢI Ý IN THỬ */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Mã QR Xác Thực</h2>
              
              {qrCode ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl flex items-center justify-center shadow-inner">
                    <img src={qrCode} alt="QR Code" className="w-full max-w-[300px] rounded-xl shadow-lg" />
                  </div>
                  
                  <div className="text-center space-y-4">
                    <p className="text-gray-600 font-medium">Quét mã QR để xác thực sản phẩm</p>
                    <button
                      onClick={downloadQRCode}
                      className="w-full px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg transform hover:scale-105 transition-all"
                    >
                      <Download className="w-5 h-5 inline mr-2" />
                      Tải xuống QR Code
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-12 rounded-2xl text-center">
                  <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-4 font-medium">Đang tạo QR Code...</p>
                </div>
              )}

              <div className="mt-8 pt-8 border-t-2 border-gray-200">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-gray-600 font-semibold">Lượt xác thực</span>
                  <span className="font-bold text-emerald-600 text-2xl">
                    {product.verificationCount?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* GỢI Ý IN THỬ – SIÊU CHUYÊN NGHIỆP */}
            {/* <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border-4 border-amber-300 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-200 rounded-full blur-3xl opacity-50"></div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-amber-200 rounded-2xl flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-9 h-9 text-amber-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-amber-900">Nhà sản xuất: Làm đúng 1 lần, yên tâm cả đời!</h3>
                </div>
                <div className="space-y-4 text-amber-800 font-medium">
                  <p className="flex items-center gap-3 text-lg">
                    <span className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                    In thử <strong>1 tem QR</strong>
                  </p>
                  <p className="flex items-center gap-3 text-lg">
                    <span className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                    Dán lên sản phẩm mẫu
                  </p>
                  <p className="flex items-center gap-3 text-lg">
                    <span className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                    Bấm nút <span className="px-4 py-2 bg-emerald-600 text-white rounded-full font-bold">KIỂM TRA QR CỦA TÔI</span>
                  </p>
                </div>
                <p className="mt-6 text-amber-900 font-bold text-xl italic text-center">
                  60 giây kiểm tra = 10 năm chống hàng giả thành công!
                </p>
              </div>
            </div> */}
          </div>

          {/* THÔNG TIN SẢN PHẨM */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h2>
                  {product.description && (
                    <p className="text-lg text-gray-600 leading-relaxed">{product.description}</p>
                  )}
                </div>
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: Building2, label: "Nhà sản xuất", value: product.manufacturer },
                  { icon: Package, label: "Số lô", value: product.batchNumber },
                  { icon: Calendar, label: "Ngày sản xuất", value: new Date(product.manufactureDate).toLocaleDateString('vi-VN') },
                  { icon: Clock, label: "Ngày tạo", value: new Date(product.createdAt).toLocaleDateString('vi-VN') },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-md">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow">
                      <item.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                      <p className="text-lg font-bold text-gray-900">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BLOCKCHAIN INFO */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 shadow-2xl border-2 border-blue-200">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                <Activity className="w-8 h-8" />
                Thông tin Blockchain
              </h3>
              <div className="space-y-5">
                <div className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-600 font-medium">Mã Hash sản phẩm</p>
                    <button onClick={copyProductHash} className="text-sm text-blue-600 hover:text-blue-800 font-bold">
                      Sao chép
                    </button>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-xl">
                    <Hash className="w-5 h-5 text-blue-400" />
                    <code className="text-sm text-blue-300 font-mono truncate">{product.productHash}</code>
                  </div>
                </div>
                {product.txHash && (
                  <div className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-lg">
                    <p className="text-gray-600 font-medium mb-3">Transaction Hash</p>
                    <code className="text-xs text-gray-700 font-mono break-all bg-gray-100 p-3 rounded-lg">
                      {product.txHash}
                    </code>
                  </div>
                )}
              </div>
            </div>

            {/* LỊCH SỬ XÁC THỰC */}
            
            {product.verifications && product.verifications.length > 0 && (
  <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
      <Clock className="w-8 h-8 text-blue-600" />
      Lịch sử xác thực
      <span className="ml-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
        {product.verifications.length} lượt
      </span>
    </h3>

    {/* DANH SÁCH CÓ PHÂN TRANG */}
    <div className="space-y-4">
      {product.verifications
        .slice((page - 1) * itemsPerPage, page * itemsPerPage)
        .map((v, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-5 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-emerald-100"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shadow-inner">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">Xác thực thành công</p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                {v.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    {v.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-purple-600" />
                  {new Date(v.verifiedAt).toLocaleString('vi-VN')}
                </span>
                {v.deviceInfo && (
                  <span className="text-xs text-gray-500 italic">
                    ({v.deviceInfo.split(' ')[0]})
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
    </div>

    {/* PHÂN TRANG SIÊU ĐẸP */}
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-gray-600 font-medium">
        Hiển thị{' '}
        <span className="font-bold text-emerald-600">
          {(page - 1) * itemsPerPage + 1}
        </span>{' '}
        -{' '}
        <span className="font-bold text-emerald-600">
          {Math.min(page * itemsPerPage, product.verifications.length)}
        </span>{' '}
        trong tổng <span className="font-bold">{product.verifications.length}</span> lượt
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-xl font-bold transition-all shadow-md disabled:cursor-not-allowed"
        >
          Trước
        </button>

        {/* Hiển thị tối đa 5 trang */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`w-11 h-11 rounded-xl font-bold transition-all shadow-md ${
                page === pageNum
                  ? 'bg-emerald-600 text-white scale-110 shadow-emerald-500/50'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {pageNum}
            </button>
          );
        }).concat(
          totalPages > 5 && page > 3 ? (
            <span key="dots" className="px-2 text-gray-500">...</span>
          ) : null
        ).concat(
          totalPages > 5 && page < totalPages - 2 ? (
            <button
              key={totalPages}
              onClick={() => setPage(totalPages)}
              className="w-11 h-11 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-md transition-all"
            >
              {totalPages}
            </button>
          ) : null
        )}

        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-xl font-bold transition-all shadow-md disabled:cursor-not-allowed"
        >
          Sau
        </button>
      </div>
    </div>
  </div>
)}
          </div>
        </div>
      </div>

      {/* QR SCANNER MODAL */}
      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}