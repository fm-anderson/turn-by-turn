function Footer() {
  return (
    <footer className="flex text-sm justify-between text-base-content md:px-4 md:pb-4 px-6 pb-6 pt-2">
      <p>TurnByTurn © {new Date().getFullYear()} </p>
      <a
        className="link-hover"
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
