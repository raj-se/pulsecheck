// Runs before hydration to avoid a light/dark flash on load.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var theme = window.localStorage.getItem("pulsecheck:theme") || "dark";
    var resolved = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    if (resolved === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export function ThemeScript() {
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
