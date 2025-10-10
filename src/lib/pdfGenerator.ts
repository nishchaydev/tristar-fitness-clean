import jsPDF from 'jspdf'
// Import logo for embedding in invoice header
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite will treat this as a URL string
import tristarLogoUrl from '../../Images/tristarimage.jpg'

export interface InvoiceData {
  id: string
  memberName: string
  memberPhone: string
  memberEmail?: string
  items: InvoiceItem[]
  subtotal: number
  total: number
  date: string
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  notes?: string
  termsAndConditions?: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  price: number
  total: number
}

// Default Terms & Conditions used when none are provided by the caller
const DEFAULT_TERMS: string[] = [
  'The TRI-STAR FITNESS allows the members to join the gym.',
  'The membership is non-transferable, non-refundable, and cannot be shared.',
  'The Member promises to follow all the rules and conditions of the agreement.',
  'Respect other members\' rights and follow the rules as per the agreement.',
  'Not engaging in activities like doping, steroids, smoking, or alcohol that could harm health.',
  'Outside shoes are strictly not allowed; members need to carry extra shoes with them.',
  'The Gym will be open from morning 6:30 till afternoon 11 and from 4:30 till 10 in the evening.',
  'Wearing inappropriate clothes is not allowed.',
  'For any injury, physical or internal damages TRI-STAR FITNESS does not hold any liability.',
  'Using dumbbells and weights, members need to re-rack at the appropriate places after use.',
  'Tri-Star Fitness holds all the rights to cancel the membership if proper rules and regulations are not followed.'
]

export class PDFGenerator {
  private doc: jsPDF
  private supportsRupeeSymbol: boolean = false
  private fontName?: string

  constructor() {
    this.doc = new jsPDF()
  }

  // Allow callers to set the active font family if it has been registered
  public setFontFamily(fontName: string) {
    this.fontName = fontName
    this.doc.setFont(fontName, 'normal')
  }

