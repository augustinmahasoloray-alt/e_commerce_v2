// js/theme.js
// Applique le thème stocké AVANT le premier paint pour éviter le flash,
// et expose window.toggleTheme() pour le bouton de bascule.

(function initTheme() {
    const stored = localStorage.getItem("admin-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = stored ? stored === "dark" : prefersDark;

    if (shouldBeDark) {
        document.documentElement.classList.add("dark");
    }
})();

window.toggleTheme = function () {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("admin-theme", isDark ? "dark" : "light");
};