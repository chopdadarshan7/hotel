export function formatAuthError(message = "") {
  const msg = String(message).toLowerCase();

  if (msg.includes("rate limit") || msg.includes("email rate limit")) {
    return "Bahut baar try kiya — thodi der baad dubara try karo, ya neeche Google se login karo.";
  }

  if (msg.includes("already registered") || msg.includes("already been registered")) {
    return "Yeh email pehle se registered hai. Sign In tab use karo ya Google se login karo.";
  }

  if (msg.includes("invalid login credentials")) {
    return "Email ya password galat hai.";
  }

  if (msg.includes("password") && msg.includes("least")) {
    return "Password kam se kam 6 characters ka hona chahiye.";
  }

  return message || "Kuch galat hua. Dubara try karo.";
}
