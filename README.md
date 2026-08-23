## 🌟 Features

- **Service & Category Management**: Seamlessly manage beauty services rather than traditional products. Includes dynamic pricing and contextually relevant categorizations.
- **Role-Based Access Control**: Secure separation between Admin and Staff access levels.
  - **Admins**: Full access to all features, system settings, and analytics.
  - **Staff**: Streamlined interface focused on core POS billing and order history.
- **Order Management**: Comprehensive order tracking and history available for both staff and administrators.
- **Modern UI/UX**: Premium aesthetic featuring responsive layouts, micro-animations (via Framer Motion), and a beautifully structured service selection interface.
- **Progressive Web App (PWA)**: Built with Serwist to provide robust offline capabilities and a native-like installation experience.
- **Backend & Authentication**: Powered securely by Supabase.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)
- **Backend/Auth**: [Supabase](https://supabase.com/)
- **PWA Integration**: [Serwist](https://serwist.build/)

## 🛠️ Getting Started

### Prerequisites

- Node.js 18.x or later
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository and navigate into the project directory.
2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables. Create a `.env` file in the root directory based on your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:

```bash
npm run dev
# or yarn dev, pnpm dev, bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to explore the POS system.

## 🎨 Operational Setup

- **Business Hours**: The system is pre-configured to handle standard service hours (9 AM to 6 PM), aligning seamlessly with studio operations.
- **Terminology**: Replaces generic retail "products" with "services" to maintain relevant taxonomy for beauty and wellness studios.
