import { NextRequest } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

const checkoutSchema = z.object({
  plan: z.enum(["pro", "business"])
});

const priceIds = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  business: process.env.STRIPE_BUSINESS_PRICE_ID
};

export async function POST(request: NextRequest) {
  const parsed = checkoutSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: "Invalid plan." }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY || !priceIds[parsed.data.plan]) {
    return Response.json({
      url: "/?checkout=demo",
      message: "Stripe is not configured yet. Add Stripe keys to enable live checkout."
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceIds[parsed.data.plan], quantity: 1 }],
    success_url: `${appUrl}/?checkout=success`,
    cancel_url: `${appUrl}/?checkout=cancelled`
  });

  return Response.json({ url: session.url });
}
