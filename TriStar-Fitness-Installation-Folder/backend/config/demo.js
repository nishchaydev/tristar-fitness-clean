// Demo mode configuration for testing without external database
const demoData = {
  members: [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      membershipType: 'premium',
      membershipExpiry: '2024-12-31',
      status: 'active',
      assignedTrainer: '1',
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1234567891',
        relationship: 'Spouse'
      },
      medicalConditions: [],
      goals: ['Weight Loss', 'Muscle Gain'],
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  ],
  trainers: [
    {
      id: '1',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike@example.com',
      phone: '+1234567892',
      specialization: 'Strength Training',
      certifications: ['NASM', 'ACE'],
      experience: 5,
      hourlyRate: 50,
      status: 'active',
      rating: 4.8,
      clientCount: 15,
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  ],
  sessions: [
    {
      id: '1',
      type: 'Personal Training',
      trainerId: '1',
      date: '2024-01-15',
      startTime: '09:00',
      endTime: '10:00',
      capacity: 1,
      price: 50,
      status: 'scheduled',
      attendees: ['1'],
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  ],
  invoices: [
    {
      id: '1',
      invoiceNumber: 'INV-001',
      memberId: '1',
      items: [
        { description: 'Premium Membership', quantity: 1, unitPrice: 99.99, total: 99.99 }
      ],
      subtotal: 99.99,
      tax: 9.99,
      totalAmount: 109.98,
      status: 'paid',
      dueDate: '2025-01-31',
      paymentMethod: 'credit_card',
      createdAt: '2025-01-01T00:00:00.000Z'
    }
  ]
};

// Demo database operations
const demoDB = {
  async find(table, filters = {}) {
    let data = demoData[table] || [];
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      data = data.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          if (value === undefined || value === null) return true;
          return item[key] === value;
        });
      });
    }
    
    return data;
  },
  
  async findById(table, id) {
    const data = demoData[table] || [];
    return data.find(item => item.id === id) || null;
  },
  
  async create(table, data) {
    const newId = (demoData[table]?.length || 0) + 1;
    const newItem = {
      ...data,
      id: newId.toString(),
      createdAt: new Date().toISOString()
    };
    
    if (!demoData[table]) demoData[table] = [];
    demoData[table].push(newItem);
    
    return newItem;
  },
  
  async update(table, id, data) {
    const index = demoData[table]?.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');
    
    demoData[table][index] = {
      ...demoData[table][index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return demoData[table][index];
  },
  
  async delete(table, id) {
    const index = demoData[table]?.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');
    
    demoData[table].splice(index, 1);
    return true;
  }
};

module.exports = { demoDB, demoData };

