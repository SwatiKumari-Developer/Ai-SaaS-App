# PromptPilot AI

A deployable AI SaaS starter inspired by the project brief: users can sign in, spend credits, choose models, generate content/code/answers, review prompt history, and upgrade plans through Stripe.

## Features

- Next.js App Router frontend and API routes
- Streaming AI responses through OpenAI-compatible Chat Completions
- Demo mode when `OPENAI_API_KEY` is missing, so the app still runs live
- Credit usage, plan limits, prompt history dashboard
- Stripe Checkout route for Pro and Business subscriptions
- Responsive SaaS UI ready for Vercel deployment

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

```bash
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4.1-mini
STRIPE_SECRET_KEY=sk_test_or_live_key
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_BUSINESS_PRICE_ID=price_xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Deploy To GitHub

```bash
git init
git add .
git commit -m "Build AI SaaS app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-saas-app.git
git push -u origin main
```

## Deploy To Vercel

1. Create a GitHub repository and push this project.
2. Go to Vercel, choose **Add New Project**, and import the repository.
3. Add the environment variables from `.env.example`.
4. Deploy.
5. After deployment, update `NEXT_PUBLIC_APP_URL` to your Vercel URL and redeploy.

## Deploy To Render

1. Push the project to GitHub.
2. Create a Render **Web Service** from the repository.
3. Use `npm install` as the build command.
4. Use `npm run build && npm run start` as the start command.
5. Add the same environment variables and deploy.

Vercel is recommended for this project because it is a Next.js app with route handlers.
