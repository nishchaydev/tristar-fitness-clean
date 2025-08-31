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
      console.log('Exporting CSV:', { dataLength: data.length, filename });
      
      if (data.length === 0) {
        console.warn('No data to export');
        alert('No data to export');
        return;
      }

      const headers = Object.keys(data[0]);
      console.log('CSV headers:', headers);
      
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Handle values that contain commas
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      console.log('CSV content length:', csvContent.length);

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('CSV export successful');
    } catch (error) {
      console.error('CSV export error:', error);
      throw new Error(`Failed to export CSV: ${error}`);
    }
  }

  static exportToPDF(data: any[], filename: string, title: string) {
    try {
      console.log('Starting HTML export (PDF alternative):', { dataLength: data.length, filename, title });
      
      // Create a simple HTML table that can be printed as PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #22c55e; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #22c55e; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .header { text-align: center; margin-bottom: 20px; }
            .timestamp { color: #666; font-size: 12px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <p class="timestamp">Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          ${data.length > 0 ? `
            <table>
              <thead>
                <tr>
                  ${Object.keys(data[0]).filter(key => {
                    const value = data[0][key];
                    return typeof value !== 'object' || value === null || Array.isArray(value);
                  }).map(header => `<th>${header}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.map(row => `
                  <tr>
                    ${Object.keys(data[0]).filter(key => {
                      const value = data[0][key];
                      return typeof value !== 'object' || value === null || Array.isArray(value);
                    }).map(header => {
                      const value = row[header];
                      let displayValue = '';
                      if (Array.isArray(value)) {
                        displayValue = value.length.toString();
                      } else if (typeof value === 'object' && value !== null) {
                        displayValue = JSON.stringify(value).substring(0, 30) + '...';
                      } else {
                        displayValue = value?.toString() || '';
                      }
                      return `<td>${displayValue}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p>No data available</p>'}
        </body>
        </html>
      `;

      // Create blob and download as HTML file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Download the HTML file
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.html`;
      link.click();
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      console.log('HTML export completed successfully');
    } catch (error) {
      console.error('HTML export error:', error);
      throw new Error(`Failed to generate HTML export: ${error}`);
    }
  }

  static exportAllData(data: ExportData) {
    try {
      console.log('Starting bulk export of all data:', data);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const zip = new JSZip();

      // Export each data type to CSV
      Object.entries(data).forEach(([key, value]) => {
        if (value && value.length > 0) {
          console.log(`Processing ${key}:`, value.length, 'records');
          
          const headers = Object.keys(value[0]);
          
          const csvContent = [
            headers.join(','),
            ...value.map(row => 
              headers.map(header => {
                const val = row[header];
                if (Array.isArray(val)) {
                  return val.length.toString();
                }
                if (typeof val === 'object' && val !== null) {
                  return JSON.stringify(val).replace(/"/g, '""');
                }
                const strVal = val?.toString() || '';
                return strVal.includes(',') ? `"${strVal}"` : strVal;
              }).join(',')
            )
          ].join('\n');
          
          zip.file(`${key}_${timestamp}.csv`, csvContent);
          console.log(`Added ${key}_${timestamp}.csv to zip`);
        } else {
          console.log(`Skipping ${key}: no data`);
        }
      });

      // Generate and download zip file
      console.log('Generating ZIP file...');
      zip.generateAsync({ type: 'blob' }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `tristar_fitness_data_${timestamp}.zip`;
        link.click();
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        console.log('Bulk export successful');
      });
    } catch (error) {
      console.error('Bulk export error:', error);
      throw new Error(`Failed to export all data: ${error}`);
    }
  }

  static generateReport(data: ExportData) {
    try {
      console.log('Starting HTML report generation:', data);
      
      // Create a comprehensive HTML report
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>TriStar Fitness - Comprehensive Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1, h2 { color: #22c55e; text-align: center; }
            h2 { margin-top: 30px; border-bottom: 2px solid #22c55e; padding-bottom: 10px; }
            .header { text-align: center; margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; }
            .summary { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .summary-item { margin: 10px 0; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #22c55e; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .timestamp { color: #666; font-size: 14px; }
            .page-break { page-break-before: always; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TriStar Fitness</h1>
            <h2>Comprehensive Report</h2>
            <p class="timestamp">Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <h3>Summary</h3>
            <div class="summary-item">Total Members: ${data.members?.length || 0}</div>
            <div class="summary-item">Total Trainers: ${data.trainers?.length || 0}</div>
            <div class="summary-item">Total Visitors: ${data.visitors?.length || 0}</div>
            <div class="summary-item">Total Invoices: ${data.invoices?.length || 0}</div>
            <div class="summary-item">Total Sessions: ${data.sessions?.length || 0}</div>
            <div class="summary-item">Total Follow-ups: ${data.followUps?.length || 0}</div>
            <div class="summary-item">Total Activities: ${data.activities?.length || 0}</div>
          </div>
          
          ${data.members && data.members.length > 0 ? `
            <h2>Members</h2>
            <table>
              <thead>
                <tr>
                  ${Object.keys(data.members[0]).filter(key => {
                    const value = data.members[0][key];
                    return typeof value !== 'object' || value === null || Array.isArray(value);
                  }).map(header => `<th>${header}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.members.map(member => `
                  <tr>
                    ${Object.keys(data.members[0]).filter(key => {
                      const value = data.members[0][key];
                      return typeof value !== 'object' || value === null || Array.isArray(value);
                    }).map(header => {
                      const value = member[header];
                      let displayValue = '';
                      if (Array.isArray(value)) {
                        displayValue = value.length.toString();
                      } else if (typeof value === 'object' && value !== null) {
                        displayValue = JSON.stringify(value).substring(0, 30) + '...';
                      } else {
                        displayValue = value?.toString() || '';
                      }
                      return `<td>${displayValue}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
          
          ${data.trainers && data.trainers.length > 0 ? `
            <div class="page-break"></div>
            <h2>Trainers</h2>
            <table>
              <thead>
                <tr>
                  ${Object.keys(data.trainers[0]).filter(key => {
                    const value = data.trainers[0][key];
                    return typeof value !== 'object' || value === null || Array.isArray(value);
                  }).map(header => `<th>${header}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.trainers.map(trainer => `
                  <tr>
                    ${Object.keys(data.trainers[0]).filter(key => {
                      const value = data.trainers[0][key];
                      return typeof value !== 'object' || value === null || Array.isArray(value);
                    }).map(header => {
                      const value = trainer[header];
                      let displayValue = '';
                      if (Array.isArray(value)) {
                        displayValue = value.length.toString();
                      } else if (typeof value === 'object' && value !== null) {
                        displayValue = JSON.stringify(value).substring(0, 30) + '...';
                      } else {
                        displayValue = value?.toString() || '';
                      }
                      return `<td>${displayValue}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
          
          ${data.invoices && data.invoices.length > 0 ? `
            <div class="page-break"></div>
            <h2>Invoices</h2>
            <table>
              <thead>
                <tr>
                  ${Object.keys(data.invoices[0]).filter(key => {
                    const value = data.invoices[0][key];
                    return typeof value !== 'object' || value === null || Array.isArray(value);
                  }).map(header => `<th>${header}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.invoices.map(invoice => `
                  <tr>
                    ${Object.keys(data.invoices[0]).filter(key => {
                      const value = data.invoices[0][key];
                      return typeof value !== 'object' || value === null || Array.isArray(value);
                    }).map(header => {
                      const value = invoice[header];
                      let displayValue = '';
                      if (Array.isArray(value)) {
                        displayValue = value.length.toString();
                      } else if (typeof value === 'object' && value !== null) {
                        displayValue = JSON.stringify(value).substring(0, 30) + '...';
                      } else {
                        displayValue = value?.toString() || '';
                      }
                      return `<td>${displayValue}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
          
          ${data.followUps && data.followUps.length > 0 ? `
            <div class="page-break"></div>
            <h2>Follow-ups</h2>
            <table>
              <thead>
                <tr>
                  ${Object.keys(data.followUps[0]).filter(key => {
                    const value = data.followUps[0][key];
                    return typeof value !== 'object' || value === null || Array.isArray(value);
                  }).map(header => `<th>${header}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.followUps.map(followUp => `
                  <tr>
                    ${Object.keys(data.followUps[0]).filter(key => {
                      const value = data.followUps[0][key];
                      return typeof value !== 'object' || value === null || Array.isArray(value);
                    }).map(header => {
                      const value = followUp[header];
                      let displayValue = '';
                      if (Array.isArray(value)) {
                        displayValue = value.length.toString();
                      } else if (typeof value === 'object' && value !== null) {
                        displayValue = JSON.stringify(value).substring(0, 30) + '...';
                      } else {
                        displayValue = value?.toString() || '';
                      }
                      return `<td>${displayValue}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
        </body>
        </html>
      `;

      // Create blob and download as HTML file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Download the HTML file
      const link = document.createElement('a');
      link.href = url;
      link.download = `tristar_fitness_report_${new Date().toISOString().split('T')[0]}.html`;
      link.click();
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      console.log('HTML report generation completed successfully');
    } catch (error) {
      console.error('HTML report generation error:', error);
      throw new Error(`Failed to generate HTML report: ${error}`);
    }
  }
}
