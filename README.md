# InstaReply - Social Media Automation Platform

InstaReply is a SaaS platform that automates Instagram, Facebook, TikTok, and Threads DMs and comments. It helps businesses and influencers save time and grow their audience through automated engagement.

## Features

- **Automated DMs**: Send personalized direct messages automatically to new followers
- **Smart Comments**: Automatically comment on posts with relevant content
- **Multi-Platform Support**: Works with Instagram, Facebook, TikTok, and Threads
- **Analytics Dashboard**: Track your growth and engagement with detailed insights
- **Multi-Account Management**: Manage multiple social media accounts from a single dashboard

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (hosted on Railway)
- **Authentication**: NextAuth.js
- **ORM**: Prisma

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or use the provided Railway connection)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/instreply.git
   cd instreply
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```
   DATABASE_URL="postgresql://postgres:postgres@caboose.proxy.rlwy.net:35391/postgres"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

The application is configured to be deployed on Railway. Follow these steps:

1. Create a new project on Railway
2. Connect your GitHub repository
3. Add the PostgreSQL plugin
4. Configure the environment variables
5. Deploy the application

## License

This project is licensed under the MIT License - see the LICENSE file for details.
