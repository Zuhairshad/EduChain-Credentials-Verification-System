# Supabase Authentication Setup

## Admin Credentials

**Email**: `admin@lgu.edu.pk`  
**Password**: `admin1122`

⚠️ **Only this email is authorized to access the issuer portal**

## Create Admin User in Supabase

1. Go to your Supabase project
2. Navigate to **Authentication** → **Users**
3. Click **Add user** → **Create new user**
4. Enter:
   - **Email**: `admin@lgu.edu.pk`
   - **Password**: `admin1122`
   - **Auto Confirm User**: ✅ Enable this
5. Click **Create user**

## Test Login

1. Go to `http://localhost:3000`
2. You'll be redirected to `/login`
3. Enter:
   - Email: `admin@lgu.edu.pk`
   - Password: `admin1122`
4. Click **Sign In**
5. You should be redirected to `/dashboard`

## Security Notes

- Only the admin@lgu.edu.pk account can access the portal
- All routes except `/login` are protected
- Users are automatically redirected to login if not authenticated
- Sessions persist in browser
- Sign out clears the session

## For Production

⚠️ **Important**: Change the password to something more secure before deploying to production!

You can change it in Supabase:
1. Go to **Authentication** → **Users**
2. Click on the admin user
3. Update password
4. Save
