import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UserCheck, QrCode, Plus, LogOut, Clock, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { formatIndianPhone } from '@/lib/utils'

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
}

const Visitors = () => {
  const { toast } = useToast()
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    purpose: ''
  })

  // Mock QR codes for demonstration
  const mockQRCodes = [
    'QR-001-VISITOR-2024',
    'QR-002-VISITOR-2024',
    'QR-003-VISITOR-2024',
    'QR-004-VISITOR-2024',
    'QR-005-VISITOR-2024'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const generateQRCode = () => {
    const availableCodes = mockQRCodes.filter(code => 
      !visitors.some(visitor => visitor.qrCode === code)
    )
    
    if (availableCodes.length === 0) {
      toast({
        title: "Error",
        description: "No more QR codes available",
        variant: "destructive"
      })
      return
    }
    
    return availableCodes[0]
  }

  const addVisitor = () => {
    if (!formData.name || !formData.phone || !formData.purpose) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    const qrCode = generateQRCode()
    if (!qrCode) return

    const newVisitor: Visitor = {
      id: Date.now().toString(),
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      purpose: formData.purpose,
      checkInTime: new Date().toISOString(),
      status: 'checked-in',
      qrCode
    }

    setVisitors([newVisitor, ...visitors])
    setFormData({ name: '', phone: '', email: '', purpose: '' })
    setShowForm(false)
    
    toast({
      title: "Success",
      description: `Visitor ${newVisitor.name} checked in successfully`,
    })
  }

  const checkOutVisitor = (visitorId: string) => {
    setVisitors(visitors.map(visitor => 
      visitor.id === visitorId 
        ? { 
            ...visitor, 
            checkOutTime: new Date().toISOString(),
            status: 'checked-out' as const
          }
        : visitor
    ))
    
    const visitor = visitors.find(v => v.id === visitorId)
    if (visitor) {
      toast({
        title: "Success",
        description: `${visitor.name} checked out successfully`,
      })
    }
  }

  const simulateQRScan = () => {
    setShowQRScanner(true)
    // Simulate QR code scanning
    setTimeout(() => {
      const qrCode = generateQRCode()
      if (qrCode) {
        toast({
          title: "QR Code Scanned",
          description: `QR Code: ${qrCode} - Please register visitor details`,
        })
        setShowQRScanner(false)
        setShowForm(true)
      } else {
        toast({
          title: "Error",
          description: "No more QR codes available",
          variant: "destructive"
        })
        setShowQRScanner(false)
      }
    }, 2000)
  }

  const getDuration = (checkInTime: string, checkOutTime?: string) => {
    const checkIn = new Date(checkInTime)
    const checkOut = checkOutTime ? new Date(checkOutTime) : new Date()
    const diffMs = checkOut.getTime() - checkIn.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const remainingMins = diffMins % 60
    
    if (diffHours > 0) {
      return `${diffHours}h ${remainingMins}m`
    }
    return `${diffMins}m`
  }

  const activeVisitors = visitors.filter(v => v.status === 'checked-in')
  const checkedOutVisitors = visitors.filter(v => v.status === 'checked-out')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visitors</h1>
          <p className="text-gray-600">Manage visitor check-ins and registrations</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={simulateQRScan}
            disabled={showQRScanner}
          >
            <QrCode className="h-4 w-4 mr-2" />
            {showQRScanner ? 'Scanning...' : 'Scan QR Code'}
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Cancel' : 'Manual Entry'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors Today</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitors.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeVisitors.length} currently checked in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Inside</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVisitors.length}</div>
            <p className="text-xs text-muted-foreground">
              Visitors in the facility
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked Out</CardTitle>
            <LogOut className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkedOutVisitors.length}</div>
            <p className="text-xs text-muted-foreground">
              Visitors who left today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visitor Registration Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Register New Visitor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter visitor's full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="visitor@example.com"
                />
              </div>
              <div>
                <Label htmlFor="purpose">Purpose of Visit *</Label>
                <Input
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="e.g., Gym tour, Consultation"
                  required
                />
              </div>
            </div>
            <Button 
              onClick={addVisitor}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Check In Visitor
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Currently Checked-in Visitors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <span>Currently Inside ({activeVisitors.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeVisitors.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No visitors currently checked in</p>
          ) : (
            <div className="space-y-4">
              {activeVisitors.map(visitor => (
                <div key={visitor.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{visitor.name}</h3>
                      <p className="text-sm text-gray-600">{formatIndianPhone(visitor.phone)}</p>
                      <p className="text-xs text-gray-500">Purpose: {visitor.purpose}</p>
                      <p className="text-xs text-gray-500">QR: {visitor.qrCode}</p>
                      <p className="text-xs text-green-600">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Checked in: {getDuration(visitor.checkInTime)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => checkOutVisitor(visitor.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Check Out
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checked-out Visitors */}
      {checkedOutVisitors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LogOut className="h-5 w-5 text-gray-600" />
              <span>Checked Out Today ({checkedOutVisitors.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checkedOutVisitors.map(visitor => (
                <div key={visitor.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{visitor.name}</h3>
                      <p className="text-sm text-gray-600">{formatIndianPhone(visitor.phone)}</p>
                      <p className="text-xs text-gray-500">Purpose: {visitor.purpose}</p>
                      <p className="text-xs text-gray-500">QR: {visitor.qrCode}</p>
                      <p className="text-xs text-gray-600">
                        Duration: {getDuration(visitor.checkInTime, visitor.checkOutTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        In: {new Date(visitor.checkInTime).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Out: {visitor.checkOutTime ? new Date(visitor.checkOutTime).toLocaleTimeString() : 'N/A'}
                      </p>
                    </div>
                  </div>
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
