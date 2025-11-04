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
  Camera
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
    
    try {
      // Backend trả về JSON: {"productHash":"0x...","productId":"...","verifyUrl":"..."}
      const parsed = JSON.parse(decodedText);
      hash = parsed.productHash;
      console.log("Extracted hash from JSON:", hash);
    } catch (parseError) {
      // Không phải JSON, thử parse từ URL hoặc plain text
      console.log("Not JSON, trying other formats...");
      
      if (decodedText.includes('hash=')) {
        // URL format: http://...?hash=0x123
        hash = decodedText.split('hash=')[1]?.split('&')[0];
      } else if (decodedText.includes('verify/')) {
        // URL format: http://.../verify/0x123
        hash = decodedText.split('verify/')[1]?.split('?')[0];
      } else if (decodedText.startsWith('0x')) {
        // Plain hash: 0x123...
        hash = decodedText;
      }
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
    
    // Auto verify sau 500ms
    setTimeout(() => {
      handleVerify(null, hash);
    }, 500);
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
  toast.success(data.isAuthentic ? 'Sản phẩm chính hãng!' : 'Cảnh báo!');
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
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        titleColor: 'text-green-900',
        textColor: 'text-green-700',
        badgeColor: 'bg-green-100 text-green-800',
      },
      NOT_FOUND: {
        icon: ShieldX,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        titleColor: 'text-red-900',
        textColor: 'text-red-700',
        badgeColor: 'bg-red-100 text-red-800',
      },
      FAKE: {
        icon: ShieldAlert,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        titleColor: 'text-red-900',
        textColor: 'text-red-700',
        badgeColor: 'bg-red-100 text-red-800',
      },
      TAMPERED: {
        icon: ShieldAlert,
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        iconColor: 'text-orange-600',
        titleColor: 'text-orange-900',
        textColor: 'text-orange-700',
        badgeColor: 'bg-orange-100 text-orange-800',
      },
      ERROR: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        titleColor: 'text-yellow-900',
        textColor: 'text-yellow-700',
        badgeColor: 'bg-yellow-100 text-yellow-800',
      },
    };

    return configs[result.status] || configs.ERROR;
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl mb-6 transform hover:scale-110 transition-transform duration-300">
            <QrCode className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Xác thực sản phẩm
          </h1>
          <p className="text-lg text-gray-600">
            Quét QR code hoặc nhập mã hash để kiểm tra tính xác thực
          </p>
        </div>

        {/* Verify Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 mb-8 animate-slide-up">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Mã Hash sản phẩm
              </label>
              <input
                type="text"
                value={productHash}
                onChange={(e) => setProductHash(e.target.value)}
                placeholder="Nhập hoặc quét mã hash (0x123...)"
                className="block w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-lg font-mono"
              />
              <p className="text-xs text-gray-500 mt-2">
                Ví dụ: 0xf61ba91e858934e0e7e402258fe0788a66d1a8c65c9bbb0b4307901889b357ac
              </p>
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? (
                <>
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-6 h-6" />
                  <span>Xác thực ngay</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowScanner(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 font-semibold"
            >
              <Camera className="w-5 h-5" />
              <span>Quét QR bằng Camera</span>
            </button>
          </div>
        </div>

        {/* Result */}
        {result && statusConfig && (
          <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2 rounded-3xl p-8 shadow-xl animate-scale-in`}>
            {/* Status Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className={`w-16 h-16 ${statusConfig.bgColor} rounded-2xl flex items-center justify-center ring-4 ring-white`}>
                <statusConfig.icon className={`w-8 h-8 ${statusConfig.iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h2 className={`text-2xl font-bold ${statusConfig.titleColor}`}>
                    {result.status === 'AUTHENTIC' ? 'Sản phẩm chính hãng' : 'Cảnh báo!'}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.badgeColor}`}>
                    {result.status}
                  </span>
                </div>
                <p className={`${statusConfig.textColor}`}>
                  {result.message}
                </p>
              </div>
            </div>

            {/* Product Details */}
            {result.product && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Thông tin sản phẩm
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Package className="w-4 h-4" />
                      Tên sản phẩm
                    </div>
                    <p className="font-semibold text-gray-900">{result.product.name}</p>
                  </div>

                  <div className="bg-white/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Building2 className="w-4 h-4" />
                      Nhà sản xuất
                    </div>
                    <p className="font-semibold text-gray-900">{result.product.manufacturer}</p>
                  </div>

                  <div className="bg-white/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Hash className="w-4 h-4" />
                      Số lô
                    </div>
                    <p className="font-semibold text-gray-900">{result.product.batchNumber}</p>
                  </div>

                  <div className="bg-white/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Calendar className="w-4 h-4" />
                      Ngày sản xuất
                    </div>
                    <p className="font-semibold text-gray-900">
                      {new Date(result.product.manufactureDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div className="bg-white/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Eye className="w-4 h-4" />
                      Lượt xác thực
                    </div>
                    <p className="font-semibold text-gray-900">
                      {result.product.verificationCount?.toLocaleString()} lần
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Blockchain Info */}
            {result.blockchain && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Xác thực Blockchain
                </h3>
                <div className="bg-white/50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="font-semibold text-green-600">
                      {result.blockchain.verified ? '✓ Đã xác thực' : '✗ Chưa xác thực'}
                    </span>
                  </div>
                  {result.blockchain.txHash && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">TX Hash:</span>
                      <code className="font-mono text-xs text-gray-900">
                        {result.blockchain.txHash.substring(0, 10)}...{result.blockchain.txHash.substring(result.blockchain.txHash.length - 8)}
                      </code>
                    </div>
                  )}
                  {result.blockchain.blockNumber && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Block Number:</span>
                      <span className="font-semibold text-gray-900">
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