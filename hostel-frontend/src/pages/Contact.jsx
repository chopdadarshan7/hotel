import { useState } from "react";
import { saveContact } from "../firebase/services";
import { hasFirebaseEnv } from "../firebase/config";
import { contactDetails } from "../lib/siteData";

const initialForm = { name: "", email: "", message: "" };

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
      if (!hasFirebaseEnv) {
        throw new Error("Firebase configure karo contact form ke liye.");
      }
      await saveContact(form);
      setMessage("Message sent. We will get back to you soon.");
      setForm(initialForm);
    } catch (submitError) {
      setError(submitError.message || "Unable to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-section">
      <div className="container contact-layout">
        <div className="contact-copy reveal">
          <p className="eyebrow">Contact</p>
          <h1>We are here to help you plan the perfect stay.</h1>
          <p>Send us a message and our team will respond shortly.</p>
          <ul className="contact-list">
            <li><strong>Address:</strong> {contactDetails.address}</li>
            <li><strong>Phone:</strong> {contactDetails.phone}</li>
            <li><strong>Email:</strong> {contactDetails.email}</li>
          </ul>
        </div>

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
            <textarea name="message" rows="5" value={form.message} onChange={handleChange} required />
          </label>
          {error ? <p className="form-message form-message--error">{error}</p> : null}
          {message ? <p className="form-message form-message--success">{message}</p> : null}
          <button className="button button--primary" type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}
