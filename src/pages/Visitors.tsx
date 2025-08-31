import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UserCheck, QrCode, Plus, LogOut, Clock, MapPin, Download, Scan } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { formatIndianPhone } from '@/lib/utils'
import { useDataStore } from '@/lib/dataSync'
import QRCode from 'qrcode'

interface Visitor {
  id: string
  name: string
  phone: string
  email: string
  purpose: string
  checkInTime: string
  checkOutTime?: string
  status: 'checked-in' | 'checked-out'
  qrCode: string
  qrCodeDataUrl?: string
}

const Visitors = () => {
  const { toast } = useToast()
  const { visitors, addVisitor, updateVisitor } = useDataStore()
  const [showForm, setShowForm] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    purpose: ''
  })

  // Generate unique QR code for visitor
  const generateQRCode = async (visitorData: any): Promise<string> => {
    try {
      const qrData = JSON.stringify({
        visitorId: visitorData.id,
        name: visitorData.name,
        phone: visitorData.phone,
        purpose: visitorData.purpose,
        timestamp: new Date().toISOString(),
        type: 'visitor_registration'
      })
      
      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      return dataUrl
    } catch (error) {
      console.error('QR Code generation error:', error)
      return ''
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addNewVisitor = async () => {
    if (!formData.name || !formData.phone || !formData.purpose) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    const newVisitor = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      purpose: formData.purpose,
      checkInTime: new Date().toISOString(),
      status: 'checked-in' as const
    }

    // Generate QR code
    const qrCodeDataUrl = await generateQRCode(newVisitor)
    
    // Add visitor to store
    addVisitor(newVisitor)
    
    // Reset form
    setFormData({ name: '', phone: '', email: '', purpose: '' })
    setShowForm(false)
    
    toast({
      title: "Success",
      description: `${newVisitor.name} has been checked in successfully.`,
    })
  }

  const simulateQRScan = () => {
    // Simulate scanning a QR code and pre-fill the form
    const mockQRData = {
      name: 'Demo Visitor',
      phone: '+91 98765 43210',
      email: 'demo@example.com',
      purpose: 'Demo QR Code Scan'
    }
    
    setFormData(mockQRData)
    setShowForm(true)
    
    toast({
      title: "QR Code Scanned",
      description: "Demo visitor data loaded from QR code scan.",
    })
  }

  const generateQRForNikhil = async () => {
    const nikhilData = {
      name: 'Nikhil Kumar',
      phone: '+91 98765 43223',
      email: 'nikhil.kumar@email.com',
      purpose: 'Personal Training Consultation'
    }
    
    const qrCodeDataUrl = await generateQRCode(nikhilData)
    
    // Add Nikhil as a visitor
    addVisitor({
      ...nikhilData,
      checkInTime: new Date().toISOString(),
      status: 'checked-in' as const
    })
    
    toast({
      title: "QR Code Generated",
      description: "Nikhil Kumar has been added as a visitor with QR code.",
    })
  }

  const downloadQRCode = async (visitor: Visitor) => {
    if (!visitor.qrCodeDataUrl) return
    
    try {
      const link = document.createElement('a')
      link.href = visitor.qrCodeDataUrl
      link.download = `QR_${visitor.name.replace(/\s+/g, '_')}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "QR Code Downloaded",
        description: `QR code for ${visitor.name} has been downloaded.`,
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Download Failed",
        description: "Failed to download QR code. Please try again.",
        variant: "destructive"
      })
    }
  }

  const checkOutVisitor = (visitorId: string) => {
    updateVisitor(visitorId, {
      status: 'checked-out',
      checkOutTime: new Date().toISOString()
    })
    
    toast({
      title: "Visitor Checked Out",
      description: "Visitor has been successfully checked out.",
    })
  }

  const checkInVisitor = (visitorId: string) => {
    updateVisitor(visitorId, {
      status: 'checked-in',
      checkOutTime: undefined
    })
    
    toast({
      title: "Visitor Checked In",
      description: "Visitor has been successfully checked in.",
    })
  }

  const currentVisitors = visitors.filter(v => v.status === 'checked-in')
  const checkedOutVisitors = visitors.filter(v => v.status === 'checked-out')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Visitor Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track gym visitors and manage check-ins</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={simulateQRScan}
            variant="outline"
            className="hover:scale-105 transition-transform duration-200"
          >
            <Scan className="h-4 w-4 mr-2" />
            Simulate QR Scan
          </Button>
          <Button
            onClick={generateQRForNikhil}
            variant="outline"
            className="hover:scale-105 transition-transform duration-200"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Generate QR for Nikhil
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 hover:scale-105 transition-transform duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Visitor
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentVisitors.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Currently Checked In</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{visitors.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Visitors Today</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{checkedOutVisitors.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Checked Out</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Visitor Form */}
      {showForm && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg animate-in slide-in-from-top-2 duration-300">
          <CardHeader className="border-b border-gray-200 dark:border-gray-600">
            <CardTitle className="text-gray-900 dark:text-white">Add New Visitor</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter visitor name"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="visitor@email.com"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="purpose" className="text-gray-700 dark:text-gray-300">Purpose of Visit *</Label>
                <Input
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="Gym tour, consultation, etc."
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information about the visitor..."
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="hover:scale-105 transition-transform duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={addNewVisitor}
                className="bg-green-600 hover:bg-green-700 hover:scale-105 transition-transform duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Visitor
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Visitors */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="border-b border-gray-200 dark:border-gray-600">
          <CardTitle className="text-gray-900 dark:text-white">Currently Checked In</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {currentVisitors.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No visitors currently checked in.
            </div>
          ) : (
            <div className="space-y-4">
              {currentVisitors.map((visitor) => (
                <div
                  key={visitor.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{visitor.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {visitor.phone} • {visitor.email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Purpose: {visitor.purpose}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        Checked in: {new Date(visitor.checkInTime).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {visitor.qrCodeDataUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadQRCode(visitor)}
                        className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 transition-all duration-200"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        QR
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => checkOutVisitor(visitor.id)}
                      className="hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Check Out
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checked Out Visitors */}
      {checkedOutVisitors.length > 0 && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader className="border-b border-gray-200 dark:border-gray-600">
            <CardTitle className="text-gray-900 dark:text-white">Recently Checked Out</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {checkedOutVisitors.slice(0, 5).map((visitor) => (
                <div
                  key={visitor.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{visitor.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {visitor.phone} • {visitor.purpose}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        Checked out: {visitor.checkOutTime ? new Date(visitor.checkOutTime).toLocaleString() : 'Unknown'}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => checkInVisitor(visitor.id)}
                    className="hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-900/30 dark:hover:text-green-300 transition-all duration-200"
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    Check In
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Visitors
