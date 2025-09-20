import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode } from 'lucide-react';

interface QRCodeDisplayProps {
  url: string;
  size?: number;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ url, size = 200 }) => {
  // In a real implementation, you would use a QR code library like 'qrcode'
  // For now, we'll create a placeholder that shows the URL
  
  const qrCodeData = `QR Code for: ${url}`;
  
  return (
    <Card className="p-4 bg-white shadow-lg">
      <CardContent className="flex flex-col items-center justify-center p-6">
        {/* Placeholder QR Code */}
        <div 
          className="bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <div className="text-center p-4">
            <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-mono break-all">
              {url}
            </p>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Scan with your phone camera
          </p>
          <p className="text-xs text-gray-500">
            Or visit: <span className="font-mono text-blue-600">{url}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;
