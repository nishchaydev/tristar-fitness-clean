import jsPDF from 'jspdf'

export interface InvoiceData {
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

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  price: number
  total: number
}

export class PDFGenerator {
  private doc: jsPDF

  constructor() {
    this.doc = new jsPDF()
  }

  generateInvoice(invoiceData: InvoiceData): jsPDF {
    // Set up the document
    this.doc.setFontSize(20)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('TRISTAR FITNESS', 105, 20, { align: 'center' })
    
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Your Fitness Journey Starts Here', 105, 30, { align: 'center' })
    this.doc.text('123 Fitness Street, Gym City, GC 12345', 105, 40, { align: 'center' })
    this.doc.text('Phone: +91 98765 43210 | Email: info@tristarfitness.com', 105, 50, { align: 'center' })
    
    // Invoice details
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('INVOICE', 20, 70)
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`Invoice #: ${invoiceData.id}`, 120, 70)
    this.doc.text(`Date: ${this.formatDate(invoiceData.date)}`, 120, 80)
    this.doc.text(`Due Date: ${this.formatDate(invoiceData.dueDate)}`, 120, 90)
    this.doc.text(`Status: ${invoiceData.status.toUpperCase()}`, 120, 100)
    
    // Member details
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('BILL TO:', 20, 120)
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(invoiceData.memberName, 20, 135)
    this.doc.text(invoiceData.memberPhone, 20, 145)
    if (invoiceData.memberEmail) {
      this.doc.text(invoiceData.memberEmail, 20, 155)
    }
    
    // Items table
    this.addItemsTable(invoiceData.items)
    
    // Totals
    this.addTotals(invoiceData)
    
    // Notes and footer
    this.addNotesAndFooter(invoiceData)
    
    return this.doc
  }

  private addItemsTable(items: InvoiceItem[]) {
    // Table header
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Item Description', 20, 180)
    this.doc.text('Qty', 120, 180)
    this.doc.text('Price (₹)', 140, 180)
    this.doc.text('Total (₹)', 170, 180)
    
    // Table rows
    let yPosition = 195
    items.forEach((item, index) => {
      this.doc.setFontSize(9)
      this.doc.setFont('helvetica', 'normal')
      
      // Item description (truncated if too long)
      const description = item.description.length > 25 ? item.description.substring(0, 22) + '...' : item.description
      this.doc.text(description, 20, yPosition)
      
      // Quantity
      this.doc.text(item.quantity.toString(), 120, yPosition)
      
      // Price
      this.doc.text(this.formatCurrency(item.price), 140, yPosition)
      
      // Total
      this.doc.text(this.formatCurrency(item.total), 170, yPosition)
      
      yPosition += 10
      
      // Add separator line
      if (index < items.length - 1) {
        this.doc.line(20, yPosition - 2, 190, yPosition - 2)
      }
    })
  }

  private addTotals(invoiceData: InvoiceData) {
    const startY = 250
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    
    // Subtotal
    this.doc.text('Subtotal:', 120, startY)
    this.doc.text(this.formatCurrency(invoiceData.subtotal), 170, startY)
    
    // Tax
    this.doc.text('Tax (18%):', 120, startY + 15)
    this.doc.text(this.formatCurrency(invoiceData.tax), 170, startY + 15)
    
    // Total
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Total:', 120, startY + 35)
    this.doc.text(this.formatCurrency(invoiceData.total), 170, startY + 35)
    
    // Add a box around total
    this.doc.rect(115, startY + 25, 65, 15)
  }

  private addNotesAndFooter(invoiceData: InvoiceData) {
    const startY = 300
    
    // Notes
    if (invoiceData.notes) {
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('Notes:', 20, startY)
      
      this.doc.setFontSize(9)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(invoiceData.notes, 20, startY + 10, { maxWidth: 100 })
    }
    
    // Footer
    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(
      'Thank you for choosing Tristar Fitness! For any queries, please contact us.',
      105, 270, { align: 'center' }
    )
    
    // Terms and conditions
    this.doc.text(
      'Terms: Payment is due within 30 days. Late payments may incur additional charges.',
      105, 280, { align: 'center' }
    )
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Generate and download PDF
  static async generateAndDownload(invoiceData: InvoiceData, filename: string) {
    const generator = new PDFGenerator()
    const doc = generator.generateInvoice(invoiceData)
    
    // Save the PDF
    doc.save(filename)
  }
}

// Export a simple function for easy use
export const generateInvoicePDF = async (invoiceData: InvoiceData, filename?: string) => {
  const defaultFilename = `invoice-${invoiceData.id}.pdf`
  return PDFGenerator.generateAndDownload(invoiceData, filename || defaultFilename)
}
