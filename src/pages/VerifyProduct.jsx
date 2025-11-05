// src/pages/VerifyProduct.jsx
import { useState } from 'react';
import { productAPI } from '../services/app';
import toast from 'react-hot-toast';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  QrCode, 
  CheckCircle2,
  AlertTriangle,
  Package,
  Building2,
  Hash,
  Calendar,
  Eye,
  Camera,
  Sparkles
} from 'lucide-react';
import QRScanner from '../components/QRScanner';

export default function VerifyProduct() {
  const [productHash, setProductHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleQRScan = (decodedText) => {
  console.log("QR Scanned:", decodedText);

  let hash = null;

  // Thử parse JSON
  try {
    const parsed = JSON.parse(decodedText);
    hash = parsed.productHash;
    console.log("Extracted hash from JSON:", hash);
  } catch (parseError) {
    console.log("Not JSON, sending raw text as hash...");
    // Gửi toàn bộ decodedText làm hash
    hash = decodedText.trim();
  }

  if (!hash) {
    toast.error('Không thể đọc mã hash từ QR code!');
    setShowScanner(false);
    return;
  }

  console.log("Final hash to verify:", hash);
  setProductHash(hash);
  setShowScanner(false);
  toast.success('Đã quét thành công!');

  // Gọi server xác thực luôn
  setTimeout(() => {
    handleVerify(null, hash);
  }, 300);
};


  const handleVerify = async (e, hashToVerify = null) => {
    if (e) e.preventDefault();
    
    const hash = hashToVerify || productHash;
    
    if (!hash.trim()) {
      toast.error('Vui lòng nhập mã hash');
      return;
    }

    setVerifying(true);
    setResult(null);

    try {
      const { data } = await productAPI.verifyProduct({
        productHash: hash.trim(),
        
        location: 'Web Browser',
        ipAddress: 'Unknown',
        deviceInfo: navigator.userAgent
      });
      
      setResult(data);
      if (data.isAuthentic) {
  toast.success('SẢN PHẨM CHÍNH HÃNG 100%!');
} else {
  toast.error('HÀNG GIẢ! ĐÃ GHI NHẬN!');
}
    } catch (error) {
      console.error('Verify error:', error);
      const errorData = error.response?.data;
      setResult(errorData || {
        isAuthentic: false,
        status: 'ERROR',
        message: error.message || 'Không thể kết nối đến server'
      });
      toast.error(errorData?.message || 'Có lỗi xảy ra');
    } finally {
      setVerifying(false);
    }
  };

  const getStatusConfig = () => {
    if (!result) return null;

    const configs = {
      AUTHENTIC: {
        icon: ShieldCheck,
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        iconColor: 'text-emerald-600',
        titleColor: 'text-emerald-900',
        textColor: 'text-emerald-700',
        badgeColor: 'bg-emerald-100 text-emerald-800',
        gradient: 'from-emerald-500 to-emerald-600',
      },
      NOT_FOUND: {
        icon: ShieldX,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        titleColor: 'text-red-900',
        textColor: 'text-red-700',
        badgeColor: 'bg-red-100 text-red-800',
        gradient: 'from-red-500 to-red-600',
      },
      FAKE: {
        icon: ShieldAlert,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        titleColor: 'text-red-900',
        textColor: 'text-red-700',
        badgeColor: 'bg-red-100 text-red-800',
        gradient: 'from-red-500 to-red-600',
      },
      TAMPERED: {
        icon: ShieldAlert,
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        iconColor: 'text-orange-600',
        titleColor: 'text-orange-900',
        textColor: 'text-orange-700',
        badgeColor: 'bg-orange-100 text-orange-800',
        gradient: 'from-orange-500 to-orange-600',
      },
      ERROR: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        titleColor: 'text-yellow-900',
        textColor: 'text-yellow-700',
        badgeColor: 'bg-yellow-100 text-yellow-800',
        gradient: 'from-yellow-500 to-yellow-600',
      },
    };

    return configs[result.status] || configs.ERROR;
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl mb-8 transform hover:scale-110 transition-all duration-300">
            <QrCode className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Xác thực sản phẩm
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Quét QR code hoặc nhập mã hash để kiểm tra tính xác thực
          </p>
        </div>

        {/* Verify Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-gray-100 mb-10 animate-slide-up">
          <form onSubmit={handleVerify} className="space-y-8">
            <div>
              <label className="block text-base font-bold text-gray-700 mb-4">
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-blue-600" />
                  Mã Hash sản phẩm
                </div>
              </label>
              <input
                type="text"
                value={productHash}
                onChange={(e) => setProductHash(e.target.value)}
                placeholder="Nhập hoặc quét mã hash (0x123...)"
                className="block w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-base font-mono"
              />
              <p className="text-sm text-gray-500 mt-3 font-medium">
                Ví dụ: 0xf61ba91e858934e0e7e402258fe0788a66d1a8c65c9bbb0b4307901889b357ac
              </p>
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full flex items-center justify-center gap-3 py-5 px-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? (
                <>
                  <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-7 h-7" />
                  <span>Xác thực ngay</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t-2 border-gray-200">
            <button
              onClick={() => setShowScanner(true)}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 border-2 border-dashed border-blue-300 rounded-2xl text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-all font-bold text-lg"
            >
              <Camera className="w-6 h-6" />
              <span>Quét QR bằng Camera</span>
            </button>
          </div>
        </div>

        {/* Result */}
        {result && statusConfig && (
          <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-4 rounded-3xl p-10 shadow-2xl animate-scale-in`}>
            {/* Status Header */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b-2 border-gray-200">
              <div className={`w-20 h-20 bg-gradient-to-br ${statusConfig.gradient} rounded-2xl flex items-center justify-center shadow-xl`}>
                <statusConfig.icon className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className={`text-3xl font-bold ${statusConfig.titleColor}`}>
                    {result.status === 'AUTHENTIC' ? 'Sản phẩm chính hãng' : 'Cảnh báo!'}
                  </h2>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${statusConfig.badgeColor} shadow-md`}>
                    {result.status}
                  </span>
                </div>
                <p className={`text-lg font-medium ${statusConfig.textColor}`}>
                  {result.message}
                </p>
              </div>
            </div>

            {/* Product Details */}
            {result.product && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Package className="w-7 h-7 text-blue-600" />
                  Thông tin sản phẩm
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white/70 backdrop-blur rounded-2xl p-6 shadow-md">
                    <div className="flex items-center gap-3 text-gray-600 text-base mb-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <span className="font-bold">Tên sản phẩm</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{result.product.name}</p>
                  </div>

                  <div className="bg-white/70 backdrop-blur rounded-2xl p-6 shadow-md">
                    <div className="flex items-center gap-3 text-gray-600 text-base mb-2">
                      <Building2 className="w-5 h-5 text-emerald-600" />
                      <span className="font-bold">Nhà sản xuất</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{result.product.manufacturer}</p>
                  </div>

                  <div className="bg-white/70 backdrop-blur rounded-2xl p-6 shadow-md">
                    <div className="flex items-center gap-3 text-gray-600 text-base mb-2">
                      <Hash className="w-5 h-5 text-orange-600" />
                      <span className="font-bold">Số lô</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{result.product.batchNumber}</p>
                  </div>

                  <div className="bg-white/70 backdrop-blur rounded-2xl p-6 shadow-md">
                    <div className="flex items-center gap-3 text-gray-600 text-base mb-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span className="font-bold">Ngày sản xuất</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(result.product.manufactureDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div className="bg-white/70 backdrop-blur rounded-2xl p-6 shadow-md md:col-span-2">
                    <div className="flex items-center gap-3 text-gray-600 text-base mb-2">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <span className="font-bold">Lượt xác thực</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">
                      {result.product.verificationCount?.toLocaleString()} lần
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Blockchain Info */}
            {result.blockchain && (
              <div className="mt-8 pt-8 border-t-2 border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  Xác thực Blockchain
                </h3>
                <div className="bg-white/70 backdrop-blur rounded-2xl p-6 shadow-md space-y-4">
                  <div className="flex justify-between items-center text-base">
                    <span className="text-gray-600 font-bold">Trạng thái:</span>
                    <span className="font-bold text-emerald-600 text-lg">
                      {result.blockchain.verified ? '✓ Đã xác thực' : '✗ Chưa xác thực'}
                    </span>
                  </div>
                  {result.blockchain.txHash && (
                    <div className="flex justify-between items-center text-base">
                      <span className="text-gray-600 font-bold">TX Hash:</span>
                      <code className="font-mono text-sm text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                        {result.blockchain.txHash.substring(0, 10)}...{result.blockchain.txHash.substring(result.blockchain.txHash.length - 8)}
                      </code>
                    </div>
                  )}
                  {result.blockchain.blockNumber && (
                    <div className="flex justify-between items-center text-base">
                      <span className="text-gray-600 font-bold">Block Number:</span>
                      <span className="font-bold text-gray-900 text-lg">
                        #{result.blockchain.blockNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}