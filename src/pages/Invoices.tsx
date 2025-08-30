import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Download, Plus, Trash2, Eye } from 'lucide-react'
import { useState } from 'react'
import { formatINR } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useDataStore } from '@/lib/dataSync'
import { useAuth } from '@/contexts/AuthContext'
import { isOwner } from '@/lib/auth'
import { format, parseISO } from 'date-fns'
import { generateInvoicePDF, type InvoiceData as PDFInvoiceData } from '@/lib/pdfGenerator'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  price: number
  total: number
}

interface Invoice {
  id: string
  memberName: string
  memberPhone: string
  memberEmail?: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  date: string
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  notes?: string
}

const Invoices = () => {
  const { toast } = useToast()
  const { user } = useAuth()
  const { members, addInvoice, addActivity } = useDataStore()
  const [showForm, setShowForm] = useState(false)
  const [selectedMember, setSelectedMember] = useState('')
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [currentItem, setCurrentItem] = useState({ description: '', quantity: 1, price: 0 })
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState('')

  // Predefined membership packages
  const membershipPackages = [
    { name: 'Monthly Membership', price: 999, description: '1 month access to all facilities' },
    { name: 'Quarterly Membership', price: 2499, description: '3 months access to all facilities' },
    { name: 'Annual Membership', price: 8999, description: '12 months access to all facilities' },
    { name: 'Personal Training Session', price: 500, description: '1 hour personal training' },
    { name: 'Group Class', price: 200, description: '1 group fitness class' },
    { name: 'Protein Shake', price: 150, description: 'Post-workout protein shake' },
    { name: 'Locker Rental', price: 100, description: 'Monthly locker rental' },
  ]

  const addItem = () => {
    if (currentItem.description && currentItem.price > 0) {
      const newItem: InvoiceItem = {
        id: Date.now().toString(),
        description: currentItem.description,
        quantity: currentItem.quantity,
        price: currentItem.price,
        total: currentItem.quantity * currentItem.price
      }
      setInvoiceItems([...invoiceItems, newItem])
      setCurrentItem({ description: '', quantity: 1, price: 0 })
    }
  }

  const removeItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id))
  }

  const addPackage = (packageItem: typeof membershipPackages[0]) => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: packageItem.name,
      quantity: 1,
      price: packageItem.price,
      total: packageItem.price
    }
    setInvoiceItems([...invoiceItems, newItem])
  }

  const generateInvoice = () => {
    if (!selectedMember || invoiceItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select a member and add at least one item",
        variant: "destructive"
      })
      return
    }

    const member = members.find(m => m.id === selectedMember)
    if (!member) return

    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.18 // 18% GST
    const total = subtotal + tax

    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      memberName: member.name,
      memberPhone: member.phone,
      memberEmail: member.email,
      items: [...invoiceItems],
      subtotal,
      tax,
      total,
      date: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      status: 'pending',
      notes: notes
    }

    // Add to data store
    addInvoice({
      memberId: member.id,
      memberName: member.name,
      amount: total,
      description: `Invoice for ${member.name} - ${invoiceItems.length} items`,
      dueDate: newInvoice.dueDate,
      status: 'pending',
      createdAt: new Date().toISOString()
    })

    // Add activity
    addActivity({
      type: 'invoice',
      action: 'Invoice generated',
      name: `Invoice ${newInvoice.id} - ${member.name}`,
      time: new Date().toISOString(),
      details: `Total: ${formatINR(total)}`,
      memberId: member.id,
      invoiceId: newInvoice.id
    })

    setShowForm(false)
    setInvoiceItems([])
    setSelectedMember('')
    setNotes('')
    setDueDate('')
    
    toast({
      title: "Success",
      description: `Invoice generated for ${member.name}`,
    })
  }

  const generatePDF = async (invoice: Invoice) => {
    try {
      // Convert to PDF format
      const pdfInvoiceData: PDFInvoiceData = {
        id: invoice.id,
        memberName: invoice.memberName,
        memberPhone: invoice.memberPhone,
        memberEmail: invoice.memberEmail,
        items: invoice.items,
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        total: invoice.total,
        date: invoice.date,
        dueDate: invoice.dueDate,
        status: invoice.status,
        notes: invoice.notes
      }

      // Generate and download PDF
      await generateInvoicePDF(pdfInvoiceData, `invoice-${invoice.id}.pdf`)

      toast({
        title: "PDF Generated",
        description: "Invoice PDF has been generated and downloaded successfully.",
      })
    } catch (error) {
      console.error('PDF generation error:', error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      })
    }
  }

  const previewInvoice = (invoice: Invoice) => {
    // In a real app, this would show a modal with the invoice preview
    const previewContent = `
Invoice Preview:
${invoice.id} - ${invoice.memberName}
Total: ${formatINR(invoice.total)}
Status: ${invoice.status}
    `
    alert(previewContent)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Generate and manage invoices for members</p>
        </div>
        {isOwner(user) && (
          <Button 
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => setShowForm(!showForm)}
          >
            <FileText className="h-4 w-4 mr-2" />
            {showForm ? 'Cancel' : 'Generate Invoice'}
          </Button>
        )}
      </div>

      {/* Invoice Generation Form */}
      {showForm && isOwner(user) && (
        <Card>
          <CardHeader>
            <CardTitle>Generate New Invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Member Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="member">Select Member</Label>
                <Select value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} - {member.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Quick Add Packages */}
            <div>
              <Label>Quick Add Packages</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {membershipPackages.map(pkg => (
                  <Button
                    key={pkg.name}
                    variant="outline"
                    size="sm"
                    onClick={() => addPackage(pkg)}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {pkg.name} - {formatINR(pkg.price)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Items */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                  placeholder="Item description"
                />
              </div>
              <div>
                <Label htmlFor="quantity">Qty</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={currentItem.price}
                  onChange={(e) => setCurrentItem({...currentItem, price: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes for the invoice"
              />
            </div>

            {/* Invoice Items */}
            {invoiceItems.length > 0 && (
              <div>
                <Label>Invoice Items</Label>
                <div className="border rounded-lg p-4 space-y-2">
                  {invoiceItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="flex-1">{item.description}</span>
                      <span className="mx-4">x{item.quantity}</span>
                      <span className="mx-4">{formatINR(item.price)}</span>
                      <span className="mx-4 font-medium">{formatINR(item.total)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Subtotal:</span>
                      <span>{formatINR(invoiceItems.reduce((sum, item) => sum + item.total, 0))}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tax (18%):</span>
                      <span>{formatINR(invoiceItems.reduce((sum, item) => sum + item.total, 0) * 0.18)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                      <span>Total:</span>
                      <span>{formatINR(invoiceItems.reduce((sum, item) => sum + item.total, 0) * 1.18)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <Button 
              onClick={generateInvoice}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!selectedMember || invoiceItems.length === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Invoice
            </Button>
            
            {/* Preview Invoice Button */}
            {invoiceItems.length > 0 && (
              <Button 
                variant="outline"
                onClick={() => {
                  const previewInvoice: Invoice = {
                    id: 'PREVIEW',
                    memberName: members.find(m => m.id === selectedMember)?.name || '',
                    memberPhone: members.find(m => m.id === selectedMember)?.phone || '',
                    memberEmail: members.find(m => m.id === selectedMember)?.email,
                    items: invoiceItems,
                    subtotal: invoiceItems.reduce((sum, item) => sum + item.total, 0),
                    tax: invoiceItems.reduce((sum, item) => sum + item.total, 0) * 0.18,
                    total: invoiceItems.reduce((sum, item) => sum + item.total, 0) * 1.18,
                    date: new Date().toISOString().split('T')[0],
                    dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    status: 'pending',
                    notes: notes
                  }
                  generatePDF(previewInvoice)
                }}
                disabled={!selectedMember || invoiceItems.length === 0}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview PDF
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Invoice History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            {isOwner(user) 
              ? "Generate your first invoice using the form above" 
              : "Invoices will appear here once generated by the owner"
            }
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Invoices
