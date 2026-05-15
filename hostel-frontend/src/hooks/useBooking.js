import { useState } from "react";
import calculatePrice, { getNightsBetween } from "../utils/calculatePrice";
import { requireSupabase } from "../lib/supabase";

export default function useBooking() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const checkRoomAvailability = async ({ roomId, checkIn, checkOut }) => {
    const nights = getNightsBetween(checkIn, checkOut);

    if (!roomId || !checkIn || !checkOut || nights <= 0) {
      return false;
    }

    const supabase = await requireSupabase();
    const { data, error: fetchError } = await supabase.rpc("check_room_availability", {
      p_room_id: roomId,
      p_check_in: checkIn,
      p_check_out: checkOut,
    });

    if (fetchError) {
      throw fetchError;
    }

    return Boolean(data);
  };

  const createBooking = async ({ room, form }) => {
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(room.id)) {
        throw new Error("Booking unavailable for sample rooms. Please contact us directly.");
      }

      const supabase = await requireSupabase();
      const availability = await checkRoomAvailability({
        roomId: room.id,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
      });

      if (!availability) {
        throw new Error("Those dates are already booked for this room.");
      }

      const price = calculatePrice(
        room.price_per_night,
        form.checkIn,
        form.checkOut,
        form.guests || 1,
      );

      const payload = {
        guest_name: form.name,
        email: form.email,
        phone: form.phone,
        room_id: room.id,
        check_in: form.checkIn,
        check_out: form.checkOut,
        guests_count: Number(form.guests) || 1,
        special_requests: form.specialRequests,
        total_price: price.total,
        status: "pending",
      };

      const { data, error: insertError } = await supabase
        .from("bookings")
        .insert(payload)
        .select("*, rooms(name)")
        .single();

      if (insertError) {
        throw insertError;
      }

      try {
        await supabase.functions.invoke("send-booking-confirmation", {
          body: {
            bookingId: data.id,
            guestName: payload.guest_name,
            email: payload.email,
            roomName: room.name,
            checkIn: payload.check_in,
            checkOut: payload.check_out,
            totalPrice: payload.total_price,
          },
        });
      } catch (functionError) {
        console.warn("Confirmation email function failed", functionError);
      }

      setSuccess("Booking saved successfully. A confirmation email is on the way.");
      return data;
    } catch (bookingError) {
      const nextError = bookingError.message || "Unable to save booking.";
      setError(nextError);
      throw bookingError;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    error,
    success,
    setError,
    setSuccess,
    createBooking,
    checkRoomAvailability,
  };
}
