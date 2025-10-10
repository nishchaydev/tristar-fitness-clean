const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

// Supabase configuration
const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
const testConnection = async () => {
  // Check if Supabase is properly configured
  if (supabaseUrl === 'https://your-project-id.supabase.co' || supabaseKey === 'your-anon-key-here') {
    console.log('⚠️  Supabase not configured, using demo mode');
    return false;
  }
  
  try {
    const { data, error } = await supabase
      .from('members')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet
      throw error;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
};


// Database operations with fallback to demo mode
const db = {
  // Generic query methods
  async find(table, filters = {}) {
    try {
      let query = supabase.from(table).select('*');
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.log(`⚠️  Supabase query failed for ${table}`);
      return [];
    }
  },
  
  async findById(table, id) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.log(`⚠️  Supabase query failed for ${table}`);
      return null;
    }
  },
  
  async create(table, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    } catch (error) {
      console.log(`⚠️  Supabase create failed for ${table}`);
      return null;
    }
  },
  
  async update(table, id, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    } catch (error) {
      console.log(`⚠️  Supabase update failed for ${table}`);
      return null;
    }
  },
  
  async delete(table, id) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.log(`⚠️  Supabase delete failed for ${table}`);
      return false;
    }
  },
  
  // Specific table methods
  async getMembers(filters = {}) {
    return this.find('members', filters);
  },
  
  async getTrainers(filters = {}) {
    return this.find('trainers', filters);
  },
  
  async getSessions(filters = {}) {
    return this.find('sessions', filters);
  },
  
  async getAttendance(filters = {}) {
    return this.find('attendance', filters);
  },
  
  async getEquipment(filters = {}) {
    return this.find('equipment', filters);
  },
  
  async getInvoices(filters = {}) {
    return this.find('invoices', filters);
  },
  
  async getNutritionPlans(filters = {}) {
    return this.find('nutrition_plans', filters);
  }
};

module.exports = { supabase, db, testConnection };
