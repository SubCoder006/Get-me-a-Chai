// Create this file: /app/api/verify-payment/route.js

import Razorpay from "razorpay";
import crypto from "crypto";
import clientPromise from "@/utils/mongodb";

export async function POST(req) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      supporterData 
    } = await req.json();

    // Verify the payment signature
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return new Response(
        JSON.stringify({ success: false, error: "Payment verification failed" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Payment is verified, save to database
    const client = await clientPromise;
    const db = client.db();
    const supporters = db.collection("supporters");
    const users = db.collection("users");

    // Find the recipient user
    const recipient = await users.findOne({ 
      email: supporterData.userEmail 
    });

    if (!recipient) {
      return new Response(
        JSON.stringify({ success: false, error: "Recipient not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Save supporter data with payment info
    const supporterRecord = {
      ...supporterData,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      status: "completed",
      verifiedAt: new Date(),
      createdAt: new Date(),
    };

    const result = await supporters.insertOne(supporterRecord);

    return new Response(
      JSON.stringify({ 
        success: true, 
        supporterId: result.insertedId.toString(),
        message: "Payment verified and saved successfully"
      }), 
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Payment verification failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}