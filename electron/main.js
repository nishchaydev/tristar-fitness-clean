const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const Database = require('./db');

let mainWindow;
let database;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/tristar-logo.jpg'),
    titleBarStyle: 'default',
    show: false,
    title: 'TriStar Fitness - Gym Management System'
  });

  // Load the app from local dist folder
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Create application menu
  const template = [
    {
      label: 'TriStar Fitness',
      submenu: [
        {
          label: 'About TriStar Fitness',
          click: () => {
            mainWindow.webContents.send('menu-about');
          }
        },
        { type: 'separator' },
        {
          label: 'Database Settings',
          click: () => {
            mainWindow.webContents.send('menu-database-settings');
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: 'Toggle Fullscreen',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    },
    {
      label: 'Database',
      submenu: [
        {
          label: 'Export Database',
          click: async () => {
            try {
              const exportPath = await database.exportDatabase();
              shell.showItemInFolder(exportPath);
            } catch (error) {
              console.error('Export failed:', error);
            }
          }
        },
        {
          label: 'Export Members CSV',
          click: async () => {
            try {
              const csv = await database.exportCSV('members');
              // Save CSV file
              const fs = require('fs');
              const csvPath = path.join(path.dirname(database.dbPath), `members_export_${Date.now()}.csv`);
              fs.writeFileSync(csvPath, csv);
              shell.showItemInFolder(csvPath);
            } catch (error) {
              console.error('CSV export failed:', error);
            }
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => {
            shell.openExternal('https://github.com/nishchaydev/tristar-fitness-clean');
          }
        },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/nishchaydev/tristar-fitness-clean/issues');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Initialize database
async function initializeDatabase() {
  try {
    database = new Database();
    await database.initialize();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// IPC handlers for database operations
ipcMain.handle('db-get-members', async () => {
  try {
    return await database.getMembers();
  } catch (error) {
    console.error('Error getting members:', error);
    return [];
  }
});

ipcMain.handle('db-add-member', async (event, member) => {
  try {
    return await database.addMember(member);
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
});

ipcMain.handle('db-update-member', async (event, id, member) => {
  try {
    return await database.updateMember(id, member);
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
});

ipcMain.handle('db-delete-member', async (event, id) => {
  try {
    return await database.deleteMember(id);
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
});

ipcMain.handle('db-get-visitors', async () => {
  try {
    return await database.getVisitors();
  } catch (error) {
    console.error('Error getting visitors:', error);
    return [];
  }
});

ipcMain.handle('db-add-visitor', async (event, visitor) => {
  try {
    return await database.addVisitor(visitor);
  } catch (error) {
    console.error('Error adding visitor:', error);
    throw error;
  }
});

ipcMain.handle('db-get-payments', async () => {
  try {
    return await database.getPayments();
  } catch (error) {
    console.error('Error getting payments:', error);
    return [];
  }
});

ipcMain.handle('db-add-payment', async (event, payment) => {
  try {
    return await database.addPayment(payment);
  } catch (error) {
    console.error('Error adding payment:', error);
    throw error;
  }
});

ipcMain.handle('db-get-invoices', async () => {
  try {
    return await database.getInvoices();
  } catch (error) {
    console.error('Error getting invoices:', error);
    return [];
  }
});

ipcMain.handle('db-add-invoice', async (event, invoice) => {
  try {
    return await database.addInvoice(invoice);
  } catch (error) {
    console.error('Error adding invoice:', error);
    throw error;
  }
});

ipcMain.handle('db-get-analytics', async () => {
  try {
    return await database.getAnalytics();
  } catch (error) {
    console.error('Error getting analytics:', error);
    return {};
  }
});

ipcMain.handle('db-get-database-path', () => {
  return database.dbPath;
});

ipcMain.handle('db-export-database', async () => {
  try {
    return await database.exportDatabase();
  } catch (error) {
    console.error('Error exporting database:', error);
    throw error;
  }
});

ipcMain.handle('db-export-csv', async (event, table) => {
  try {
    return await database.exportCSV(table);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
});

// App event listeners
app.whenReady().then(async () => {
  await initializeDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (database) {
    database.close();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

module.exports = { mainWindow, database };