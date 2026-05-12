import { amenities, teamMembers } from "../lib/siteData";

export default function About() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__content">
          <p className="eyebrow">About Us</p>
          <h1>A hostel built for connection, comfort, and everyday city stories.</h1>
          <p>
            Us Hostel blends boutique design with community energy, making it easy to stay well,
            meet people, and move through the city with confidence.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container story-grid">
          <article className="story-card reveal">
            <p className="eyebrow">Our Story</p>
            <h2>Born from the idea that hostels can feel both social and beautifully calm.</h2>
            <p>
              We designed Us Hostel for travellers who want thoughtful interiors, warm hospitality,
              and the freedom to meet people without sacrificing comfort.
            </p>
            <p>
              Whether you are checking in for one night or a whole week, our goal is to make the
              place feel memorable for the right reasons.
            </p>
          </article>

          <div className="amenities-card reveal">
            <p className="eyebrow">Amenities</p>
            <div className="amenity-list">
              {amenities.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Meet the team</p>
              <h2>People who make every arrival feel easier.</h2>
            </div>
          </div>

          <div className="team-grid">
            {teamMembers.map((member) => (
              <article key={member.name} className="team-card reveal">
                <img src={member.image} alt={member.name} />
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container map-card reveal">
          <div>
            <p className="eyebrow">Find us</p>
            <h2>In the heart of Jaipur, close to food, heritage, and fast city access.</h2>
            <p>
              Our neighborhood puts you near transit, cafés, old-city walks, and a steady rhythm of
              local life.
            </p>
          </div>
          <iframe
            title="Us Hostel map"
            src="https://www.google.com/maps?q=Jaipur%20Rajasthan&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}
