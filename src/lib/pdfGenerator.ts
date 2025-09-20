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
    // Set up the document with professional styling
    this.doc.setFillColor(34, 197, 94) // Green background for header
    this.doc.rect(0, 0, 210, 60, 'F')
    
    // Company logo area (placeholder for future logo)
    this.doc.setFillColor(255, 255, 255)
    this.doc.circle(30, 30, 15, 'F')
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(34, 197, 94)
    this.doc.text('TF', 30, 35, { align: 'center' })
    
    // Company header
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(24)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('TRISTAR FITNESS', 105, 25, { align: 'center' })
    
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Your Fitness Journey Starts Here', 105, 40, { align: 'center' })
    this.doc.text('Sapna Sangeeta Rd, next to LOTUS ELECTRONIC, Snehnagar, Indore, Madhya Pradesh 452001', 105, 50, { align: 'center' })
    this.doc.text('Phone: 076930 06065 | Email: info@tristarfitness.com', 105, 55, { align: 'center' })
    
    // Invoice details section with professional layout
    this.doc.setFillColor(248, 250, 252) // Light gray background
    this.doc.rect(10, 70, 190, 40, 'F')
    
    this.doc.setFontSize(18)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(0, 0, 0)
    this.doc.text('INVOICE', 20, 85)
    
    // Right-aligned invoice details
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`Invoice #: ${invoiceData.id}`, 150, 80)
    this.doc.text(`Date: ${this.formatDate(invoiceData.date)}`, 150, 90)
    this.doc.text(`Due Date: ${this.formatDate(invoiceData.dueDate)}`, 150, 100)
    
    // Status badge
    const statusColor = this.getStatusColor(invoiceData.status)
    this.doc.setFillColor(statusColor.r, statusColor.g, statusColor.b)
    this.doc.rect(150, 105, 30, 8, 'F')
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(invoiceData.status.toUpperCase(), 165, 111, { align: 'center' })
    
    // Member details section
    this.doc.setTextColor(0, 0, 0)
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('BILL TO:', 20, 130)
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(invoiceData.memberName, 20, 145)
    this.doc.text(invoiceData.memberPhone, 20, 155)
    if (invoiceData.memberEmail) {
      this.doc.text(invoiceData.memberEmail, 20, 165)
    }
    
    // Items table with professional styling
    this.addItemsTable(invoiceData.items)
    
    // Totals with better formatting
    this.addTotals(invoiceData)
    
    // Notes and footer with improved layout
    this.addNotesAndFooter(invoiceData)
    
    return this.doc
  }

  private addItemsTable(items: InvoiceItem[]) {
    const startY = 180
    
    // Table header with background
    this.doc.setFillColor(248, 250, 252)
    this.doc.rect(10, startY - 10, 190, 15, 'F')
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(0, 0, 0)
    this.doc.text('Item Description', 20, startY)
    this.doc.text('Qty', 120, startY)
    this.doc.text('Price (₹)', 140, startY)
    this.doc.text('Total (₹)', 170, startY)
    
    // Table rows with alternating backgrounds
    let yPosition = startY + 15
    items.forEach((item, index) => {
      // Alternate row colors
      if (index % 2 === 0) {
        this.doc.setFillColor(255, 255, 255)
      } else {
        this.doc.setFillColor(249, 250, 251)
      }
      this.doc.rect(10, yPosition - 5, 190, 12, 'F')
      
      this.doc.setFontSize(9)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setTextColor(0, 0, 0)
      
      // Item description (truncated if too long)
      const description = item.description.length > 25 ? item.description.substring(0, 22) + '...' : item.description
      this.doc.text(description, 20, yPosition)
      
      // Quantity
      this.doc.text(item.quantity.toString(), 120, yPosition)
      
      // Price
      this.doc.text(this.formatCurrency(item.price), 140, yPosition)
      
      // Total
      this.doc.text(this.formatCurrency(item.total), 170, yPosition)
      
      yPosition += 12
    })
    
    // Add bottom border
    this.doc.line(10, yPosition - 5, 200, yPosition - 5)
  }

  private addTotals(invoiceData: InvoiceData) {
    const startY = 250
    
    // Totals section with background
    this.doc.setFillColor(248, 250, 252)
    this.doc.rect(110, startY - 15, 90, 60, 'F')
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(0, 0, 0)
    
    // Subtotal
    this.doc.text('Subtotal:', 120, startY)
    this.doc.text(this.formatCurrency(invoiceData.subtotal), 170, startY)
    
    // Tax
    this.doc.text('Tax (18%):', 120, startY + 15)
    this.doc.text(this.formatCurrency(invoiceData.tax), 170, startY + 15)
    
    // Total with highlight
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Total:', 120, startY + 35)
    this.doc.text(this.formatCurrency(invoiceData.total), 170, startY + 35)
    
    // Highlight box around total
    this.doc.setFillColor(34, 197, 94)
    this.doc.rect(115, startY + 25, 65, 15, 'F')
    this.doc.setTextColor(255, 255, 255)
    this.doc.text('Total:', 120, startY + 35)
    this.doc.text(this.formatCurrency(invoiceData.total), 170, startY + 35)
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

  private getStatusColor(status: string): { r: number, g: number, b: number } {
    switch (status) {
      case 'paid':
        return { r: 34, g: 197, b: 94 } // Green
      case 'pending':
        return { r: 245, g: 158, b: 11 } // Yellow
      case 'overdue':
        return { r: 239, g: 68, b: 68 } // Red
      default:
        return { r: 107, g: 114, b: 128 } // Gray
    }
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
