import { useState } from "react";
import { contactDetails } from "../lib/siteData";
import { hasSupabaseEnv, requireSupabase } from "../lib/supabase";

const initialForm = {
  name: "",
  email: "",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      if (!hasSupabaseEnv) {
        throw new Error("Connect Supabase environment variables to save contact messages.");
      }

      const supabase = await requireSupabase();
      const { error: insertError } = await supabase.from("contacts").insert({
        name: form.name,
        email: form.email,
        message: form.message,
      });

      if (insertError) {
        throw insertError;
      }

      setMessage("Message sent. We will get back to you soon.");
      setForm(initialForm);
    } catch (submitError) {
      setError(submitError.message || "Unable to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__content">
          <p className="eyebrow">Contact</p>
          <h1>Have a booking question or need help planning your stay?</h1>
          <p>Send us a note, call us directly, or jump into WhatsApp for quick support.</p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          <article className="contact-card reveal">
            <p className="eyebrow">Reach us</p>
            <h2>We are easy to reach before and during your stay.</h2>
            <div className="contact-card__details">
              <div>
                <span>Address</span>
                <strong>{contactDetails.address}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{contactDetails.phone}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{contactDetails.email}</strong>
              </div>
            </div>
          </article>

          <form className="contact-form reveal" onSubmit={handleSubmit}>
            <label className="field">
              <span>Name</span>
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label className="field">
              <span>Email</span>
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </label>
            <label className="field">
              <span>Message</span>
              <textarea
                name="message"
                rows="6"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us about your dates, room needs, or anything else..."
                required
              />
            </label>

            {error ? <p className="form-message form-message--error">{error}</p> : null}
            {message ? <p className="form-message form-message--success">{message}</p> : null}

            <button className="button button--primary" type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
