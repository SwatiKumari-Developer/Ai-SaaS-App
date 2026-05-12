# PromptPilot AI - AI SaaS App

PromptPilot AI is a full-stack AI SaaS web application where users can sign in, generate content, code, and answers, manage usage credits, switch between AI modes, view prompt history, and explore paid subscription plans.

The project is inspired by modern AI workspace products like ChatGPT, Jasper, Copy.ai, and other SaaS tools. It is built as a deployment-ready project for GitHub and Vercel.

## Project Description

PromptPilot AI helps users generate useful AI-style responses from a simple dashboard. A user can create a workspace using an email, enter a prompt, choose a generation mode, and receive a streamed response.

The app supports two generation paths:

- Smart demo generation when no paid OpenAI API key is available
- Real OpenAI generation when `OPENAI_API_KEY` is added in environment variables

This means the project can run live for free in demo mode, while still being ready for production AI integration later.

## Use Of This Project

This project can be used as:

- An AI content generation SaaS prototype
- A portfolio project for full-stack development
- A startup MVP for an AI writing or coding assistant
- A learning project for Next.js, API routes, environment variables, and deployment
- A base project for adding real authentication, database storage, payments, and AI billing

Users can generate:

- Essays and long-form content
- Marketing emails
- Social media posts and captions
- Short explanations and answers
- Simple TypeScript code examples
- Credit/rate-limit logic examples

## Main Features

- Responsive SaaS dashboard UI
- Email-based demo sign-in
- AI prompt input box
- Content, Code, and Answer generation modes
- Model selector UI
- Streaming response display
- Credit-based usage system
- Free, Pro, and Business plan cards
- Demo upgrade flow
- Stripe Checkout API route for future paid subscriptions
- Prompt history saved in browser local storage
- Smart no-cost demo generator
- Optional OpenAI integration
- Vercel-ready deployment setup

## Tech Stack

| Technology | Use In This Project |
| --- | --- |
| Next.js | Main full-stack framework used for frontend pages and backend API routes |
| React | Used to build interactive UI components and manage state |
| TypeScript | Adds type safety to reduce bugs and make code easier to maintain |
| CSS | Used for custom responsive styling and dashboard layout |
| Lucide React | Provides clean icons for buttons, navigation, plans, and UI actions |
| Zod | Validates API request data before generating responses |
| OpenAI API | Optional real AI provider for live AI responses |
| Stripe | Optional payment provider for subscription checkout |
| Local Storage | Saves demo login state, credits, plan, and prompt history in the browser |
| Git | Version control for tracking project changes |
| GitHub | Hosts the source code repository |
| Vercel | Deploys the Next.js app online |

## Why These Tech Stacks Are Used

### Next.js

Next.js is used because it supports both frontend and backend in one project. The app uses the App Router for pages and API routes for server-side logic such as AI generation and checkout creation.

### React

React is used to create dynamic UI features like sign-in state, credit updates, mode switching, streamed output, plan selection, and prompt history.

### TypeScript

TypeScript helps catch errors during development. It makes the app safer by defining clear types for modes, plans, prompt history, and API request data.

### Zod

Zod validates the incoming API request before processing it. This prevents invalid prompt data from reaching the generation logic.

### OpenAI API

OpenAI can be connected through `OPENAI_API_KEY` to generate real AI responses. If the key is not added, the app uses a built-in smart demo generator.

### Stripe

Stripe is prepared for subscription checkout. In the current project, the Pro and Business plans can be connected to real Stripe price IDs later.

### Vercel

Vercel is used because it works very well with Next.js. It automatically builds and deploys the app from GitHub.

## How I Built This Project Step By Step

### Step 1: Created The Next.js Project Structure

The project was created as a Next.js App Router application. The main files include:

```text
app/page.tsx
app/layout.tsx
app/globals.css
app/api/generate/route.ts
app/api/checkout/route.ts
```

### Step 2: Built The SaaS Dashboard UI

The main dashboard was created in `app/page.tsx`. It includes:

- Top navigation bar
- Hero section
- Workspace login panel
- Plan and credit sidebar
- Prompt generator section
- Streaming response area
- Prompt history panel

### Step 3: Added Demo Sign-In

An email-based demo sign-in was added using React state and browser local storage. This lets the app behave like a SaaS workspace without requiring a real authentication provider.

### Step 4: Added Credit System

The app includes three plan levels:

```text
Free: 10 credits
Pro: 250 credits
Business: 1200 credits
```

Each generation uses one credit. The selected plan and remaining credits are stored locally in the browser.

### Step 5: Added AI Generation API Route

The `/api/generate` route handles prompt generation. It checks whether `OPENAI_API_KEY` exists.

If an OpenAI key exists:

- The app sends the prompt to OpenAI
- The result streams back to the UI

If no OpenAI key exists:

- The app uses the smart built-in demo generator
- The response still streams like a real AI response

### Step 6: Added Smart Demo Mode

Smart demo mode was added so the project can work without paid API credits. It can generate sample essays, emails, captions, answers, and code templates based on the selected mode and prompt.

### Step 7: Added Prompt History

After each generation, the app saves the prompt, output, mode, model, and time in local storage. The latest prompts appear in the history panel.

### Step 8: Added Stripe Checkout API Route

The `/api/checkout` route was added for future subscription payments. If Stripe keys are configured, it creates a Stripe Checkout session. If Stripe is not configured, the app uses demo upgrade mode.

### Step 9: Styled The Application

The UI was styled using custom CSS in `app/globals.css`. The design focuses on a clean SaaS dashboard layout with responsive behavior for desktop and mobile screens.

### Step 10: Prepared Environment Variables

The `.env.example` file was created to show which environment variables can be used:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
STRIPE_SECRET_KEY=
STRIPE_PRO_PRICE_ID=
STRIPE_BUSINESS_PRICE_ID=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 11: Tested The Production Build

The project was tested using:

```bash
npm run build
```

This confirmed that the app compiles successfully for production.

### Step 12: Pushed Code To GitHub

Git was initialized, the project was committed, and the code was pushed to GitHub.

### Step 13: Deployed On Vercel

The GitHub repository was imported into Vercel. Vercel detected the project as a Next.js app and deployed it online.

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

For free demo mode, only this is needed on Vercel:

```bash
NEXT_PUBLIC_APP_URL=https://your-vercel-app-url.vercel.app
```

For real OpenAI generation:

```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4.1-mini
NEXT_PUBLIC_APP_URL=https://your-vercel-app-url.vercel.app
```

For Stripe subscriptions:

```bash
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PRO_PRICE_ID=your_pro_price_id
STRIPE_BUSINESS_PRICE_ID=your_business_price_id
NEXT_PUBLIC_APP_URL=https://your-vercel-app-url.vercel.app
```

## Future Improvements

- Add real authentication with NextAuth or Clerk
- Add a database using PostgreSQL, Prisma, or Supabase
- Save prompt history for each user in the database
- Add Stripe webhooks to verify paid subscriptions
- Add user roles and account settings
- Add usage analytics
- Add file upload support
- Add more AI tools such as summarizer, blog writer, resume builder, and chatbot

## Conclusion

PromptPilot AI is a complete AI SaaS starter project. It demonstrates frontend UI, backend API routes, streaming responses, credit-based usage, optional AI integration, optional payments, GitHub version control, and Vercel deployment. It can run for free in demo mode and can be upgraded into a real paid AI SaaS product by connecting OpenAI, Stripe, authentication, and a database.
