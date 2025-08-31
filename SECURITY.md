# Security Guidelines for TriStar Fitness

## 🔒 **Critical Security Notes**

### **BEFORE DEPLOYING TO PRODUCTION:**

1. **Change ALL default passwords:**
   - Demo password: `demo123` → Use strong, unique passwords
   - JWT secret: `change-this-in-production` → Generate cryptographically secure secret

2. **Environment Variables:**
   - Copy `backend/env.example` to `backend/.env`
   - Fill in your actual values
   - NEVER commit `.env` files to Git

3. **Database Security:**
   - Configure Supabase with proper authentication
   - Enable Row Level Security (RLS)
   - Use environment variables for database credentials

4. **Authentication:**
   - Enable proper JWT verification in production
   - Implement password hashing with bcrypt
   - Add rate limiting for login attempts

5. **API Security:**
   - Enable CORS restrictions for production domains
   - Implement proper input validation
   - Add request size limits

## 🚨 **Current Demo Mode Limitations:**

- **Weak Authentication**: Accepts any token > 10 characters
- **Hardcoded Secrets**: Uses placeholder values
- **No Password Hashing**: Passwords stored in plain text
- **Demo Data**: Contains sample user information

## ✅ **Security Checklist:**

- [ ] Change default passwords
- [ ] Generate secure JWT secret
- [ ] Configure environment variables
- [ ] Enable proper JWT verification
- [ ] Implement password hashing
- [ ] Configure CORS for production
- [ ] Enable rate limiting
- [ ] Set up proper logging
- [ ] Configure Supabase security
- [ ] Remove demo data

## 🔐 **Recommended Security Practices:**

1. **Use HTTPS in production**
2. **Implement 2FA for admin accounts**
3. **Regular security audits**
4. **Keep dependencies updated**
5. **Monitor for suspicious activity**
6. **Backup data regularly**
7. **Use security headers (Helmet.js)**
8. **Implement proper error handling**

## 📞 **Security Contact:**

If you discover a security vulnerability, please report it immediately.

