// src/pages/VerifyProduct.jsx
import { useState, useRef, useEffect } from 'react';
import { productAPI } from '../services/app';
import toast from 'react-hot-toast';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  QrCode, 
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Package,
  Building2,
  Hash,
  Calendar,
  Eye,
  MapPin,
  Camera,
  X
} from 'lucide-react';
import jsQR from 'jsqr';

export default function VerifyProduct() {
  const [productHash, setProductHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Dùng camera sau
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        setHasCamera(true);
        
        // Bắt đầu scan
        scanIntervalRef.current = setInterval(() => {
          captureAndDecode();
        }, 500); // Scan mỗi 500ms
      }
    } catch (error) {
      console.error('Camera error:', error);
      setHasCamera(false);
      toast.error('Không thể truy cập camera. Vui lòng cấp quyền hoặc nhập mã thủ công.');
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    setScanning(false);
  };

  const captureAndDecode = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code && code.data) {
        handleQRDetected(code.data);
      }
    }
  };

  const handleQRDetected = (data) => {
    stopScanning();
    
    try {
      // Parse QR data - có thể là JSON hoặc plain text
      let hash = data;
      
      try {
        const parsed = JSON.parse(data);
        hash = parsed.productHash || parsed.hash || data;
      } catch {
        // Nếu không phải JSON, dùng data trực tiếp
        hash = data;
      }
      
      setProductHash(hash);
      toast.success('Đã quét thành công!');
      
      // Auto verify sau 1s
      setTimeout(() => {
        handleVerify(null, hash);
      }, 1000);
    } catch (error) {
      toast.error('Không thể đọc mã QR');
    }
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
      const { data } = await productAPI.verify(hash.trim(), {
        location: 'Web Browser',
        ipAddress: 'Unknown',
        deviceInfo: navigator.userAgent
      });
      
      setResult(data);
      
      if (data.isAuthentic) {
        toast.success('Sản phẩm chính hãng!');
      } else {
        toast.error('Cảnh báo: Sản phẩm không xác thực được!');
      }
    } catch (error) {
      const errorData = error.response?.data;
      setResult(errorData || {
        isAuthentic: false,
        status: 'ERROR',
        message: 'Không thể kết nối đến server'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-xl mb-6 transform hover:scale-110 transition-transform duration-300">
            <QrCode className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Xác thực sản phẩm
          </h1>
          <p className="text-lg text-gray-600">
            Quét QR code hoặc nhập mã hash để kiểm tra tính xác thực
          </p>
        </div>

        {/* QR Scanner Modal */}
        {scanning && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg">
              <button
                onClick={stopScanning}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              
              <div className="bg-white rounded-3xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Quét mã QR
                </h3>
                
                <div className="relative aspect-square bg-gray-900 rounded-2xl overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                  />
                  
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-64 h-64">
                      {/* Corner borders */}
                      <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary-500 rounded-tl-2xl"></div>
                      <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary-500 rounded-tr-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary-500 rounded-bl-2xl"></div>
                      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary-500 rounded-br-2xl"></div>
                      
                      {/* Scanning line animation */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-primary-500 animate-scan"></div>
                    </div>
                  </div>
                </div>
                
                <p className="text-center text-gray-600 mt-4">
                  Đưa mã QR vào giữa khung hình
                </p>
                
                <button
                  onClick={stopScanning}
                  className="w-full mt-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden canvas for QR processing */}
        <canvas ref={canvasRef} className="hidden" />

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
                placeholder="Nhập mã hash từ QR code..."
                className="block w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-200 text-lg"
              />
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              onClick={startScanning}
              disabled={scanning}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-primary-300 rounded-xl text-primary-600 hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              <Camera className="w-5 h-5" />
              <span>Quét QR bằng Camera</span>
            </button>
            
            {!hasCamera && (
              <p className="text-sm text-red-600 text-center mt-2">
                Không thể truy cập camera. Vui lòng cấp quyền hoặc nhập mã thủ công.
              </p>
            )}
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
                <div className="flex items-center gap-3 mb-1">
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
                      <span className="font-mono text-xs text-gray-900">
                        {result.blockchain.txHash.substring(0, 10)}...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(256px);
          }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}