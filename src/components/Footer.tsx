function Footer() {
  return (
    <footer className="flex text-sm justify-between text-base-content p-4">
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
