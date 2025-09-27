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
    // Green header banner (matching the image)
    this.doc.setFillColor(16, 185, 129) // TriStar green
    this.doc.rect(0, 0, 210, 50, 'F')
    
    // White circle with TS logo (left side)
    this.doc.setFillColor(255, 255, 255)
    this.doc.circle(25, 25, 12, 'F')
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(16, 185, 129)
    this.doc.text('TS', 25, 30, { align: 'center' })
    
    // Company name (center)
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(20)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('TRISTAR FITNESS', 105, 20, { align: 'center' })
    
    // Tagline
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Your Fitness Journey Starts Here', 105, 28, { align: 'center' })
    
    // Address
    this.doc.setFontSize(9)
    this.doc.text('SAPNA SANGEETA MAIN ROAD NEXT TO LOTUS ELECTRONICS, INDORE City, HC 12345', 105, 35, { align: 'center' })
    
    // Contact info
    this.doc.setFontSize(8)
    this.doc.text('+91 98765 43210', 105, 42, { align: 'center' })
    this.doc.text('076930 06065', 105, 47, { align: 'center' })
    this.doc.text('info@tristarfitness.com', 105, 52, { align: 'center' })
    
    // White background for invoice details
    this.doc.setFillColor(255, 255, 255)
    this.doc.rect(10, 60, 190, 30, 'F')
    
    // INVOICE title (left side)
    this.doc.setFontSize(24)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(0, 0, 0)
    this.doc.text('INVOICE', 20, 80)
    
    // Invoice details (right side)
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`Invoice #: ${invoiceData.id}`, 150, 75)
    this.doc.text(`Date: ${this.formatDate(invoiceData.date)}`, 150, 82)
    this.doc.text(`Due Date: ${this.formatDate(invoiceData.dueDate)}`, 150, 89)
    
    // Status badge (orange rounded rectangle)
    this.doc.setFillColor(245, 158, 11) // Orange color
    this.doc.roundedRect(150, 92, 25, 8, 2, 2, 'F')
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(invoiceData.status.toUpperCase(), 162, 98, { align: 'center' })
    
    // BILL TO section
    this.doc.setTextColor(0, 0, 0)
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('BILL TO:', 20, 110)
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(invoiceData.memberName, 20, 120)
    this.doc.text(invoiceData.memberPhone, 20, 130)
    if (invoiceData.memberEmail) {
      this.doc.text(invoiceData.memberEmail, 20, 140)
    }
    
    // Items table
    this.addItemsTable(invoiceData.items)
    
    // Totals
    this.addTotals(invoiceData)
    
    // Footer
    this.addNotesAndFooter(invoiceData)
    
    return this.doc
  }

  private addItemsTable(items: InvoiceItem[]) {
    const startY = 160
    
    // Table header
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(0, 0, 0)
    this.doc.text('Description', 20, startY)
    this.doc.text('Qty', 120, startY)
    this.doc.text('Price', 140, startY)
    this.doc.text('Total', 170, startY)
    
    // Header line
    this.doc.line(20, startY + 5, 190, startY + 5)
    
    // Table rows
    let yPosition = startY + 15
    items.forEach((item) => {
      this.doc.setFontSize(9)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setTextColor(0, 0, 0)
      
      // Item description
      this.doc.text(item.description, 20, yPosition)
      
      // Quantity
      this.doc.text(item.quantity.toString(), 120, yPosition)
      
      // Price
      this.doc.text(this.formatCurrency(item.price), 140, yPosition)
      
      // Total
      this.doc.text(this.formatCurrency(item.total), 170, yPosition)
      
      yPosition += 12
    })
  }

  private addTotals(invoiceData: InvoiceData) {
    const startY = 200
    
    // Right-aligned totals
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(0, 0, 0)
    
    // Subtotal
    this.doc.text('Subtotal:', 120, startY)
    this.doc.text(this.formatCurrency(invoiceData.subtotal), 170, startY)
    
    // Tax
    this.doc.text('Tax (18%):', 120, startY + 10)
    this.doc.text(this.formatCurrency(invoiceData.tax), 170, startY + 10)
    
    // Total
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Total:', 120, startY + 25)
    this.doc.text(this.formatCurrency(invoiceData.total), 170, startY + 25)
  }

  private addNotesAndFooter(invoiceData: InvoiceData) {
    const startY = 250
    
    // Simple footer
    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(100, 100, 100)
    this.doc.text(
      'Thank you for choosing TriStar Fitness!',
      105, startY, { align: 'center' }
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