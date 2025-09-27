const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  getMembers: () => ipcRenderer.invoke('db-get-members'),
  addMember: (member) => ipcRenderer.invoke('db-add-member', member),
  updateMember: (id, member) => ipcRenderer.invoke('db-update-member', id, member),
  deleteMember: (id) => ipcRenderer.invoke('db-delete-member', id),
  
  getVisitors: () => ipcRenderer.invoke('db-get-visitors'),
  addVisitor: (visitor) => ipcRenderer.invoke('db-add-visitor', visitor),
  
  getPayments: () => ipcRenderer.invoke('db-get-payments'),
  addPayment: (payment) => ipcRenderer.invoke('db-add-payment', payment),
  
  getInvoices: () => ipcRenderer.invoke('db-get-invoices'),
  addInvoice: (invoice) => ipcRenderer.invoke('db-add-invoice', invoice),
  
  getAnalytics: () => ipcRenderer.invoke('db-get-analytics'),
  
  // Database management
  getDatabasePath: () => ipcRenderer.invoke('db-get-database-path'),
  exportDatabase: () => ipcRenderer.invoke('db-export-database'),
  exportCSV: (table) => ipcRenderer.invoke('db-export-csv', table),
  
  // Menu events
  onMenuAbout: (callback) => ipcRenderer.on('menu-about', callback),
  onMenuDatabaseSettings: (callback) => ipcRenderer.on('menu-database-settings', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
