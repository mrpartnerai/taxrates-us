# taxrates-us Landing Page

Password-protected landing page for the taxrates-us API showcase.

## Features

- 🎨 Dark mode design with Tailwind CSS
- 📱 Fully responsive layout
- 🔒 Password protection (Vercel deployment)
- 🚀 Built with Next.js 15
- ⚡ Fast performance with App Router

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the landing page.

## Deployment to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Deploy automatically

### Password Protection

After deploying, enable password protection in Vercel:

1. Go to Project Settings → Deployment Protection
2. Enable "Vercel Authentication"
3. Or set custom environment variables:
   - `VERCEL_PASSWORD_PROTECTION=1`
   - `VERCEL_PASSWORD=your_password_here`

### Custom Domain

To use a custom domain:
1. Go to Project Settings → Domains
2. Add your domain (e.g., taxrates.us)
3. Update DNS records as instructed

## Project Structure

```
landing/
├── app/
│   ├── layout.tsx      # Root layout with metadata
│   ├── page.tsx        # Main landing page
│   └── globals.css     # Global styles
├── public/             # Static assets
├── vercel.json         # Vercel configuration
└── package.json        # Dependencies
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Deployment:** Vercel
- **Language:** TypeScript

## Links

- **API Repo:** https://github.com/mrpartnerai/taxrates-us
- **npm Package:** https://www.npmjs.com/package/taxrates-us
- **API Endpoint:** https://taxrates-us.vercel.app/api

## License

MIT - Same as the parent taxrates-us project
