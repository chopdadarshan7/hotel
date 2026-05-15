import { useState } from "react";
import { auth, hasFirebaseEnv } from "../firebase/config";
import {
  checkRoomAvailability,
  createBooking,
} from "../firebase/services";
import calculatePrice, { getNightsBetween } from "../utils/calculatePrice";

export default function useBooking() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const checkRoomAvailabilityHook = async ({ roomId, checkIn, checkOut }) => {
    const nights = getNightsBetween(checkIn, checkOut);
    if (!roomId || !checkIn || !checkOut || nights <= 0) return false;
    if (!hasFirebaseEnv) return true;
    return checkRoomAvailability({ roomId, checkIn, checkOut });
  };

  const createBookingHook = async ({ room, form }) => {
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (!hasFirebaseEnv) {
        throw new Error("Firebase configure karo booking ke liye.");
      }

      if (!auth.currentUser) {
        throw new Error("Booking ke liye pehle login karo.");
      }

      const available = await checkRoomAvailability({
        roomId: room.id,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
      });

      if (!available) {
        throw new Error("Those dates are already booked for this room.");
      }

      const price = calculatePrice(
        room.price_per_night,
        form.checkIn,
        form.checkOut,
        form.guests || 1,
      );

      await createBooking(
        {
          user_id: auth.currentUser.uid,
          guest_name: form.name || auth.currentUser.displayName || "",
          email: form.email || auth.currentUser.email,
          phone: form.phone,
          room_id: room.id,
          check_in: form.checkIn,
          check_out: form.checkOut,
          guests_count: Number(form.guests) || 1,
          special_requests: form.specialRequests,
          total_price: price.total,
        },
        room.name,
      );

      setSuccess("Booking saved successfully!");
      return true;
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
    createBooking: createBookingHook,
    checkRoomAvailability: checkRoomAvailabilityHook,
  };
}
