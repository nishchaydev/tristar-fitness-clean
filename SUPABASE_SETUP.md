# 🚀 Supabase Setup & Deployment Guide

## ✅ **Issues Fixed**

### 1. **HTML Export Issue** ✅
- **Problem**: Downloaded HTML files showed corrupted content
- **Fix**: Improved HTML content generation with proper encoding and structure
- **Result**: Clean, properly formatted HTML exports

### 2. **Data Persistence Issue** ✅
- **Problem**: Data only saved locally, reverted to default on logout/login
- **Fix**: Created Supabase integration for proper data persistence
- **Result**: Data now syncs with Supabase database

## 🔧 **Supabase Setup Instructions**

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `tristar-fitness`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you
6. Click "Create new project"

### Step 2: Get Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### Step 3: Configure Environment Variables

1. Create a `.env` file in your project root:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration
VITE_API_URL=http://localhost:5000
```

2. Replace the placeholder values with your actual Supabase credentials

### Step 4: Create Database Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Members table
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  membership_type VARCHAR(20) CHECK (membership_type IN ('monthly', 'quarterly', 'annual')) NOT NULL,
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('active', 'expired', 'pending')) DEFAULT 'active',
  last_visit TIMESTAMP,
  total_visits INTEGER DEFAULT 0,
  assigned_trainer UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trainers table
CREATE TABLE trainers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  specialization VARCHAR(255) NOT NULL,
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  status VARCHAR(20) CHECK (status IN ('available', 'busy', 'offline')) DEFAULT 'available',
  current_sessions INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  join_date DATE NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID REFERENCES trainers(id),
  trainer_name VARCHAR(255) NOT NULL,
  member_name VARCHAR(255) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  type VARCHAR(20) CHECK (type IN ('personal', 'group', 'consultation')) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Visitors table
CREATE TABLE visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  check_in_time TIMESTAMP NOT NULL,
  check_out_time TIMESTAMP,
  purpose VARCHAR(500) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('checked-in', 'checked-out')) DEFAULT 'checked-in',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id),
  member_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Follow-ups table
CREATE TABLE follow_ups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id),
  member_name VARCHAR(255) NOT NULL,
  type VARCHAR(30) CHECK (type IN ('membership_expiry', 'payment_reminder', 'visit_reminder')) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'snoozed')) DEFAULT 'pending',
  due_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
CREATE POLICY "Allow public access to members" ON members FOR ALL USING (true);
CREATE POLICY "Allow public access to trainers" ON trainers FOR ALL USING (true);
CREATE POLICY "Allow public access to sessions" ON sessions FOR ALL USING (true);
CREATE POLICY "Allow public access to visitors" ON visitors FOR ALL USING (true);
CREATE POLICY "Allow public access to invoices" ON invoices FOR ALL USING (true);
CREATE POLICY "Allow public access to follow_ups" ON follow_ups FOR ALL USING (true);
```

### Step 5: Test the Setup

1. Start the development server:
```bash
npm run dev
```

2. Open the application and test:
   - Add a new member
   - Edit member details
   - Logout and login again
   - Check if data persists

## 🚀 **Deployment Options**

### Option 1: GitHub Pages (Current)
Your app is already deployed at: `https://nishchaydev.github.io/tristar-fitness-clean/`

### Option 2: Netlify (Recommended for Supabase)
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Connect your GitHub repository
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Add environment variables in Netlify dashboard

### Option 3: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Add environment variables in Vercel dashboard

## 🔍 **Testing Checklist**

After setup, test these features:

- ✅ **Profile Updates**: Change Nikhil's name - should persist
- ✅ **Data Export**: HTML downloads should work properly
- ✅ **Data Persistence**: Add members/trainers - should sync with Supabase
- ✅ **Dark Mode**: Navigation should stay dark
- ✅ **Mobile Responsiveness**: Should work on phones
- ✅ **Trainer Management**: Edit trainer details should work

## 🛠️ **Troubleshooting**

### If Supabase connection fails:
1. Check your environment variables
2. Verify Supabase project is active
3. Check browser console for errors
4. Ensure RLS policies are set correctly

### If data doesn't persist:
1. Check Supabase dashboard for data
2. Verify table structure matches
3. Check browser console for sync errors

### If HTML export still has issues:
1. Clear browser cache
2. Check browser console for errors
3. Try different browser

## 📞 **Support**

If you encounter issues:
1. Check the browser console for errors
2. Verify Supabase configuration
3. Test with a fresh browser session
4. Check if Supabase project is active

Your application should now have proper data persistence and working HTML exports! 🎉
