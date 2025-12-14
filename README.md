# QRealm

![Next.js](https://img.shields.io/badge/Next.js-16.0.10-darkviolet)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.79.0-darkgreen)
![Zustand](https://img.shields.io/badge/Zustand-5.0.9-purple)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-7.66.0-pink)
![Zod](https://img.shields.io/badge/Zod-4.1.12-blue)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CSci-153-Web-Systems-and-Technologies/batch-2025-qrealm-web.git)


Privacy-focused, QR-powered photo sharing platform designed specifically for group events, enabling seamless photo collection and sharing without requiring guest accounts.


## ✨ Features

### 🎯 Core Features
- **No-Account Photo Upload**: Guests upload photos instantly by scanning QR codes, no registration required
- **QR Code Event Access**: Auto-generated unique QR codes for instant gallery access without accounts
- **Event Creator Ownership**: Users only moderate photos from events they created
- **Smart Event Management**: Intuitive creation wizard with school event categories and custom options

### 📸 Photo Gallery
- **Responsive Photo Grid**: Modern masonry layout with full-screen lightbox viewing
- **Photo Reactions**: Heart and sparkle reaction counts for real-time engagement
- **Direct Photo Download**: Users can download photos with proper attribution
- **Photo Moderation**: Approve or reject uploads with pending/approved/rejected status

### 👤 User Features
- **Secure Authentication**: Email/password login and signup with Supabase Auth
- **Admin Dashboard**: Comprehensive statistics showing total events, photos, approvals, and pending items
- **Event Analytics**: Track photo counts, upload activity, and event performance
- **Real-time Updates**: Live photo count and gallery updates without page refresh

### 🛡️ Privacy & Security
- **Row-Level Security**: Supabase RLS policies protect user data
- **Creator-Only Moderation**: Event owners control their own event galleries
- **Anonymous Guest Access**: No tracking or accounts required for photo viewing/uploading
- **Authentication**: Secure login with email/password verification.

## 🚀 Tech Stack

- **Frontend**: Next.js 16.0.1 with App Router, React 19.2.0, TypeScript 5
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Tailwind CSS 4.1.16 with shadcn/ui components, Lucide React 0.548.0
- **State Management**: Zustand 5.0.8, React Hook Form 7.66.0
- **Validation**: Zod 4.1.12
- **Authentication**: Supabase Auth with Email/Password
- **Deployment**: Vercel
- **Utilities**: QRCode 1.5.4, jsPDF 3.0.4, date-fns 4.1.0
- **Testing**: baseline-browser-mapping (for Baseline web feature compatibility)

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- Git installed on your machine

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CSci-153-Web-Systems-and-Technologies/batch-2025-qrealm-web.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Supabase Setup**
   
   Create the following tables in your Supabase database:

   **Event Table:**
   ```sql
   CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE,
    event_time TIME,
    category_id INTEGER REFERENCES public.event_categories(id) ON DELETE SET NULL,
    custom_category TEXT,
    organizer VARCHAR(255),
    location TEXT,
    cover_image_url TEXT,
    max_photos INTEGER DEFAULT 100,
    expected_attendees INTEGER,
    allow_photo_upload BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    ip_address INET,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
   ```

   **Uploads Table:**
   ```sql
   CREATE TABLE IF NOT EXISTS public.uploads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    uploaded_by TEXT,
    caption TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
   ```

   **Even Code Table:**
   ```sql
   CREATE TABLE IF NOT EXISTS public.event_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NULL REFERENCES public.events(id) ON DELETE SET NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    qr_code_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
   ```

   **Enable Row Level Security (RLS):**
   ```sql
   -- Enable RLS
   ALTER TABLE event ENABLE ROW LEVEL SECURITY;
   ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
   ALTER TABLE even_codes ENABLE ROW LEVEL SECURITY;

   -- Event policies
   CREATE POLICY "Users can view own events" ON public.events
    FOR SELECT USING (auth.uid() = created_by);
    CREATE POLICY "Users can create events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = created_by);
    CREATE POLICY "Users can update own events" ON public.events
    FOR UPDATE USING (auth.uid() = created_by);
    CREATE POLICY "Users can delete own events" ON public.events
    FOR DELETE USING (auth.uid() = created_by);
    CREATE POLICY "Public can view public events" ON public.events
    FOR SELECT USING (is_public = true);

   -- Uploads policies
   CREATE POLICY "upload_insert_anyone"
    ON public.uploads
    FOR INSERT
    TO public
    WITH CHECK (
    status = 'pending'
    AND event_id IN (
        SELECT id FROM public.events 
        WHERE allow_photo_upload = true 
        AND is_active = true
    )AND ((auth.role() = 'authenticated' AND uploaded_by = (auth.uid())::text) OR ((auth.role() = 'anon' OR auth.role() IS NULL) AND uploaded_by IS NULL)));

    CREATE POLICY "upload_select_public_and_owners"
    ON public.uploads
    FOR SELECT
    TO public
    USING (
    status = 'approved' OR
    EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = uploads.event_id
        AND e.created_by = auth.uid()
    ) OR (auth.role() = 'authenticated' AND uploaded_by = (auth.uid())::text) OR ((auth.role() = 'anon' OR auth.role() IS NULL) AND uploaded_by IS NULL AND status = 'pending'));

    CREATE POLICY "upload_update_owners"
    ON public.uploads
    FOR UPDATE
    TO public
    USING (
    EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = uploads.event_id
        AND e.created_by = auth.uid()
    ))WITH CHECK ( owner
    EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = uploads.event_id
        AND e.created_by = auth.uid()));

    CREATE POLICY "upload_delete_owners"
    ON public.uploads
    FOR DELETE
    TO public
    USING (
    EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = uploads.event_id
        AND e.created_by = auth.uid()
    ));
    
   ```


## 🏃‍♂️ Running the Application

1. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 👤 User Role

### For 🔐 Logged-in:

**Create an Account**: Sign up using Google OAuth or email/password login
Privileges (Includes ALL Guest privileges, plus):
1. **Browse Events**: Can view the public event list on the website.
2. **Create Events**: Can create new event galleries.
3. **Manage Events**: Has a personal dashboard to manage all events they created (moderate photos, generate QR codes, edit event details).
4. **Control Session**: Open/close sessions and delete when finished
5. **Events Analytics**: Check own events and photo count
6. **Moderate**: Can approve or reject uploaded photo/s
7. **Real-time Reaction**: Can react to uploaded photo/s

### For 👥 Guest:

**Access Method**: Only by scanning a valid event QR code or visit the event URL.
1. **View Gallery**: Can upload photos to that specific event only (pending moderator approval).
2. **Upload Photos**: Enter your name (optional) and question
3. **Real-time Reaction**: Can react to uploaded photo/s

## 📁 Project Structure

```
qrealm/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── (admin)/                  # Protected routes
│   ├── api/                      # API routes
│   ├── event/                    # Public event routes
│   ├── moderate/                 # Moderation panel
│   ├── page.tsx                  # Landing page
│   └── layout.tsx                # Root layout
├── components/                   # Reusable UI components
│   ├── ui/                      # shadcn/ui components
│   └── ...                      # Custom components
├── lib/                         # Utility functions
├── store/                       # Zustand stores 
├── types/                       # TypeScript type definitions
├── utils/                       # Supabase configuration
└── public/                      # Static assets
```


## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `NEXT_PUBLIC_BASE_URL` | Base URL for QR code generation | Yes |

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/KaelNierras/class-qa-board)

## 🗓️ Releases

| Release Version | Date Released | Type |
| :--- | :--- | :--- |
| **v1.0.0** | 2025-12-13 | Initial Deployment (MVP) |

### v1.0.0 Release Notes
**What's New**
* **Initial Launch:** First stable deployment of QRealm photo sharing platform for event galleries.
* **Core Features:**
    * **No-Account Photo Upload:** Guests upload photos instantly via QR code scanning without registration.
    * **QR-Powered Event Access:** Auto-generated unique QR codes for instant gallery access.
    * **Event Creator Control:** Users moderate only photos from events they created.
    * **Smart Event Management:** Intuitive creation wizard with school event categories and custom options.
    * **Responsive Photo Gallery:** Modern masonry layout with full-screen lightbox viewing.
    * **Photo Reactions:** Heart and sparkle reaction counts for real-time engagement.
    * **Direct Photo Download:** Users can download photos with proper attribution.
    * **Admin Dashboard:** Comprehensive statistics, event management, and moderation panel.
    * **Secure Authentication:** Email/password signup with Supabase Auth integration.
    * **Real-time Updates:** Live photo counts and gallery updates without page refresh.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

Developed as part of CSci-153 Web Systems and Technologies course.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for the UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
