# Supabase CLI Setup Guide

## Step-by-Step Instructions

### 1. Login to Supabase
```bash
supabase login
```
This will open your browser to authenticate with Supabase.

### 2. Get Your Project Reference
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → General**
4. Copy the **Reference ID** (e.g., `tednluwflfhxyucgwigh`)

### 3. Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```
Replace `YOUR_PROJECT_REF` with your actual project reference ID.

### 4. Pull Current Configuration
```bash
supabase db pull
```
This will sync your local schema with the remote database.

### 5. Generate TypeScript Types
```bash
supabase gen types typescript --local > src/lib/database.types.ts
```

### 6. Set Up Environment Variables
The CLI will automatically create a `.env.local` file with the correct API keys.

### 7. Test Connection
```bash
supabase status
```

## Troubleshooting

### If linking fails:
1. Make sure you're logged in: `supabase login`
2. Verify your project reference ID
3. Check that you have access to the project

### If you get permission errors:
1. Make sure you're the project owner or have admin access
2. Try logging out and back in: `supabase logout && supabase login`

## Benefits of CLI Approach

✅ **Automatic API key management**
✅ **Database schema synchronization**
✅ **TypeScript type generation**
✅ **Migration management**
✅ **Local development environment**
✅ **Production deployment tools**

## Next Steps

After linking:
1. Your API keys will be automatically configured
2. Database schema will be synced
3. You can run `supabase status` to verify everything is working
4. Start your development server: `npm run dev` 