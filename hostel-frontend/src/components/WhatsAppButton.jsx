import { contactDetails } from "../lib/siteData";

export default function WhatsAppButton() {
  return (
    <a
      className="whatsapp-float"
      href={`https://wa.me/${contactDetails.whatsapp}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
    >
      <span>WhatsApp</span>
    </a>
  );
}
