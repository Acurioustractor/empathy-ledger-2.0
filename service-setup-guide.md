# 🚀 EMPATHY LEDGER - SERVICE SETUP GUIDE

This guide walks you through setting up each external service for your Empathy Ledger platform.

## 🔴 **TIER 1: PRODUCTION CRITICAL**

### 📧 **1. Email Service - Resend (Recommended)**

**Why Resend?** Modern, reliable, developer-friendly, great deliverability

**Setup Steps:**

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email domain (or use their free domain for testing)
3. Generate API key in dashboard
4. Add to `.env.local`:
   ```bash
   RESEND_API_KEY=re_YourAPIKey_Here
   ```

**Free Tier:** 3,000 emails/month, 100 emails/day
**Paid Plans:** Start at $20/month for 50,000 emails

---

### 🖼️ **2. Media Processing - Cloudinary**

**Why Cloudinary?** Complete media platform with image/video optimization, transformations, CDN

**Setup Steps:**

1. Go to [cloudinary.com](https://cloudinary.com) and sign up
2. Get your credentials from the dashboard
3. Add to `.env.local`:
   ```bash
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=YourSecretKey
   ```

**Free Tier:** 25GB storage, 25GB bandwidth/month
**Paid Plans:** Start at $89/month for 100GB

---

### 🌐 **3. Domain & SSL - Cloudflare**

**Why Cloudflare?** Free SSL, CDN, DNS management, DDoS protection

**Setup Steps:**

1. Go to [cloudflare.com](https://cloudflare.com) and sign up
2. Add your domain and update nameservers
3. Generate API token with Zone permissions
4. Add to `.env.local`:
   ```bash
   CLOUDFLARE_API_TOKEN=your-api-token
   CLOUDFLARE_ZONE_ID=your-zone-id
   ```

**Free Tier:** SSL, CDN, basic DDoS protection
**Pro Plans:** $20/month for advanced features

---

## 🟡 **TIER 2: FEATURE ENHANCERS**

### 💳 **4. Payment Processing - Stripe**

**Why Stripe?** Most flexible payment platform, excellent for marketplaces, great developer tools

**Setup Steps:**

1. Go to [stripe.com](https://stripe.com) and create account
2. Complete business verification
3. Get API keys from dashboard
4. Add to `.env.local`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_YourSecretKey
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YourPublishableKey
   STRIPE_WEBHOOK_SECRET=whsec_YourWebhookSecret
   ```

**Fees:** 2.9% + $0.30 per transaction
**No monthly fees**

---

### 🔍 **5. Search & Discovery - Algolia**

**Why Algolia?** Instant search, excellent for story discovery, faceted search

**Setup Steps:**

1. Go to [algolia.com](https://algolia.com) and sign up
2. Create a new application
3. Get API keys from dashboard
4. Add to `.env.local`:
   ```bash
   ALGOLIA_APPLICATION_ID=YourAppID
   ALGOLIA_API_KEY=YourAdminAPIKey
   ALGOLIA_SEARCH_KEY=YourSearchOnlyKey
   ```

**Free Tier:** 10,000 records, 10,000 searches/month
**Paid Plans:** Start at $50/month

---

### 🛡️ **6. Content Moderation - OpenAI + Perspective**

**OpenAI Moderation API**

1. Go to [platform.openai.com](https://platform.openai.com)
2. Generate API key
3. Add to `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-YourOpenAIKey
   ```

**Google Perspective API**

1. Go to [perspectiveapi.com](https://perspectiveapi.com)
2. Get API key through Google Cloud Console
3. Add to `.env.local`:
   ```bash
   PERSPECTIVE_API_KEY=YourPerspectiveKey
   ```

---

## 🟢 **TIER 3: MONITORING & OPTIMIZATION**

### 📊 **7. Analytics - PostHog**

**Why PostHog?** Privacy-first analytics, self-hostable, feature flags

**Setup Steps:**

1. Go to [posthog.com](https://posthog.com) and sign up
2. Get project API key
3. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_POSTHOG_KEY=phc_YourProjectKey
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

**Free Tier:** 1M events/month
**Paid Plans:** $0.00031 per event after 1M

---

### 🚨 **8. Error Tracking - Sentry**

**Why Sentry?** Best error tracking, performance monitoring, release tracking

**Setup Steps:**

1. Go to [sentry.io](https://sentry.io) and sign up
2. Create a new project for Next.js
3. Get DSN from project settings
4. Add to `.env.local`:
   ```bash
   SENTRY_DSN=https://your-dsn@sentry.io/project-id
   SENTRY_ORG=your-org-slug
   SENTRY_PROJECT=your-project-slug
   ```

**Free Tier:** 5,000 errors/month
**Paid Plans:** Start at $26/month

---

### ☁️ **9. Backup Storage - AWS S3**

**Why AWS S3?** Reliable, scalable, integrates with everything

**Setup Steps:**

1. Create AWS account at [aws.amazon.com](https://aws.amazon.com)
2. Create S3 bucket for backups
3. Create IAM user with S3 permissions
4. Add to `.env.local`:
   ```bash
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=us-west-2
   AWS_S3_BUCKET=empathy-ledger-backups
   ```

**Pricing:** $0.023 per GB/month for standard storage

---

## 🎯 **QUICK START: ESSENTIAL SERVICES**

### **For Immediate Development:**

1. **Resend** - Email (free tier)
2. **Cloudinary** - Media (free tier)
3. **Cloudflare** - Domains (free tier)

### **Commands to Update Environment:**

```bash
# Copy the new comprehensive template
cp env-secure-template.txt .env.local

# Set secure permissions
chmod 600 .env.local

# Run security check
node scripts/env-security-check.js
```

### **Testing Your Setup:**

```bash
# Test email
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json"

# Test Cloudinary
curl "https://api.cloudinary.com/v1_1/$CLOUDINARY_CLOUD_NAME/image/list" \
  -u "$CLOUDINARY_API_KEY:$CLOUDINARY_API_SECRET"

# Test Stripe
curl https://api.stripe.com/v1/customers \
  -u $STRIPE_SECRET_KEY:
```

---

## 💰 **COST BREAKDOWN**

### **Development (Free Tiers):**

- **Total: $0/month**
- All services have generous free tiers for development

### **Small Production (1,000 users):**

- Email: $20/month (Resend)
- Media: $0/month (Cloudinary free tier)
- Domains: $0/month (Cloudflare free)
- Search: $0/month (Algolia free tier)
- **Total: ~$20/month**

### **Medium Production (10,000 users):**

- Email: $20/month
- Media: $89/month (Cloudinary)
- Domains: $20/month (Cloudflare Pro)
- Search: $50/month (Algolia)
- Analytics: $25/month (PostHog)
- Monitoring: $26/month (Sentry)
- **Total: ~$230/month**

---

## 🔒 **SECURITY REMINDERS**

1. **Never commit API keys** to version control
2. **Use different keys** for development vs production
3. **Rotate keys regularly** (quarterly for production)
4. **Set up billing alerts** to avoid surprise charges
5. **Use least privilege** for API permissions
6. **Monitor usage** to detect unusual activity

---

## 🆘 **NEED HELP?**

### **Service-Specific Support:**

- **Resend**: [resend.com/docs](https://resend.com/docs)
- **Cloudinary**: [cloudinary.com/documentation](https://cloudinary.com/documentation)
- **Stripe**: [stripe.com/docs](https://stripe.com/docs)
- **Algolia**: [algolia.com/doc](https://algolia.com/doc)

### **Integration Issues:**

Check the platform's error logs and ensure:

1. API keys are correctly formatted
2. Services are properly configured
3. Rate limits aren't exceeded
4. Required permissions are granted
