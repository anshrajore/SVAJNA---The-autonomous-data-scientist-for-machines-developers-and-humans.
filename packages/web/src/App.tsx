import React, { useState } from "react";

export const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="site-wrapper">
      {/* Header */}
      <header className="site-header">
        <div className="logo-text">Hanzo</div>
        <button
          className="menu-trigger"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
        </button>
      </header>

      {/* Hero Section */}
      <main className="hero-content">
        <h1 className="hero-heading">
          <span className="serif-italic">I'm Hanzo</span>
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80"
            alt="Hanzo portrait"
            className="avatar-badge"
          />
          <span className="serif-italic">,</span>
          <br />
          <span className="serif-regular">a Product</span>
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80"
            alt="Product design icon"
            className="avatar-badge pill"
          />
          <span className="serif-italic"> Designer</span>
          <br />
          <span className="serif-regular">based in Tokyo</span>
          <img
            src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=160&auto=format&fit=crop&q=80"
            alt="Tokyo cherry blossoms"
            className="avatar-badge"
          />
        </h1>

        <p className="hero-desc">
          I have 11 years of experience working on useful and mindful products together with startups and known brands
        </p>

        <div>
          <a
            href="https://github.com/anshrajore/SVAJNA---The-autonomous-data-scientist-for-machines-developers-and-humans..git"
            target="_blank"
            rel="noreferrer"
            className="cta-remix-btn"
          >
            Remix Template <span className="cta-arrow">↗</span>
          </a>
        </div>
      </main>

      {/* Featured Projects Tablet Devices */}
      <section className="devices-grid">
        {/* Left Device */}
        <div className="tablet-device">
          <div className="device-notch"></div>
          <div className="device-screen left-screen">
            <div className="ui-dot-row">
              <div className="ui-dot"></div>
              <div className="ui-dot"></div>
            </div>
            <div className="ui-card-skeleton">
              <div className="skeleton-line medium"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        </div>

        {/* Right Device */}
        <div className="tablet-device">
          <div className="device-notch"></div>
          <div className="device-screen right-screen">
            <div className="blue-light-rays"></div>
            <h3 className="right-screen-title">
              AI-Powered Workflow
              <br />
              Integration Systems
            </h3>
            <p className="right-screen-subtitle">Next-Gen Interface</p>
          </div>
        </div>
      </section>

      {/* Minimalist Menu Drawer if clicked */}
      {isMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            background: "#ffffff",
            padding: "20px 24px",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            minWidth: "160px",
          }}
        >
          <a
            href="#projects"
            onClick={() => setIsMenuOpen(false)}
            style={{ fontSize: "14px", color: "#111", fontWeight: 500 }}
          >
            Work
          </a>
          <a
            href="#about"
            onClick={() => setIsMenuOpen(false)}
            style={{ fontSize: "14px", color: "#111", fontWeight: 500 }}
          >
            About
          </a>
          <a
            href="#contact"
            onClick={() => setIsMenuOpen(false)}
            style={{ fontSize: "14px", color: "#111", fontWeight: 500 }}
          >
            Contact
          </a>
        </div>
      )}
    </div>
  );
};

export default App;
