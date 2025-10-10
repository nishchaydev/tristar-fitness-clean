const express = require('express');
const { body, validationResult } = require('express-validator');
const Protein = require('../models/Protein');
const { authenticateToken, requireOwner } = require('../middleware/roleAuth');
const { syncSectionToJSON } = require('../utils/syncToJSON');

const router = express.Router();
const proteinModel = new Protein();

// Validation middleware
const validateProtein = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('base_price').isNumeric().withMessage('Base price must be a number'),
  body('selling_price').isNumeric().withMessage('Selling price must be a number'),
  body('quantity_in_stock').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('supplier_name').optional().isString(),
  body('expiry_date').optional().isISO8601().withMessage('Expiry date must be a valid date')
];

const validateSale = [
  body('units_sold').isInt({ min: 1 }).withMessage('Units sold must be a positive integer')
];

// Get low stock products
router.get('/low-stock', authenticateToken, async (req, res) => {
  try {
    const lowStockProducts = await proteinModel.getLowStock();
    res.json(lowStockProducts);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

// Get products near expiry
router.get('/expiry', authenticateToken, async (req, res) => {
  try {
    const nearExpiryProducts = await proteinModel.getNearExpiry();
    res.json(nearExpiryProducts);
  } catch (error) {
    console.error('Error fetching near expiry products:', error);
    res.status(500).json({ error: 'Failed to fetch near expiry products' });
  }
});

// Get total protein revenue
router.get('/revenue/total', authenticateToken, async (req, res) => {
  try {
    const revenue = await proteinModel.getTotalRevenue();
    res.json(revenue);
  } catch (error) {
    console.error('Error fetching protein revenue:', error);
    res.status(500).json({ error: 'Failed to fetch protein revenue' });
  }
});

// Get all protein products
router.get('/', authenticateToken, async (req, res) => {
  try {
    const proteins = await proteinModel.getAll();
    res.json(proteins);
  } catch (error) {
    console.error('Error fetching proteins:', error);
    res.status(500).json({ error: 'Failed to fetch protein products' });
  }
});

// Get protein by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const protein = await proteinModel.getById(id);
    
    if (!protein) {
      return res.status(404).json({ error: 'Protein product not found' });
    }
    
    res.json(protein);
  } catch (error) {
    console.error('Error fetching protein:', error);
    res.status(500).json({ error: 'Failed to fetch protein product' });
  }
});

// Create new protein product (Owner only)
router.post('/', authenticateToken, requireOwner, validateProtein, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, base_price, selling_price, quantity_in_stock, supplier_name, expiry_date } = req.body;

    // Validate that selling price is higher than base price
    if (selling_price <= base_price) {
      return res.status(400).json({ error: 'Selling price must be higher than base price' });
    }

    const protein = await proteinModel.create({
      name,
      base_price: parseFloat(base_price),
      selling_price: parseFloat(selling_price),
      quantity_in_stock: parseInt(quantity_in_stock),
      supplier_name,
      expiry_date
    });

    // Sync to JSON
    await syncSectionToJSON('proteins', req.app.locals.db, req.app.locals.dataStore);

    res.status(201).json(protein);
  } catch (error) {
    console.error('Error creating protein:', error);
    res.status(500).json({ error: 'Failed to create protein product' });
  }
});

// Update protein product (Owner only)
router.put('/:id', authenticateToken, requireOwner, validateProtein, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, base_price, selling_price, quantity_in_stock, supplier_name, expiry_date } = req.body;

    // Validate that selling price is higher than base price
    if (selling_price <= base_price) {
      return res.status(400).json({ error: 'Selling price must be higher than base price' });
    }

    const protein = await proteinModel.update(id, {
      name,
      base_price: parseFloat(base_price),
      selling_price: parseFloat(selling_price),
      quantity_in_stock: parseInt(quantity_in_stock),
      supplier_name,
      expiry_date
    });

    // Sync to JSON
    await syncSectionToJSON('proteins', req.app.locals.db, req.app.locals.dataStore);

    res.json(protein);
  } catch (error) {
    console.error('Error updating protein:', error);
    res.status(500).json({ error: 'Failed to update protein product' });
  }
});

// Record a sale
router.post('/:id/sale', authenticateToken, validateSale, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { units_sold } = req.body;

    const result = await proteinModel.recordSale(id, parseInt(units_sold));

    // Sync to JSON
    await syncSectionToJSON('proteins', req.app.locals.db, req.app.locals.dataStore);

    res.json({ message: 'Sale recorded successfully', ...result });
  } catch (error) {
    console.error('Error recording sale:', error);
    if (error.message === 'Insufficient stock or product not found') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to record sale' });
    }
  }
});

// Delete protein product (Owner only)
router.delete('/:id', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await proteinModel.delete(id);

    if (!result.deleted) {
      return res.status(404).json({ error: 'Protein product not found' });
    }

    // Sync to JSON
    await syncSectionToJSON('proteins', req.app.locals.db, req.app.locals.dataStore);

    res.json({ message: 'Protein product deleted successfully' });
  } catch (error) {
    console.error('Error deleting protein:', error);
    res.status(500).json({ error: 'Failed to delete protein product' });
  }
});

module.exports = router;