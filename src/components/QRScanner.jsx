// QRScanner.jsx – GIỮ NGUYÊN 100% CODE CỦA BẠN + FIX CAMERA
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, AlertCircle, CheckCircle } from 'lucide-react';

export default function QRScanner({ onScan, onClose }) {
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const html5QrCodeRef = useRef(null);
  const scannedRef = useRef(false); // ĐÁNH DẤU ĐÃ QUÉT

  useEffect(() => {
    startScanner();
    return () => stopScanner();
  }, []);

  const startScanner = async () => {
    try {
      setScanning(true);
      setError(null);
      setSuccess(false);
      scannedRef.current = false;

      html5QrCodeRef.current = new Html5Qrcode("qr-reader");

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          if (scannedRef.current) return;
          scannedRef.current = true;

          console.log("QR Scanned:", decodedText);
          setSuccess(true);

          stopScanner().then(() => {
            setTimeout(() => onScan(decodedText), 300);
          });
        },
        () => {}
      );
    } catch (err) {
    console.error("Scanner error:", err);
      setError("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập camera trong trình duyệt.");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error("Stop error:", err);
      }
    }
    setScanning(false);
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Quét mã QR</h2>
                <p className="text-blue-100 text-sm">Đưa mã QR vào khung hình</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scanner Area */}
        <div className="p-6">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center animate-slide-up">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-700 font-semibold mb-2">Lỗi truy cập camera</p>
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <button
                onClick={startScanner}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                {/* CHỈ SỬA 1 CHỖ: THÊM HEIGHT ĐỂ CAMERA HIỆN */}
                <div 
                  id="qr-reader" 
                  className="rounded-xl overflow-hidden border-4 border-blue-500 bg-black"
                  style={{ width: '100%', height: '400px' }} // ĐÂY LÀ CHỖ FIX
                ></div>
                
                {/* Success Overlay */}
                {success && (
                  <div className="absolute inset-0 bg-green-500 bg-opacity-90 rounded-xl flex items-center justify-center animate-fade-in">
                    <div className="text-center text-white">
                      <CheckCircle className="w-16 h-16 mx-auto mb-2 animate-scale-in" />
                      <p className="text-lg font-bold">Quét thành công!</p>
                    </div>
                  </div>
                )}

                {/* Scanning Corners Animation */}
                {scanning && !success && (
                  <>
                    <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-blue-400 animate-pulse"></div>
                    <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-blue-400 animate-pulse"></div>
                    <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-blue-400 animate-pulse"></div>
                    <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-blue-400 animate-pulse"></div>
                  </>
                )}
              </div>
              
              {scanning && !success && (
                <div className="text-center animate-slide-up">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Đang quét mã QR...
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Đảm bảo mã QR được chiếu sáng tốt và nằm trong khung hình
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <p>Giữ camera ổn định và đưa mã QR vào giữa khung hình</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <p>Tránh ánh sáng phản chiếu trực tiếp vào mã QR</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <p>Đảm bảo mã QR không bị mờ hoặc hư hỏng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}