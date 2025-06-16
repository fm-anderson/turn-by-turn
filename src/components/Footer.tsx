function Footer() {
  return (
    <footer className="flex text-sm justify-between text-base-content px-6 pb-6 pt-2">
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
