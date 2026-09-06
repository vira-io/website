const ViraPackages = (function () {
  const REGISTRY_URL =
    "https://raw.githubusercontent.com/vira-io/repository/main/repo-list.json";

  // Uzywane WYLACZNIE jesli zywy rejestr jest jeszcze niedostepny
  // (repozytorium dopiero co powstalo / chwilowy problem sieciowy) -
  // zeby strona nigdy nie pokazywala calkiem pustego ekranu przy
  // pierwszym wdrozeniu. Usun, gdy repo-list.json ma juz wiecej wpisow
  // niz to minimalne, startowe.
  const FALLBACK_PACKAGES = [
    {
      name: "pretty-error",
      description:
        "Ladne, kolorowe wyswietlanie bledow HackerScript, w stylu rustc/Elm.",
      type: "git",
      lib: "",
    },
  ];

  async function fetchAll() {
    const res = await fetch(REGISTRY_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (!Array.isArray(data.libraries)) throw new Error("niepoprawny format repo-list.json");
    return data.libraries;
  }

  function installCommand(pkg) {
    return "virus install vira " + pkg.name;
  }

  function typeLabel(type) {
    return (
      {
        git: "git",
        "static-lib": "static-lib",
        "shared-lib": "shared-lib",
        "rust-lib": "rust-lib",
        hlib: "hlib (wkrotce)",
      }[type] || type
    );
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function cardHtml(pkg) {
    return `
      <article class="pkg-card" data-name="${escapeHtml(pkg.name)}" data-type="${escapeHtml(pkg.type)}">
        <div class="pkg-card-top">
          <span class="pkg-name">${escapeHtml(pkg.name)}</span>
          <span class="pkg-type" data-type="${escapeHtml(pkg.type)}">${escapeHtml(typeLabel(pkg.type))}</span>
        </div>
        <p class="pkg-desc">${escapeHtml(pkg.description || "Brak opisu.")}</p>
        <div class="pkg-install">${escapeHtml(installCommand(pkg))}</div>
      </article>
    `;
  }

  function renderSkeletons(container, count) {
    container.innerHTML = Array.from({ length: count })
      .map(() => `<div class="skeleton"></div>`)
      .join("");
  }

  function renderEmpty(container, message) {
    container.innerHTML = `<div class="pkg-empty">${escapeHtml(message)}</div>`;
  }

  function renderError(container, message) {
    container.innerHTML = `<div class="pkg-error">${escapeHtml(message)}</div>`;
  }

  function renderGrid(container, pkgs) {
    if (!pkgs.length) {
      renderEmpty(container, "Brak bibliotek pasujacych do tego wyszukiwania.");
      return;
    }
    container.innerHTML = pkgs.map(cardHtml).join("");
  }

  function filterByType(pkgs, type) {
    if (!type || type === "all") return pkgs;
    return pkgs.filter((p) => p.type === type);
  }

  function search(pkgs, query) {
    const q = query.trim().toLowerCase();
    if (!q) return pkgs;
    return pkgs.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
  }

  async function loadInto(container, { limit, onLoaded } = {}) {
    renderSkeletons(container, limit || 6);
    try {
      let pkgs = await fetchAll();
      if (!pkgs.length) pkgs = FALLBACK_PACKAGES;
      const shown = limit ? pkgs.slice(0, limit) : pkgs;
      renderGrid(container, shown);
      if (onLoaded) onLoaded(pkgs);
    } catch (err) {
      console.warn("vira.io: nie udalo sie pobrac rejestru na zywo, pokazuje dane startowe.", err);
      const pkgs = FALLBACK_PACKAGES;
      const shown = limit ? pkgs.slice(0, limit) : pkgs;
      renderGrid(container, shown);
      if (onLoaded) onLoaded(pkgs);
    }
  }

  return { fetchAll, renderGrid, renderSkeletons, renderEmpty, renderError, filterByType, search, installCommand, loadInto, FALLBACK_PACKAGES };
})();
