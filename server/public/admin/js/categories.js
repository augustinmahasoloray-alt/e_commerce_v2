// server/public/admin/js/categories.js

let categoriesCache = [];

// ============ Basculer le formulaire selon le type (univers / sous-catégorie) ============

document.getElementById("cat_type").addEventListener("change", (e) => {
    const parentWrapper = document.getElementById("cat_parent_wrapper");
    if (e.target.value === "sous-categorie") {
        parentWrapper.classList.remove("hidden");
    } else {
        parentWrapper.classList.add("hidden");
    }
});

// ============ Chargement des catégories (univers + sous-catégories) ============

async function loadCategoriesSection() {
    const tree = document.getElementById("categoriesTree");
    const parentSelect = document.getElementById("cat_parent");
    const universesWrapper = document.getElementById("brand_universes");

    tree.innerHTML = "Chargement...";

    try {
        const response = await apiFetch("/api/admin/categories");
        if (!response) return;
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Erreur lors du chargement des catégories.");

        categoriesCache = result.categories;

        // Arbre univers -> sous-catégories
        if (categoriesCache.length === 0) {
            tree.innerHTML = `<p class="text-muted">Aucun univers pour l'instant.</p>`;
        } else {
            tree.innerHTML = categoriesCache
                .map((univers) => `
                    <div>
                        <p class="font-medium text-accent">${escapeHtml(univers.nom)}</p>
                        <div class="flex flex-wrap gap-2 mt-2">
                            ${
                                univers.children.length > 0
                                    ? univers.children
                                          .map((c) => `<span class="px-3 py-1 rounded-full bg-backgroundColor text-xs text-muted">${escapeHtml(c.nom)}</span>`)
                                          .join("")
                                    : `<span class="text-xs text-muted italic">Aucune sous-catégorie</span>`
                            }
                        </div>
                    </div>
                `)
                .join("");
        }

        // Select "univers parent" pour créer une sous-catégorie
        parentSelect.innerHTML = categoriesCache
            .map((u) => `<option value="${u.id}">${escapeHtml(u.nom)}</option>`)
            .join("") || `<option value="">Aucun univers — crée-en un d'abord</option>`;

        // Checkboxes univers pour la création de marque
        universesWrapper.innerHTML = categoriesCache
            .map(
                (u) => `
                    <label class="flex items-center gap-2 text-sm text-muted cursor-pointer">
                        <input type="checkbox" value="${u.id}" class="brandUniversCheckbox accent-accent" />
                        ${escapeHtml(u.nom)}
                    </label>
                `
            )
            .join("") || `<span class="text-xs text-muted italic">Aucun univers — crée-en un d'abord</span>`;
    } catch (err) {
        tree.innerHTML = `<p class="text-red-500">${escapeHtml(err.message)}</p>`;
    }
}

// ============ Soumission : nouvelle catégorie (univers ou sous-catégorie) ============

document.getElementById("categoryForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const errorMsg = document.getElementById("categoryFormError");
    errorMsg.classList.add("hidden");

    const type = document.getElementById("cat_type").value;
    const nom = document.getElementById("cat_nom").value.trim();
    const parentId = document.getElementById("cat_parent").value;

    if (type === "sous-categorie" && !parentId) {
        errorMsg.textContent = "Choisis un univers parent.";
        errorMsg.classList.remove("hidden");
        return;
    }

    try {
        const response = await apiFetch("/api/admin/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nom,
                parent_id: type === "sous-categorie" ? parentId : null,
            }),
        });
        if (!response) return;

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Erreur lors de la création.");

        document.getElementById("categoryForm").reset();
        document.getElementById("cat_parent_wrapper").classList.add("hidden");
        loadCategoriesSection();
    } catch (err) {
        errorMsg.textContent = err.message;
        errorMsg.classList.remove("hidden");
    }
});

// ============ Soumission : nouvelle marque ============

document.getElementById("brandForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const errorMsg = document.getElementById("brandFormError");
    errorMsg.classList.add("hidden");

    const nom = document.getElementById("brand_nom").value.trim();
    const categoryIds = Array.from(document.querySelectorAll(".brandUniversCheckbox:checked")).map((cb) => cb.value);

    try {
        const response = await apiFetch("/api/admin/brands", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nom, category_ids: categoryIds }),
        });
        if (!response) return;

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Erreur lors de la création.");

        document.getElementById("brandForm").reset();
        loadCategoriesSection();
        loadBrandsSection();
    } catch (err) {
        errorMsg.textContent = err.message;
        errorMsg.classList.remove("hidden");
    }
});

// ============ Liste des marques ============

async function loadBrandsSection() {
    const list = document.getElementById("brandsList");
    list.innerHTML = "Chargement...";

    try {
        const response = await apiFetch("/api/admin/brands");
        if (!response) return;
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Erreur lors du chargement des marques.");

        if (result.brands.length === 0) {
            list.innerHTML = `<p class="text-muted text-sm">Aucune marque pour l'instant.</p>`;
            return;
        }

        list.innerHTML = result.brands
            .map((b) => {
                const universes = b.categories.map((c) => c.nom).join(", ") || "Aucun univers";
                return `<span class="px-3 py-1.5 rounded-full bg-backgroundColor text-xs" title="${escapeHtml(universes)}">${escapeHtml(b.nom)} <span class="text-muted">— ${escapeHtml(universes)}</span></span>`;
            })
            .join("");
    } catch (err) {
        list.innerHTML = `<p class="text-red-500 text-sm">${escapeHtml(err.message)}</p>`;
    }
}

// Charge la section au premier affichage
document.querySelector('[data-section="categories"]').addEventListener("click", () => {
    loadCategoriesSection();
    loadBrandsSection();
});