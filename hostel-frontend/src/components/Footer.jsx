import { contactDetails, socialLinks } from "../lib/siteData";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <p className="eyebrow">Us Hostel</p>
          <h3>Modern stays for curious travellers.</h3>
          <p>
            Stay in the center of the city, meet people from everywhere, and keep the comfort of a
            beautifully-designed home base.
          </p>
        </div>

        <div>
          <p className="footer__label">Visit</p>
          <p>{contactDetails.address}</p>
          <p>{contactDetails.phone}</p>
          <p>{contactDetails.email}</p>
        </div>

        <div>
          <p className="footer__label">Social</p>
          <div className="footer__socials">
            {socialLinks.map((item) => (
              <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Us Hostel</span>
        <span>Built with React and a warm welcome.</span>
      </div>
    </footer>
  );
}