  generateInvoice(
    invoiceData: InvoiceData,
    logoDataUrl?: string,
    supportsRupeeSymbol: boolean = true,
    fontName?: string
  ): jsPDF {
    this.supportsRupeeSymbol = supportsRupeeSymbol
    this.fontName = fontName
    if (this.fontName) {
      this.doc.setFont(this.fontName, 'normal')
    }
    // Green header banner (matching the image)
    this.doc.setFillColor(16, 185, 129) // Tri Star green
    this.doc.rect(0, 0, 210, 50, 'F')
    
    // White circle behind logo (left side)
    this.doc.setFillColor(255, 255, 255)
    this.doc.circle(25, 25, 12, 'F')
    // Draw logo image if available; otherwise fallback to TS letters
    if (logoDataUrl) {
      try {
        // Place logo inside the white circle
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.doc as any).addImage(logoDataUrl, 'JPEG', 13, 13, 24, 24)
      } catch {
        this.doc.setFontSize(12)
        this.doc.setFont('helvetica', 'bold')
        this.doc.setTextColor(16, 185, 129)
        this.doc.text('TS', 25, 30, { align: 'center' })
      }
    } else {
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'bold')
      this.doc.setTextColor(16, 185, 129)
      this.doc.text('TS', 25, 30, { align: 'center' })
    }
    
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
    this.doc.text('SAPNA SANGEETA MAIN ROAD NEXT TO LOTUS ELECTRONICS, INDORE', 105, 35, { align: 'center' })
    
    // Contact info
    this.doc.setFontSize(8)
    this.doc.text('7693006066, 8103199510', 105, 42, { align: 'center' })
    this.doc.text('tristarfitness26@gmail.com', 105, 47, { align: 'center' })
    
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
      this.doc.text(this.formatCurrency(item.price, this.supportsRupeeSymbol), 140, yPosition)
      
      // Total
      this.doc.text(this.formatCurrency(item.total, this.supportsRupeeSymbol), 170, yPosition)
      
      yPosition += 12
    })
  }

  private addTotals(invoiceData: InvoiceData) {
    const startY = 200
    
    // Right-aligned totals
    this.doc.setFontSize(11)
    this.doc.setFont(this.fontName || 'helvetica', 'normal')
    this.doc.setTextColor(0, 0, 0)
    
    // Subtotal
    this.doc.text('Subtotal:', 120, startY)
    this.doc.text(this.formatCurrency(invoiceData.subtotal, this.supportsRupeeSymbol), 170, startY)
    
    // Total
    this.doc.setFontSize(13)
    this.doc.setFont(this.fontName || 'helvetica', 'bold')
    this.doc.text('Total:', 120, startY + 15)
    this.doc.text(this.formatCurrency(invoiceData.total, this.supportsRupeeSymbol), 170, startY + 15)
  }

  private addNotesAndFooter(invoiceData: InvoiceData) {
    let startY = 250
    
    // Notes section
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(0, 0, 0)
    this.doc.text('Notes:', 20, startY)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(9)
    const notesLines = this.doc.splitTextToSize((invoiceData.notes || '—'), 170)
    this.doc.text(notesLines, 20, startY + 8)
    startY += Math.max(20, notesLines.length * 5 + 8)

    // Terms & Conditions (always on a new page for clean layout)
    this.doc.addPage()
    startY = 20
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(12)
    this.doc.text('Terms & Conditions:', 20, startY)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(9)

    const termsList: string[] = invoiceData.termsAndConditions
      ? invoiceData.termsAndConditions
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean)
      : DEFAULT_TERMS

    let y = startY + 8
    const leftX = 25
    const bulletX = 22
    const maxWidth = 170

    for (const term of termsList) {
      const wrapped = this.doc.splitTextToSize(term, maxWidth)
      // Add page if needed
      if (y + wrapped.length * 5 > 285) {
        this.doc.addPage()
        y = 20
      }
      // Bullet
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('•', bulletX, y)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(wrapped, leftX, y)
      y += Math.max(6, wrapped.length * 5 + 2)
    }
    startY = y

    // Simple footer
    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(100, 100, 100)
    this.doc.text(
      'Thank you for choosing Tri Star Fitness!',
      105, startY + 20, { align: 'center' }
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

  private formatCurrency(amount: number, supportsRupeeSymbol: boolean): string {
    // Format as ₹1999 (no comma groupings, no spaces). If font lacks ₹, fallback to Rs1999
    const rounded = Math.round(Number(amount) || 0)
    return `${supportsRupeeSymbol ? '₹' : 'Rs'}${rounded}`
  }

  // Generate and download PDF
  static async generateAndDownload(invoiceData: InvoiceData, filename: string) {
    const generator = new PDFGenerator()
    let logoDataUrl: string | undefined
    let supportsRupee = false
    let loadedFontName: string | undefined
    try {
      logoDataUrl = await loadImageAsDataUrl(tristarLogoUrl)
    } catch {
      // ignore if logo can't be loaded
    }
    try {
      loadedFontName = await loadAndRegisterFont(generator, '/fonts/NotoSans-Regular.ttf', 'NotoSans')
      if (loadedFontName) supportsRupee = true
      if (!loadedFontName) {
        loadedFontName = await loadAndRegisterFont(generator, '/fonts/Roboto-Regular.ttf', 'Roboto')
        if (loadedFontName) supportsRupee = true
      }
      if (loadedFontName) generator.setFontFamily(loadedFontName)
    } catch {
      supportsRupee = false
    }
    const doc = generator.generateInvoice(invoiceData, logoDataUrl, supportsRupee, loadedFontName)
    // Save the PDF
    doc.save(filename)
  }
}

// Export a simple function for easy use
export const generateInvoicePDF = async (invoiceData: InvoiceData, filename?: string) => {
  const defaultFilename = `invoice-${invoiceData.id}.pdf`
  return PDFGenerator.generateAndDownload(invoiceData, filename || defaultFilename)
}

// Helper to load an image URL into a base64 data URL for reliable embedding in PDFs
async function loadImageAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Failed to convert image to data URL'))
    }
    reader.onerror = (e) => reject(e)
    reader.readAsDataURL(blob)
  })
}

// Load a TTF from public path and register it in the provided PDFGenerator instance
async function loadAndRegisterFont(generator: PDFGenerator, fontPublicPath: string, fontName: string): Promise<string | undefined> {
  try {
    const res = await fetch(fontPublicPath)
    if (!res.ok) return undefined
    const blob = await res.blob()
    const base64 = await blobToBase64(blob)
    // @ts-ignore addFileToVFS is available on jsPDF
    ;(generator as unknown as { doc: jsPDF }).doc.addFileToVFS(`${fontName}.ttf`, base64 as unknown as string)
    // @ts-ignore addFont exists on jsPDF
    ;(generator as unknown as { doc: jsPDF }).doc.addFont(`${fontName}.ttf`, fontName, 'normal')
    return fontName
  } catch {
    return undefined
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result))
    reader.onerror = (e) => reject(e)
    reader.readAsDataURL(blob)
  })
}