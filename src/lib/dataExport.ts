import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
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

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static exportToPDF(data: any[], filename: string, title: string) {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text(title, 14, 20);
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      if (data.length === 0) {
        doc.text('No data available', 14, 50);
        doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
        return;
      }

      // Prepare table data - handle nested objects and arrays
      const headers = Object.keys(data[0]).filter(key => {
        const value = data[0][key];
        return typeof value !== 'object' || value === null || Array.isArray(value);
      });
      
      const tableData = data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (Array.isArray(value)) {
            return value.length.toString();
          }
          if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value).substring(0, 20) + '...';
          }
          return value?.toString() || '';
        })
      );

      // Add table
      (doc as any).autoTable({
        head: [headers],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [34, 197, 94], // Green color
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        didDrawPage: function (data: any) {
          // Add page numbers
          const pageCount = (doc as any).internal.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            (doc as any).setPage(i);
            (doc as any).text(
              `Page ${i} of ${pageCount}`,
              (doc as any).internal.pageSize.width - 20,
              (doc as any).internal.pageSize.height - 10
            );
          }
        }
      });

      doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  static exportAllData(data: ExportData) {
    const timestamp = new Date().toISOString().split('T')[0];
    const zip = new JSZip();

    // Export each data type to CSV
    Object.entries(data).forEach(([key, value]) => {
      if (value && value.length > 0) {
        const headers = Object.keys(value[0]).filter(key => {
          const val = value[0][key];
          return typeof val !== 'object' || val === null || Array.isArray(val);
        });
        
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
      }
    });

    // Generate and download zip file
    zip.generateAsync({ type: 'blob' }).then(content => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `tristar_fitness_data_${timestamp}.zip`;
      link.click();
    });
  }

  static generateReport(data: ExportData) {
    try {
      const doc = new jsPDF();
      
      // Title page
      doc.setFontSize(24);
      doc.text('TriStar Fitness', 105, 40, { align: 'center' });
      doc.setFontSize(16);
      doc.text('Comprehensive Report', 105, 55, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 70, { align: 'center' });

      // Summary
      doc.setFontSize(14);
      doc.text('Summary', 14, 90);
      doc.setFontSize(10);
      doc.text(`Total Members: ${data.members?.length || 0}`, 14, 100);
      doc.text(`Total Trainers: ${data.trainers?.length || 0}`, 14, 110);
      doc.text(`Total Visitors: ${data.visitors?.length || 0}`, 14, 120);
      doc.text(`Total Invoices: ${data.invoices?.length || 0}`, 14, 130);
      doc.text(`Total Sessions: ${data.sessions?.length || 0}`, 14, 140);
      doc.text(`Total Follow-ups: ${data.followUps?.length || 0}`, 14, 150);

      // Add page break
      doc.addPage();

      // Members table
      if (data.members && data.members.length > 0) {
        doc.setFontSize(16);
        doc.text('Members', 14, 20);
        const memberHeaders = Object.keys(data.members[0]).filter(key => {
          const value = data.members[0][key];
          return typeof value !== 'object' || value === null || Array.isArray(value);
        });
        const memberData = data.members.map(member => 
          memberHeaders.map(header => {
            const value = member[header];
            if (Array.isArray(value)) {
              return value.length.toString();
            }
            if (typeof value === 'object' && value !== null) {
              return JSON.stringify(value).substring(0, 20) + '...';
            }
            return value?.toString() || '';
          })
        );

        (doc as any).autoTable({
          head: [memberHeaders],
          body: memberData,
          startY: 30,
          styles: { fontSize: 8 },
          headStyles: {
            fillColor: [34, 197, 94],
            textColor: 255,
            fontStyle: 'bold',
          },
        });
      }

      // Add more pages for other data types
      if (data.trainers && data.trainers.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Trainers', 14, 20);
        const trainerHeaders = Object.keys(data.trainers[0]).filter(key => {
          const value = data.trainers[0][key];
          return typeof value !== 'object' || value === null || Array.isArray(value);
        });
        const trainerData = data.trainers.map(trainer => 
          trainerHeaders.map(header => {
            const value = trainer[header];
            if (Array.isArray(value)) {
              return value.length.toString();
            }
            if (typeof value === 'object' && value !== null) {
              return JSON.stringify(value).substring(0, 20) + '...';
            }
            return value?.toString() || '';
          })
        );

        (doc as any).autoTable({
          head: [trainerHeaders],
          body: trainerData,
          startY: 30,
          styles: { fontSize: 8 },
          headStyles: {
            fillColor: [34, 197, 94],
            textColor: 255,
            fontStyle: 'bold',
          },
        });
      }

      doc.save(`tristar_fitness_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Report generation error:', error);
      throw new Error('Failed to generate report');
    }
  }
}
