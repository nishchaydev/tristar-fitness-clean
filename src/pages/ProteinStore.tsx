import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDataStore } from '@/lib/dataSync';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ShoppingCart, 
  AlertTriangle, 
  Calendar,
  Package,
  DollarSign,
  TrendingUp,
  Printer,
  Download,
  RefreshCw
} from 'lucide-react';
import { loadSyncedJSON, toCSV } from '@/lib/utils';

const ProteinStore = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { proteins, addProtein, updateProtein, deleteProtein, recordProteinSale } = useDataStore();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProtein, setEditingProtein] = useState<string | null>(null);
  const [saleModal, setSaleModal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    basePrice: '',
    sellingPrice: '',
    quantityInStock: '',
    supplierName: '',
    expiryDate: ''
  });
  const [saleData, setSaleData] = useState({ unitsSold: '' });

  // Calculate statistics
  const totalProducts = proteins.length;
  const totalStock = proteins.reduce((sum, p) => sum + (p.quantityInStock || 0), 0);
  const totalRevenue = proteins.reduce((sum, p) => sum + (p.sellingPrice * (p.unitsSold || 0)), 0);
  const totalProfit = proteins.reduce((sum, p) => sum + ((p.sellingPrice - p.basePrice) * (p.unitsSold || 0)), 0);
  
  const lowStockProducts = proteins.filter(p => p.quantityInStock < 5);
  const nearExpiryProducts = proteins.filter(p => {
    if (!p.expiryDate) return false;
    const expiry = new Date(p.expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (parseFloat(formData.sellingPrice) <= parseFloat(formData.basePrice)) {
      toast({
        title: 'Invalid Pricing',
        description: 'Selling price must be higher than base price',
        variant: 'destructive'
      });
      return;
    }

    const proteinData = {
      name: formData.name,
      basePrice: parseFloat(formData.basePrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      quantityInStock: parseInt(formData.quantityInStock),
      supplierName: formData.supplierName || undefined,
      expiryDate: formData.expiryDate || undefined,
      unitsSold: 0, // Initialize units sold to 0
    };

    try {
      if (editingProtein) {
        updateProtein(editingProtein, proteinData);
        toast({ title: 'Product Updated', description: 'Protein product updated successfully' });
        setEditingProtein(null);
      } else {
        addProtein(proteinData);
        toast({ title: 'Product Added', description: 'Protein product added successfully' });
      }
      
      setFormData({
        name: '',
        basePrice: '',
        sellingPrice: '',
        quantityInStock: '',
        supplierName: '',
        expiryDate: ''
      });
      setShowAddForm(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save product',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (protein: any) => {
    setEditingProtein(protein.id);
    setFormData({
      name: protein.name,
      basePrice: protein.basePrice.toString(),
      sellingPrice: protein.sellingPrice.toString(),
      quantityInStock: protein.quantityInStock.toString(),
      supplierName: protein.supplierName || '',
      expiryDate: protein.expiryDate || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProtein(id);
      toast({ title: 'Product Deleted', description: `${name} has been removed` });
    }
  };

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const units = parseInt(saleData.unitsSold);
    
    if (units <= 0) {
      toast({
        title: 'Invalid Quantity',
        description: 'Units sold must be greater than 0',
        variant: 'destructive'
      });
      return;
    }

    const protein = proteins.find(p => p.id === saleModal);
    if (!protein) return;

    if (protein.quantityInStock < units) {
      toast({
        title: 'Insufficient Stock',
        description: `Only ${protein.quantityInStock} units available`,
        variant: 'destructive'
      });
      return;
    }

    try {
      recordProteinSale(saleModal!, units);
      toast({ 
        title: 'Sale Recorded', 
        description: `Sold ${units} units of ${protein.name}` 
      });
      setSaleData({ unitsSold: '' });
      setSaleModal(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record sale',
        variant: 'destructive'
      });
    }
  };

  const handlePrintData = async () => {
    try {
      const data = await loadSyncedJSON('proteins');
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Protein Store - Tri Star Fitness</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .header { text-align: center; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Tri Star Fitness - Protein Store</h1>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Base Price</th>
                    <th>Selling Price</th>
                    <th>Margin</th>
                    <th>Stock</th>
                    <th>Units Sold</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.map((p: any) => `
                    <tr>
                      <td>${p.name}</td>
                      <td>₹${p.basePrice}</td>
                      <td>₹${p.sellingPrice}</td>
                      <td>₹${p.sellingPrice - p.basePrice}</td>
                      <td>${p.quantityInStock}</td>
                      <td>${p.unitsSold}</td>
                      <td>₹${(p.sellingPrice - p.basePrice) * p.unitsSold}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      toast({
        title: 'Print Error',
        description: 'Failed to load data for printing',
        variant: 'destructive'
      });
    }
  };

  const handleExportCSV = async () => {
    try {
      const data = await loadSyncedJSON('proteins');
      const csvData = data.map((p: any) => ({
        'Product Name': p.name,
        'Base Price': p.basePrice,
        'Selling Price': p.sellingPrice,
        'Margin': p.sellingPrice - p.basePrice,
        'Stock': p.quantityInStock,
        'Units Sold': p.unitsSold,
        'Profit': (p.sellingPrice - p.basePrice) * p.unitsSold,
        'Supplier': p.supplierName || '',
        'Expiry Date': p.expiryDate || '',
        'Last Updated': p.updatedAt
      }));
      
      const csv = toCSV(csvData);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `protein-store-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({ title: 'Export Successful', description: 'CSV file downloaded' });
    } catch (error) {
      toast({
        title: 'Export Error',
        description: 'Failed to export data',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Protein Store</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your supplement inventory and sales</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handlePrintData} variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print Data
          </Button>
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {user?.role === 'owner' && (
            <Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalProducts}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Active products</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalStock}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Units in inventory</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">From protein sales</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{totalProfit.toLocaleString()}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Net profit margin</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || nearExpiryProducts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lowStockProducts.length > 0 && (
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-800 dark:text-red-200">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Low Stock Alert</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex justify-between items-center">
                      <span className="text-red-700 dark:text-red-300">{product.name}</span>
                      <Badge variant="destructive">{product.quantityInStock} left</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {nearExpiryProducts.length > 0 && (
            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                  <Calendar className="h-5 w-5" />
                  <span>Expiry Alert</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {nearExpiryProducts.map((product) => {
                    const expiry = new Date(product.expiryDate!);
                    const today = new Date();
                    const diffTime = expiry.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={product.id} className="flex justify-between items-center">
                        <span className="text-yellow-700 dark:text-yellow-300">{product.name}</span>
                        <Badge variant="secondary">{diffDays} days left</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>{editingProtein ? 'Edit Product' : 'Add New Product'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Whey Protein 1kg"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="supplierName">Supplier Name</Label>
                  <Input
                    id="supplierName"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label htmlFor="basePrice">Base Price (Cost) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="1500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sellingPrice">Selling Price *</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="2000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantityInStock">Quantity in Stock *</Label>
                  <Input
                    id="quantityInStock"
                    type="number"
                    value={formData.quantityInStock}
                    onChange={(e) => setFormData({ ...formData, quantityInStock: e.target.value })}
                    placeholder="50"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingProtein ? 'Update Product' : 'Add Product'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProtein(null);
                    setFormData({
                      name: '',
                      basePrice: '',
                      sellingPrice: '',
                      quantityInStock: '',
                      supplierName: '',
                      expiryDate: ''
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {proteins.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Products</h3>
              <p className="text-gray-600 dark:text-gray-400">Add your first protein product to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Cost Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Selling Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Margin</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Units Sold</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Profit</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proteins.map((protein) => {
                    const margin = protein.sellingPrice - protein.basePrice;
                    const profit = margin * protein.unitsSold;
                    const isLowStock = protein.quantityInStock < 5;
                    
                    return (
                      <tr key={protein.id} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{protein.name}</div>
                            {protein.supplierName && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">{protein.supplierName}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">₹{protein.basePrice}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">₹{protein.sellingPrice}</td>
                        <td className="py-3 px-4 text-green-600 dark:text-green-400">₹{margin}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={isLowStock ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}>
                              {protein.quantityInStock}
                            </span>
                            {isLowStock && <Badge variant="destructive" className="text-xs">Low</Badge>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{protein.unitsSold}</td>
                        <td className="py-3 px-4 text-green-600 dark:text-green-400">₹{profit}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSaleModal(protein.id)}
                              disabled={protein.quantityInStock === 0}
                            >
                              <ShoppingCart className="h-3 w-3" />
                            </Button>
                            {user?.role === 'owner' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(protein)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(protein.id, protein.name)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sale Modal */}
      {saleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Record Sale</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSale} className="space-y-4">
                <div>
                  <Label htmlFor="unitsSold">Units Sold</Label>
                  <Input
                    id="unitsSold"
                    type="number"
                    value={saleData.unitsSold}
                    onChange={(e) => setSaleData({ unitsSold: e.target.value })}
                    placeholder="Enter quantity"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Record Sale
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setSaleModal(null);
                      setSaleData({ unitsSold: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProteinStore;
