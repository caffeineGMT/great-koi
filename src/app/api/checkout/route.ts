import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeKey);

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json(
      { error: "Price not configured" },
      { status: 500 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://great-koi.vercel.app"}?subscribed=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://great-koi.vercel.app"}?cancelled=true`,
  });

  return NextResponse.json({ url: session.url });
}
