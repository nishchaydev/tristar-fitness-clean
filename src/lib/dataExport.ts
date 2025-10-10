import JSZip from 'jszip';

export interface ExportData {
  members: any[];
  trainers: any[];
  visitors: any[];
  invoices: any[];
  activities: any[];
  sessions: any[];
  followUps: any[];
}

export class DataExporter {
  static exportToCSV(data: any[], filename: string) {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data to export');
      }

      const headers = Object.keys(data[0]).filter(key => {
        const value = data[0][key];
        return value !== undefined && value !== null && typeof value !== 'object';
      });
      
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Handle values that contain commas, quotes, or newlines
            if (typeof value === 'string') {
              const needsQuotes = value.includes(',') || value.includes('"') || value.includes('\n');
              return needsQuotes ? `"${value.replace(/"/g, '""')}"` : value;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('CSV export error:', error);
      throw new Error(`Failed to export CSV: ${error}`);
    }
  }

  static exportToPDF(data: any[], filename: string, title: string) {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data to export');
      }

      // Filter out object properties that can't be displayed in a table
      const headers = Object.keys(data[0]).filter(key => {
        const value = data[0][key];
        return value !== undefined && value !== null && 
               (typeof value !== 'object' || Array.isArray(value));
      });
      
      // Create a simple HTML table that can be printed as PDF
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      margin: 20px; 
      font-size: 12px;
      color: #333;
    }
    h1 { 
      color: #22c55e; 
      text-align: center; 
      margin-bottom: 10px;
      font-size: 24px;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-top: 20px; 
      font-size: 11px;
    }
    th, td { 
      border: 1px solid #ddd; 
      padding: 6px; 
      text-align: left; 
      word-wrap: break-word;
      max-width: 150px;
    }
    th { 
      background-color: #22c55e; 
      color: white; 
      font-weight: bold; 
    }
    tr:nth-child(even) { background-color: #f8fafc; }
    .header { text-align: center; margin-bottom: 20px; }
    .timestamp { color: #666; font-size: 10px; }
    @media print { 
      body { margin: 0; }
      table { font-size: 10px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p class="timestamp">Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
  </div>
  
  <table>
    <thead>
      <tr>
        ${headers.map(header => `<th>${header}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.map(row => `
        <tr>
          ${headers.map(header => {
            const value = row[header];
            let displayValue = '';
            
            if (Array.isArray(value)) {
              displayValue = value.join(', ');
            } else if (typeof value === 'object' && value !== null) {
              displayValue = JSON.stringify(value);
            } else if (value === null || value === undefined) {
              displayValue = '';
            } else {
              displayValue = String(value);
            }
            
            return `<td>${displayValue}</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;

      console.log('HTML content generated, length:', htmlContent.length);

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.html`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('HTML export successful');
    } catch (error) {
      console.error('HTML export error:', error);
      throw new Error(`Failed to export HTML: ${error}`);
    }
  }

  static async exportToZIP(data: ExportData, filename: string) {
    try {
      console.log('Starting ZIP export:', { filename, dataKeys: Object.keys(data) });
      
      const zip = new JSZip();
      
      // Add each data type as a separate CSV file
      Object.entries(data).forEach(([key, value]) => {
        if (value && value.length > 0) {
          try {
            const csvContent = this.convertToCSV(value);
            zip.file(`${key}.csv`, csvContent);
            console.log(`Added ${key}.csv with ${value.length} records`);
          } catch (error) {
            console.warn(`Failed to add ${key}.csv:`, error);
          }
        }
      });
      
      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.zip`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('ZIP export successful');
    } catch (error) {
      console.error('ZIP export error:', error);
      throw new Error(`Failed to export ZIP: ${error}`);
    }
  }

  private static convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]).filter(key => {
      const value = data[0][key];
      return value !== undefined && value !== null && typeof value !== 'object';
    });
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string') {
            const needsQuotes = value.includes(',') || value.includes('"') || value.includes('\n');
            return needsQuotes ? `"${value.replace(/"/g, '""')}"` : value;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  }

  static validateExportData(data: any[]): boolean {
    if (!Array.isArray(data)) {
      console.error('Data is not an array');
      return false;
    }
    
    if (data.length === 0) {
      console.warn('Data array is empty');
      return false;
    }
    
    if (typeof data[0] !== 'object' || data[0] === null) {
      console.error('Data items are not objects');
      return false;
    }
    
    return true;
  }
}
