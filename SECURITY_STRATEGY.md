# Empathy Ledger - Security Strategy

## 🔒 Environment Security

### File Permissions
- **Development**: `.env.local` (600 - owner-only)
- **Template**: `.env.example` (644 - readable)
- **Backups**: `.env.local.backup.*` (600 - secure)

### Git Protection
```gitignore
# Environment files
.env*
!.env.example
.env.local
.env.production
.env.staging
```

### API Key Management
- **Source**: Supabase CLI (fresh keys)
- **Rotation**: Via CLI commands
- **Validation**: Format checking + connection testing
- **Storage**: Environment variables only

## 🛡️ Supabase Access Strategy

### Development
1. **CLI Authentication**: `supabase login`
2. **Project Linking**: `supabase link --project-ref PROJECT_ID`
3. **Key Retrieval**: `supabase projects api-keys`
4. **Environment Update**: Automated scripts
5. **Connection Testing**: Health endpoints

### Production
1. **Hosting Platform**: Environment variables in Vercel/Netlify
2. **Key Rotation**: Manual via Supabase dashboard
3. **Monitoring**: Health checks and error tracking
4. **Backup**: Multiple environment configurations

### Security Layers
1. **Network**: HTTPS only
2. **Authentication**: Supabase Auth
3. **Authorization**: Row Level Security (RLS)
4. **API Keys**: Different keys for different environments
5. **Monitoring**: Error tracking and health checks

## 🔧 Maintenance Procedures

### Monthly Security Tasks
- [ ] Rotate API keys
- [ ] Update dependencies
- [ ] Review access logs
- [ ] Test backup procedures

### Quarterly Security Review
- [ ] Audit environment files
- [ ] Review API key permissions
- [ ] Update security documentation
- [ ] Test disaster recovery

## 🚨 Emergency Procedures

### If API Keys Are Compromised
1. **Immediate**: Rotate keys in Supabase dashboard
2. **Update**: Run `./scripts/setup-supabase-keys.sh`
3. **Deploy**: Update production environment variables
4. **Monitor**: Check for unauthorized access

### If Environment Files Are Exposed
1. **Immediate**: Revoke all API keys
2. **Generate**: New keys from Supabase CLI
3. **Update**: All environment files
4. **Audit**: Check for unauthorized commits

## 📋 Security Checklist

### Development Setup
- [ ] `.env.local` has 600 permissions
- [ ] `.gitignore` excludes environment files
- [ ] API keys are fresh from Supabase CLI
- [ ] Connection tests pass
- [ ] TypeScript types are generated

### Production Setup
- [ ] Environment variables in hosting platform
- [ ] Different API keys for production
- [ ] Health monitoring enabled
- [ ] Error tracking configured
- [ ] Backup procedures tested 