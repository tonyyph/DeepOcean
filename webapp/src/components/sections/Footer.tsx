import Image from "next/image";
import { footerGroups } from "@/content/landingContent";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <a href="#hero">
            <Image src="/assets/app-icon.png" alt="" width={42} height={42} />
            <span>Deep Ocean</span>
          </a>
          <p>Focus dives for calmer, more visible progress.</p>
        </div>
        {footerGroups.map((group) => (
          <div className="footer-group" key={group.title}>
            <strong>{group.title}</strong>
            {group.links.map((link) => (
              <a href={link.href} key={link.label}>{link.label}</a>
            ))}
          </div>
        ))}
      </div>
      <div id="legal-placeholder" className="footer-bottom">
        <span>© {new Date().getFullYear()} Deep Ocean</span>
        <span id="contact-placeholder">
          Contact, legal URLs, and store listing links pending.
        </span>
      </div>
    </footer>
  );
}
