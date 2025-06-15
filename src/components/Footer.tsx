function Footer() {
  return (
    <footer className="footer footer-center justify-between bg-base-100 text-base-content p-2">
      <p>© {new Date().getFullYear()} </p>
      <a
        className="link"
        href="https://github.com/fm-anderson"
        target="_blank"
        rel="noopener noreferrer"
      >
        fm-anderson
      </a>
    </footer>
  );
}

export default Footer;
