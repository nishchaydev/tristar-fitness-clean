import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, Database, FileText, Settings } from 'lucide-react';

interface DatabaseSettingsProps {
  onClose: () => void;
}

const DatabaseSettings: React.FC<DatabaseSettingsProps> = ({ onClose }) => {
  const [dbPath, setDbPath] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');

  useEffect(() => {
    // Get database path
    if (window.electronAPI) {
      window.electronAPI.getDatabasePath().then((path: string) => {
        setDbPath(path);
      });
    }
  }, []);

  const handleExportDatabase = async () => {
    setIsExporting(true);
    setExportStatus('Exporting database...');
    try {
      if (window.electronAPI) {
        const exportPath = await window.electronAPI.exportDatabase();
        setExportStatus(`Database exported to: ${exportPath}`);
      } else {
        // Fallback to HTTP endpoint
        const res = await fetch('/api/export/db', { headers: { Authorization: 'Bearer demo-static-token' } });
        if (!res.ok) throw new Error('Export failed');
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tristar_backup_${new Date().toISOString().split('T')[0]}.db`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setExportStatus('Database exported successfully');
      }
    } catch (error) {
      setExportStatus(`Export failed: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async (table: string) => {
    setIsExporting(true);
    setExportStatus(`Exporting ${table} CSV...`);
    try {
      if (window.electronAPI) {
        const csv = await window.electronAPI.exportCSV(table);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${table}_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setExportStatus(`${table} CSV exported successfully`);
      } else {
        const res = await fetch(`/api/export/csv/${table}`, { headers: { Authorization: 'Bearer demo-static-token' } });
        if (!res.ok) throw new Error('CSV export failed');
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${table}_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setExportStatus(`${table} CSV exported successfully`);
      }
    } catch (error) {
      setExportStatus(`CSV export failed: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Database Settings</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          <CardDescription>
            Manage your TriStar Fitness database and exports
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Database Path */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Database Location</label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Database className="h-4 w-4 text-muted-foreground" />
              <code className="text-sm text-muted-foreground flex-1 truncate">
                {dbPath || 'Loading...'}
              </code>
              <Badge variant="secondary">SQLite</Badge>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Export Options</h3>
            
            {/* Database Export */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Database Backup</label>
              <p className="text-sm text-muted-foreground">
                Export the complete database as a .db file
              </p>
              <Button 
                onClick={handleExportDatabase}
                disabled={isExporting}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Database'}
              </Button>
            </div>

            {/* Export All (ZIP) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Export All (ZIP)</label>
              <p className="text-sm text-muted-foreground">Download all tables as CSV files inside one ZIP</p>
              <Button
                variant="default"
                onClick={async () => {
                  setIsExporting(true);
                  setExportStatus('Preparing ZIP export...');
                  try {
                    const res = await fetch('/api/export/all.zip', { headers: { Authorization: 'Bearer demo-static-token' } });
                    if (!res.ok) throw new Error('Export failed');
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `tristar_export_${new Date().toISOString().split('T')[0]}.zip`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                    setExportStatus('ZIP exported successfully');
                  } catch (e) {
                    setExportStatus(`ZIP export failed: ${e}`);
                  } finally {
                    setIsExporting(false);
                  }
                }}
                disabled={isExporting}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export All (ZIP)'}
              </Button>
            </div>

            {/* CSV Exports */}
            <div className="space-y-3">
              <label className="text-sm font-medium">CSV Exports</label>
              <p className="text-sm text-muted-foreground">
                Export individual tables as CSV files
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExportCSV('members')}
                  disabled={isExporting}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Members
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExportCSV('visitors')}
                  disabled={isExporting}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Visitors
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExportCSV('payments')}
                  disabled={isExporting}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Payments
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExportCSV('invoices')}
                  disabled={isExporting}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Invoices
                </Button>
              </div>
            </div>
          </div>

          {/* Status */}
          {exportStatus && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{exportStatus}</p>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Settings className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Database Information
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Your data is stored locally in an SQLite database. 
                  Regular backups are recommended for data safety.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseSettings;
