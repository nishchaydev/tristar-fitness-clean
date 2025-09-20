import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Download, Plus, Trash2, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
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
  const dataStore = useDataStore()
  
  // Safe destructuring with fallbacks
  const members = dataStore?.members || []
  const invoices = dataStore?.invoices || []
  const addInvoice = dataStore?.addInvoice || (() => {})
  const addActivity = dataStore?.addActivity || (() => {})
  
  const [showForm, setShowForm] = useState(false)
  const [selectedMember, setSelectedMember] = useState('')
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [currentItem, setCurrentItem] = useState({ description: '', quantity: 1, price: 0 })
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Debug logging
  useEffect(() => {
    console.log('Data Store State:', {
      dataStore: !!dataStore,
      members: members?.length || 0,
      invoices: invoices?.length || 0,
      addInvoice: !!addInvoice,
      addActivity: !!addActivity
    })
    setIsLoading(false)
  }, [dataStore, members, invoices, addInvoice, addActivity])

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
      createdAt: new Date().toISOString(),
      items: invoiceItems,
      subtotal: subtotal,
      tax: tax,
      total: total
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tristar-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading invoices...</p>
        </div>
      </div>
    )
  }

  // Show error state if data store is not available
  if (!dataStore) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Data Store Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Unable to load invoice data. Please refresh the page.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-gray-600 dark:text-gray-400">Generate and manage invoices for members</p>
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
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader className="border-b border-gray-200 dark:border-gray-600">
            <CardTitle className="text-gray-900 dark:text-white flex items-center space-x-2">
              <FileText className="h-5 w-5 text-orange-600" />
              <span>Generate New Invoice</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Member Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="member" className="text-gray-700 dark:text-gray-300">Select Member</Label>
                <Select value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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
                <Label htmlFor="dueDate" className="text-gray-700 dark:text-gray-300">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Quick Add Packages */}
            <div>
              <Label className="text-gray-700 dark:text-gray-300 mb-3 block">Quick Add Packages</Label>
              <div className="flex flex-wrap gap-2">
                {membershipPackages.map(pkg => (
                  <Button
                    key={pkg.name}
                    variant="outline"
                    size="sm"
                    onClick={() => addPackage(pkg)}
                    className="text-xs hover:scale-105 transition-transform duration-200 border-tristar-300 hover:border-tristar-500 hover:bg-tristar-50 dark:hover:bg-tristar-900/30"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {pkg.name} - {formatINR(pkg.price)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Items */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <Label className="text-gray-700 dark:text-gray-300 mb-3 block">Add Custom Items</Label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <Label htmlFor="description" className="text-xs text-gray-600 dark:text-gray-400">Description</Label>
                  <Input
                    id="description"
                    value={currentItem.description}
                    onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                    placeholder="Item description"
                    className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity" className="text-xs text-gray-600 dark:text-gray-400">Qty</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})}
                    className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="text-xs text-gray-600 dark:text-gray-400">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={currentItem.price}
                    onChange={(e) => setCurrentItem({...currentItem, price: parseFloat(e.target.value) || 0})}
                    className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={addItem} 
                    className="w-full bg-tristar-600 hover:bg-tristar-700 hover:scale-105 transition-transform duration-200"
                    disabled={!currentItem.description || currentItem.price <= 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes for the invoice"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Invoice Items */}
            {invoiceItems.length > 0 && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                  <Label className="text-gray-900 dark:text-white font-medium">Invoice Items</Label>
                </div>
                <div className="p-4 space-y-3">
                  {invoiceItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-all duration-200">
                      <span className="flex-1 text-gray-900 dark:text-white font-medium">{item.description}</span>
                      <span className="mx-4 text-gray-600 dark:text-gray-400">x{item.quantity}</span>
                      <span className="mx-4 text-gray-600 dark:text-gray-400">{formatINR(item.price)}</span>
                      <span className="mx-4 font-bold text-gray-900 dark:text-white">{formatINR(item.total)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatINR(invoiceItems.reduce((sum, item) => sum + item.total, 0))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Tax (18%):</span>
                      <span className="text-gray-600 dark:text-gray-400">{formatINR(invoiceItems.reduce((sum, item) => sum + item.total, 0) * 0.18)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                      <span className="text-gray-900 dark:text-white">Total:</span>
                      <span className="text-tristar-600 dark:text-tristar-400">{formatINR(invoiceItems.reduce((sum, item) => sum + item.total, 0) * 1.18)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={generateInvoice}
                className="flex-1 bg-green-600 hover:bg-green-700 hover:scale-105 transition-transform duration-200 h-12 text-lg"
                disabled={!selectedMember || invoiceItems.length === 0}
              >
                <FileText className="h-5 w-5 mr-2" />
                Generate Invoice
              </Button>
              
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
                  className="flex-1 h-12 text-lg hover:scale-105 transition-transform duration-200"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  Preview PDF
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice List */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="border-b border-gray-200 dark:border-gray-600">
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <FileText className="h-5 w-5 text-orange-600" />
            <span>Invoice History ({invoices.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
                  {/* Invoice Header */}
                  <div className="bg-gradient-to-r from-tristar-50 to-green-50 dark:from-tristar-900/20 dark:to-green-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-tristar-600 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{invoice.memberName}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Invoice #{invoice.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'secondary'}
                          className="text-sm px-3 py-1 font-semibold"
                        >
                          {invoice.status.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Due: {format(parseISO(invoice.dueDate), 'dd MMM yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Invoice Content */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Invoice Details */}
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Invoice Date</p>
                          <p className="text-sm text-gray-900 dark:text-white">{format(parseISO(invoice.createdAt), 'dd MMM yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Items</p>
                          <p className="text-sm text-gray-900 dark:text-white">{invoice.items.length} item(s)</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Description</p>
                          <p className="text-sm text-gray-900 dark:text-white">{invoice.description}</p>
                        </div>
                      </div>
                      
                      {/* Amount Breakdown */}
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{formatINR(invoice.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Tax (18%):</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{formatINR(invoice.tax)}</span>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                          <div className="flex justify-between">
                            <span className="text-base font-semibold text-gray-900 dark:text-white">Total:</span>
                            <span className="text-lg font-bold text-tristar-600 dark:text-tristar-400">{formatINR(invoice.total)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col space-y-3">
                        <Button
                          onClick={() => generatePDF({
                            id: invoice.id,
                            memberName: invoice.memberName,
                            memberPhone: members.find(m => m.id === invoice.memberId)?.phone || '',
                            memberEmail: members.find(m => m.id === invoice.memberId)?.email,
                            items: invoice.items,
                            subtotal: invoice.subtotal,
                            tax: invoice.tax,
                            total: invoice.total,
                            date: invoice.createdAt.split('T')[0],
                            dueDate: invoice.dueDate,
                            status: invoice.status,
                            notes: invoice.description
                          })}
                          className="w-full bg-green-600 hover:bg-green-700 text-white hover:scale-105 transition-all duration-200"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => previewInvoice({
                            id: invoice.id,
                            memberName: invoice.memberName,
                            memberPhone: members.find(m => m.id === invoice.memberId)?.phone || '',
                            memberEmail: members.find(m => m.id === invoice.memberId)?.email,
                            items: invoice.items,
                            subtotal: invoice.subtotal,
                            tax: invoice.tax,
                            total: invoice.total,
                            date: invoice.createdAt.split('T')[0],
                            dueDate: invoice.dueDate,
                            status: invoice.status,
                            notes: invoice.description
                          })}
                          className="w-full hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 transition-all duration-200"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No invoices yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {isOwner(user) 
                  ? "Generate your first invoice using the form above" 
                  : "Invoices will appear here once generated by the owner"
                }
              </p>
              {isOwner(user) && (
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-tristar-600 hover:bg-tristar-700 hover:scale-105 transition-transform duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Invoice
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Invoices
