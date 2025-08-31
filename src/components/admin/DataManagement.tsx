import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Upload, 
  FileText, 
  Database, 
  Archive, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDataStore } from '@/lib/dataSync';
import { DataExporter, ExportData } from '@/lib/dataExport';

const DataManagement = () => {
  const { toast } = useToast();
  const { 
    members, 
    trainers, 
    visitors, 
    invoices, 
    activities,
    sessions,
    followUps,
    clearAllData,
    importData
  } = useDataStore();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportCSV = (dataType: string, data: any[]) => {
    try {
      DataExporter.exportToCSV(data, `tristar_${dataType}`);
      toast({
        title: "Export Successful",
        description: `${dataType} data exported to CSV successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = (dataType: string, data: any[]) => {
    try {
      DataExporter.exportToPDF(data, `tristar_${dataType}`, `TriStar Fitness - ${dataType}`);
      toast({
        title: "Export Successful",
        description: `${dataType} data exported to PDF successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const exportData: ExportData = {
        members,
        trainers,
        visitors,
        invoices,
        activities,
        sessions,
        followUps
      };
      
      await DataExporter.exportAllData(exportData);
      toast({
        title: "Export Successful",
        description: "All data exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export all data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateReport = () => {
    try {
      const exportData: ExportData = {
        members,
        trainers,
        visitors,
        invoices,
        activities,
        sessions,
        followUps
      };
      
      DataExporter.generateReport(exportData);
      toast({
        title: "Report Generated",
        description: "Comprehensive report generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        importData(data);
        toast({
          title: "Import Successful",
          description: "Data imported successfully.",
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid file format. Please check your file.",
          variant: "destructive",
        });
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllData();
      toast({
        title: "Data Cleared",
        description: "All data has been cleared successfully.",
      });
    }
  };

  const dataStats = [
    { name: 'Members', count: members.length, color: 'bg-blue-500' },
    { name: 'Trainers', count: trainers.length, color: 'bg-green-500' },
    { name: 'Visitors', count: visitors.length, color: 'bg-yellow-500' },
    { name: 'Invoices', count: invoices.length, color: 'bg-purple-500' },
    { name: 'Sessions', count: sessions.length, color: 'bg-indigo-500' },
    { name: 'Follow-ups', count: followUps.length, color: 'bg-orange-500' },
    { name: 'Activities', count: activities.length, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Export, import, and manage your gym data</p>
        </div>
      </div>

      {/* Data Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {dataStats.map((stat) => (
          <Card key={stat.name} className="text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 group hover:scale-105 cursor-pointer">
            <CardContent className="p-4">
              <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200`}>
                <Database className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{stat.name}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Export Options */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 shadow-md">
        <CardHeader className="border-b border-gray-200 dark:border-gray-600">
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Download className="w-5 h-5 text-green-600" />
            <span>Export Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Individual Exports */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataStats.map((stat) => (
              <div key={stat.name} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 group hover:scale-105">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{stat.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.count} records</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportCSV(stat.name.toLowerCase(), 
                      stat.name === 'Members' ? members :
                      stat.name === 'Trainers' ? trainers :
                      stat.name === 'Visitors' ? visitors :
                      stat.name === 'Invoices' ? invoices :
                      stat.name === 'Sessions' ? sessions :
                      stat.name === 'Follow-ups' ? followUps : activities
                    )}
                    className="hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-900/30 dark:hover:text-green-300 transition-all duration-200 group/btn hover:scale-105"
                  >
                    <FileText className="w-4 h-4 group-hover/btn:animate-pulse" />
                    CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportPDF(stat.name.toLowerCase(), 
                      stat.name === 'Members' ? members :
                      stat.name === 'Trainers' ? trainers :
                      stat.name === 'Visitors' ? visitors :
                      stat.name === 'Invoices' ? invoices :
                      stat.name === 'Sessions' ? sessions :
                      stat.name === 'Follow-ups' ? followUps : activities
                    )}
                    className="hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-all duration-200 group/btn hover:scale-105"
                  >
                    <FileText className="h-4 w-4 group-hover/btn:animate-pulse" />
                    HTML
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Bulk Export */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleExportAll}
                disabled={isExporting}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 hover:scale-105 transition-transform duration-200 h-12 px-6"
              >
                {isExporting ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Archive className="w-5 h-5" />
                )}
                <span className="text-lg">{isExporting ? 'Exporting...' : 'Export All Data (ZIP)'}</span>
              </Button>
              
              <Button
                onClick={handleGenerateReport}
                variant="outline"
                className="flex items-center space-x-2 h-12 px-6 hover:scale-105 transition-transform duration-200 border-tristar-300 hover:border-tristar-500 hover:bg-tristar-50 dark:hover:bg-tristar-900/30"
              >
                <FileText className="w-5 h-5" />
                <span className="text-lg">Generate Report</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Options */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 shadow-md">
        <CardHeader className="border-b border-gray-200 dark:border-gray-600">
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Upload className="w-5 h-5 text-blue-600" />
            <span>Import Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file">
              <Button
                variant="outline"
                disabled={isImporting}
                className="flex items-center space-x-2 cursor-pointer h-12 px-6 hover:scale-105 transition-transform duration-200 border-blue-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                asChild
              >
                <span>
                  {isImporting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  <span className="text-lg">{isImporting ? 'Importing...' : 'Import JSON File'}</span>
                </span>
              </Button>
            </label>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Import previously exported data (JSON format)
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                This will merge imported data with existing data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 shadow-md">
        <CardHeader className="border-b border-red-200 dark:border-red-800">
          <CardTitle className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span>Danger Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-red-600 dark:text-red-400 text-lg">Clear All Data</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Permanently delete all gym data. This action cannot be undone.
              </p>
              <p className="text-xs text-red-400 dark:text-red-300 mt-2">
                ⚠️ This will remove all members, trainers, invoices, and other data
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleClearData}
              className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200 h-12 px-6"
            >
              <Trash2 className="w-5 h-5" />
              <span>Clear All Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManagement;
