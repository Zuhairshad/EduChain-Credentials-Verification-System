# Cloudinary Setup for Transcript Upload

## 1. Create Free Cloudinary Account
Visit [cloudinary.com](https://cloudinary.com) and sign up

## 2. Get Your Credentials
After sign up, go to Dashboard → Settings → Account

You'll need:
- **Cloud Name**
- **API Key** 
- **API Secret**

## 3. Create Upload Preset
1. Go to Settings → Upload
2. Click "Add upload preset"
3. Name it: `transcripts`
4. Set:
   - Signing Mode: **Unsigned**
   - Folder: `lgu-credentials/transcripts`
   - Allowed formats: `pdf,jpg,jpeg,png`
5. Save

## 4. Add to Environment Variables
Add to your `frontend/.env.local`:

```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## 5. Test Upload
1. Go to `/issue` page
2. Fill the form
3. Upload a test PDF/image file
4. Check Cloudinary dashboard to see the uploaded file

## Notes
- Free tier: 25GB storage, 25GB bandwidth/month
- Files are stored permanently
- URLs are permanent and can be used for verification
- The URL is saved in Supabase database for each credential

## Security
- Upload preset is unsigned (no authentication needed)
- This is safe because uploads are limited to transcripts only
- For production, consider signed uploads with backend validation
