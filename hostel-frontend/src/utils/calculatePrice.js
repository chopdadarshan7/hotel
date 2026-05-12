const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getNightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const raw = Math.ceil((end.getTime() - start.getTime()) / DAY_IN_MS);

  return Number.isFinite(raw) && raw > 0 ? raw : 0;
}

export default function calculatePrice(pricePerNight, checkIn, checkOut, guests = 1) {
  const safeRate = Number(pricePerNight) || 0;
  const safeGuests = Math.max(Number(guests) || 1, 1);
  const nights = getNightsBetween(checkIn, checkOut);

  return {
    nights,
    total: safeRate * nights * safeGuests,
  };
}
