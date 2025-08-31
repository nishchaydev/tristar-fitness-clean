const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory storage (replace with database)
let invoices = [
  {
    id: 'INV-001',
    memberId: '1',
    memberName: 'Amit Kumar',
    amount: 1299,
    description: 'Monthly membership renewal',
    dueDate: '2024-02-15',
    status: 'pending',
    createdAt: '2024-01-15T10:00:00Z',
    items: [
      {
        id: '1',
        description: 'Monthly Membership',
        quantity: 1,
        price: 999,
        total: 999
      }
    ],
    subtotal: 999,
    tax: 180,
    total: 1179
  }
];

// Get all invoices
router.get('/', (req, res) => {
  try {
    const { status, memberId } = req.query;
    let filteredInvoices = [...invoices];

    if (status) {
      filteredInvoices = filteredInvoices.filter(inv => inv.status === status);
    }

    if (memberId) {
      filteredInvoices = filteredInvoices.filter(inv => inv.memberId === memberId);
    }

    res.json({
      success: true,
      data: filteredInvoices,
      count: filteredInvoices.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get invoice by ID
router.get('/:id', (req, res) => {
  try {
    const invoice = invoices.find(inv => inv.id === req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Create new invoice
router.post('/', [
  body('memberId').notEmpty().withMessage('Member ID is required'),
  body('memberName').notEmpty().withMessage('Member name is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('items').isArray().withMessage('Items must be an array')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { memberId, memberName, amount, items, dueDate, description } = req.body;
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;

    const newInvoice = {
      id: `INV-${Date.now()}`,
      memberId,
      memberName,
      amount: total,
      description: description || `Invoice for ${memberName}`,
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      createdAt: new Date().toISOString(),
      items,
      subtotal,
      tax,
      total
    };

    invoices.push(newInvoice);

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: newInvoice
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Update invoice status
router.put('/:id/status', [
  body('status').isIn(['pending', 'paid', 'overdue']).withMessage('Invalid status')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const invoiceIndex = invoices.findIndex(inv => inv.id === req.params.id);
    if (invoiceIndex === -1) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    invoices[invoiceIndex].status = req.body.status;
    invoices[invoiceIndex].updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Invoice status updated successfully',
      data: invoices[invoiceIndex]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
});

// Delete invoice
router.delete('/:id', (req, res) => {
  try {
    const invoiceIndex = invoices.findIndex(inv => inv.id === req.params.id);
    if (invoiceIndex === -1) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const deletedInvoice = invoices.splice(invoiceIndex, 1)[0];

    res.json({
      success: true,
      message: 'Invoice deleted successfully',
      data: deletedInvoice
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

// Get invoice statistics
router.get('/stats/summary', (req, res) => {
  try {
    const totalInvoices = invoices.length;
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
    
    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    const pendingAmount = invoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.total, 0);

    res.json({
      success: true,
      data: {
        totalInvoices,
        pendingInvoices,
        paidInvoices,
        overdueInvoices,
        totalRevenue,
        pendingAmount
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice statistics' });
  }
});

module.exports = router;

