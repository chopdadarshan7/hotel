const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("BOOKING_FROM_EMAIL") || "Us Hostel <bookings@ushostel.com>";

    if (!resendApiKey) {
      throw new Error("Missing RESEND_API_KEY.");
    }

    const body = await request.json();
    const {
      guestName,
      email,
      roomName,
      checkIn,
      checkOut,
      totalPrice,
      bookingId,
    } = body;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #1c1c1c; line-height: 1.6;">
        <h1 style="font-family: Georgia, serif;">Us Hostel Booking Confirmation</h1>
        <p>Hi ${guestName},</p>
        <p>Thanks for booking with Us Hostel. Your reservation is now in our system.</p>
        <ul>
          <li><strong>Booking ID:</strong> ${bookingId}</li>
          <li><strong>Room:</strong> ${roomName}</li>
          <li><strong>Check-in:</strong> ${checkIn}</li>
          <li><strong>Check-out:</strong> ${checkOut}</li>
          <li><strong>Total:</strong> ₹${totalPrice}</li>
        </ul>
        <p>We look forward to hosting you.</p>
        <p>Warmly,<br />Us Hostel</p>
      </div>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: "Your Us Hostel booking confirmation",
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errorPayload = await resendResponse.text();
      throw new Error(errorPayload);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message || "Unknown error",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
