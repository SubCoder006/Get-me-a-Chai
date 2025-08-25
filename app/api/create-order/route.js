import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const { amount } = await req.json();
    
    // Convert amount to paise (Razorpay expects amount in the smallest currency unit)
    const amountInPaise = Math.round(amount * 100);
    
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    
    const order = await razorpay.orders.create(options);
    
    return Response.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
    
  } catch (error) {
    console.error("Error creating order:", error);
    return Response.json({ 
      error: "Failed to create order" 
    }, { status: 500 });
  }
}