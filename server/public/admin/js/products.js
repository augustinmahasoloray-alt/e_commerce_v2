// js/products.js

let variantCount = 0;

// Cache des catégories (univers + enfants) et des marques, tel que renvoyé par le backend.
let allCategories = [];
let allBrands = [];

// État du mode édition
let editingProductId = null;
let existingImages = []; // [{ id, url }, ...] du produit en cours d'édition
let imageIdsToDelete = [];

// ============ Ouverture / fermeture du modal ============

async function openProductModal(productId = null) {
    editingProductId = productId;
    document.getElementById("productModal").classList.remove("hidden");
    await loadCategoriesAndBrands();

    if (editingProductId) {
        document.getElementById("productModalTitle").textContent = "Modifier le produit";
        document.getElementById("submitProductBtn").textContent = "Enregistrer les modifications";
        await prefillProductForm(editingProductId);
    } else {
        document.getElementById("productModalTitle").textContent = "Ajouter un produit";
        document.getElementById("submitProductBtn").textContent = "Créer le produit";
        if (document.getElementById("variantsList").children.length === 0) {
            addVariantRow();
        }
    }
}

function closeProductModal() {
    document.getElementById("productModal").classList.add("hidden");
    document.getElementById("productForm").reset();
    document.getElementById("variantsList").innerHTML = "";
    document.getElementById("imagePreviews").innerHTML = "";
    document.getElementById("productFormError").classList.add("hidden");
    document.getElementById("p_subcategory_list").innerHTML = "";
    document.getElementById("p_brand_list").innerHTML = "";
    document.getElementById("existingImagesWrapper").classList.add("hidden");
    document.getElementById("existingImagesList").innerHTML = "";
    variantCount = 0;
    editingProductId = null;
    existingImages = [];
    imageIdsToDelete = [];
}

document.getElementById("openAddProduct").addEventListener("click", () => openProductModal());
document.getElementById("closeModalBtn").addEventListener("click", closeProductModal);
document.getElementById("cancelProductBtn").addEventListener("click", closeProductModal);
document.getElementById("modalBackdrop").addEventListener("click", closeProductModal);

// ============ Préremplissage en mode édition ============

async function prefillProductForm(productId) {
    try {
        const response = await apiFetch(`/api/admin/products/${productId}`);
        if (!response) return;
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Erreur lors du chargement du produit.");

        const p = result.product;

        document.getElementById("p_nom").value = p.nom;
        document.getElementById("p_description").value = p.description || "";
        document.getElementById("p_universe_input").value = p.univers || "";
        document.getElementById("p_subcategory_input").value = p.sous_categorie || "";
        document.getElementById("p_brand_input").value = p.marque || "";
        updateSubcategoryAndBrandLists();
        document.getElementById("p_prix").value = p.prix;
        document.getElementById("p_prix_promo").value = p.prix_promo ?? "";
        document.getElementById("p_etat").value = p.etat;
        document.getElementById("p_livraison_gratuite").checked = p.livraison_gratuite;
        document.getElementById("p_livraison_express").checked = p.livraison_express;
        document.getElementById("p_actif").checked = p.actif;

        document.getElementById("variantsList").innerHTML = "";
        p.variants.forEach((v) => addVariantRow(v));

        existingImages = p.images;
        imageIdsToDelete = [];
        renderExistingImages();
    } catch (err) {
        document.getElementById("productFormError").textContent = err.message;
        document.getElementById("productFormError").classList.remove("hidden");
    }
}

// ============ Images existantes (mode édition) ============

function renderExistingImages() {
    const wrapper = document.getElementById("existingImagesWrapper");
    const list = document.getElementById("existingImagesList");

    if (!editingProductId || existingImages.length === 0) {
        wrapper.classList.add("hidden");
        list.innerHTML = "";
        return;
    }

    wrapper.classList.remove("hidden");
    list.innerHTML = existingImages
        .filter((img) => !imageIdsToDelete.includes(img.id))
        .map(
            (img) => `
                <div class="relative">
                    <img src="${img.url}" class="w-16 h-16 object-cover rounded-md" />
                    <button type="button" data-image-id="${img.id}"
                        class="removeExistingImageBtn absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs leading-none"
                        aria-label="Supprimer cette image">✕</button>
                </div>
            `
        )
        .join("");

    list.querySelectorAll(".removeExistingImageBtn").forEach((btn) => {
        btn.addEventListener("click", () => {
            imageIdsToDelete.push(btn.dataset.imageId);
            renderExistingImages();
        });
    });
}

// ============ Catégories & marques (combobox "choisir ou créer") ============

// Cherche un élément (catégorie ou marque) par nom, insensible à la casse/espaces.
function findByName(list, name) {
    const target = name.trim().toLowerCase();
    if (!target) return null;
    return list.find((item) => item.nom.trim().toLowerCase() === target) || null;
}

async function loadCategoriesAndBrands() {
    const universeList = document.getElementById("p_universe_list");
    const subcategoryList = document.getElementById("p_subcategory_list");
    const brandList = document.getElementById("p_brand_list");

    try {
        const response = await apiFetch("/api/admin/products/meta/categories-brands");
        if (!response) return;
        const result = await response.json();

        allCategories = result.categories; // tableau d'univers (racines), chacun avec .children[]
        allBrands = result.brands;

        // Datalist des univers (catégories racines)
        universeList.innerHTML = allCategories
            .map((u) => `<option value="${escapeHtml(u.nom)}"></option>`)
            .join("");

        // Tant qu'aucun univers n'est reconnu, la sous-catégorie et la marque restent vides
        subcategoryList.innerHTML = "";
        brandList.innerHTML = allBrands.map((b) => `<option value="${escapeHtml(b.nom)}"></option>`).join("");
    } catch (err) {
        console.error("Erreur chargement catégories/marques :", err);
    }
}

// Repeuple la datalist "sous-catégorie" et filtre la datalist "marque" selon l'univers tapé.
function updateSubcategoryAndBrandLists() {
    const universeName = document.getElementById("p_universe_input").value;
    const subcategoryList = document.getElementById("p_subcategory_list");
    const brandList = document.getElementById("p_brand_list");

    const universe = findByName(allCategories, universeName);

    if (!universe) {
        // Univers pas encore reconnu (probablement un nouvel univers en cours de frappe) :
        // pas de sous-catégories connues, et on propose toutes les marques par défaut.
        subcategoryList.innerHTML = "";
        brandList.innerHTML = allBrands.map((b) => `<option value="${escapeHtml(b.nom)}"></option>`).join("");
        return;
    }

    subcategoryList.innerHTML = (universe.children || [])
        .map((c) => `<option value="${escapeHtml(c.nom)}"></option>`)
        .join("");

    const filteredBrands = allBrands.filter((brand) => brand.categories.some((c) => c.id === universe.id));
    brandList.innerHTML = filteredBrands.map((b) => `<option value="${escapeHtml(b.nom)}"></option>`).join("");
}

document.getElementById("p_universe_input").addEventListener("input", updateSubcategoryAndBrandLists);

// ============ Résolution "nom tapé" -> id (crée à la volée si besoin) ============

async function createCategory(nom, parentId) {
    const response = await apiFetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, parent_id: parentId }),
    });
    if (!response) throw new Error("Requête interrompue.");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || `Erreur lors de la création de la catégorie "${nom}".`);
    return result.category;
}

async function createBrand(nom, categoryIds) {
    const response = await apiFetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, category_ids: categoryIds }),
    });
    if (!response) throw new Error("Requête interrompue.");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || `Erreur lors de la création de la marque "${nom}".`);
    return result.brand;
}

// Résout les champs Univers / Sous-catégorie / Marque du formulaire en ids réels,
// en créant en base ce qui n'existe pas encore.
async function resolveCategoryAndBrand() {
    const universeName = document.getElementById("p_universe_input").value.trim();
    const subcategoryName = document.getElementById("p_subcategory_input").value.trim();
    const brandName = document.getElementById("p_brand_input").value.trim();

    if (!universeName) throw new Error("Indique un univers.");
    if (!brandName) throw new Error("Indique une marque.");

    // 1) Univers : existant ou à créer
    let universe = findByName(allCategories, universeName);
    if (!universe) {
        universe = await createCategory(universeName, null);
        universe.children = [];
        allCategories.push(universe);
    }

    // 2) Sous-catégorie (optionnelle) : existante ou à créer, sous cet univers
    let categoryId = universe.id;
    if (subcategoryName) {
        let subcategory = findByName(universe.children || [], subcategoryName);
        if (!subcategory) {
            subcategory = await createCategory(subcategoryName, universe.id);
            universe.children = universe.children || [];
            universe.children.push(subcategory);
        }
        categoryId = subcategory.id;
    }

    // 3) Marque : existante (liée ou non à cet univers) ou à créer, liée à cet univers
    let brand = findByName(allBrands, brandName);
    if (!brand) {
        brand = await createBrand(brandName, [universe.id]);
        allBrands.push(brand);
    }

    return { categoryId, brandId: brand.id };
}

// ============ Variantes dynamiques ============

// variant = null en création, ou { id, taille, couleur, stock, sku } en édition/prérempli
function addVariantRow(variant = null) {
    variantCount++;
    const id = variantCount;

    const row = document.createElement("div");
    row.className = "grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center";
    row.dataset.variantId = id;
    if (variant?.id) row.dataset.dbId = variant.id;

    row.innerHTML = `
        <input type="text" placeholder="Taille" data-field="taille" required value="${escapeHtml(variant?.taille ?? "")}"
            class="px-3 py-2 rounded-md bg-backgroundColor border border-muted/30 outline-none text-sm focus:ring-2 focus:ring-accent" />
        <input type="text" placeholder="Couleur" data-field="couleur" required value="${escapeHtml(variant?.couleur ?? "")}"
            class="px-3 py-2 rounded-md bg-backgroundColor border border-muted/30 outline-none text-sm focus:ring-2 focus:ring-accent" />
        <input type="number" placeholder="Stock" data-field="stock" min="0" required value="${variant?.stock ?? ""}"
            class="px-3 py-2 rounded-md bg-backgroundColor border border-muted/30 outline-none text-sm focus:ring-2 focus:ring-accent" />
        <input type="text" placeholder="SKU" data-field="sku" required value="${escapeHtml(variant?.sku ?? "")}"
            class="px-3 py-2 rounded-md bg-backgroundColor border border-muted/30 outline-none text-sm focus:ring-2 focus:ring-accent" />
        <button type="button" class="removeVariantBtn text-red-500 hover:text-red-600 text-sm px-2" aria-label="Supprimer la variante">✕</button>
    `;

    row.querySelector(".removeVariantBtn").addEventListener("click", () => row.remove());
    document.getElementById("variantsList").appendChild(row);
}

document.getElementById("addVariantBtn").addEventListener("click", () => addVariantRow());

function collectVariants() {
    const rows = document.querySelectorAll("#variantsList > div");
    return Array.from(rows).map((row) => {
        const variant = {
            taille: row.querySelector('[data-field="taille"]').value,
            couleur: row.querySelector('[data-field="couleur"]').value,
            stock: row.querySelector('[data-field="stock"]').value,
            sku: row.querySelector('[data-field="sku"]').value,
        };
        if (row.dataset.dbId) variant.id = row.dataset.dbId;
        return variant;
    });
}

// ============ Prévisualisation des nouvelles images ============

document.getElementById("p_images").addEventListener("change", (e) => {
    const preview = document.getElementById("imagePreviews");
    preview.innerHTML = "";

    Array.from(e.target.files)
        .slice(0, 6)
        .forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = document.createElement("img");
                img.src = reader.result;
                img.className = "w-16 h-16 object-cover rounded-md";
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
});

// ============ Soumission du formulaire (création ou édition) ============

document.getElementById("productForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const errorMsg = document.getElementById("productFormError");
    const submitBtn = document.getElementById("submitProductBtn");
    errorMsg.classList.add("hidden");

    const variants = collectVariants();
    if (variants.length === 0) {
        errorMsg.textContent = "Ajoute au moins une variante.";
        errorMsg.classList.remove("hidden");
        return;
    }

    const remainingExisting = existingImages.length - imageIdsToDelete.length;
    const newFilesCount = document.getElementById("p_images").files.length;
    if (remainingExisting + newFilesCount > 6) {
        errorMsg.textContent = "Un produit ne peut pas avoir plus de 6 images.";
        errorMsg.classList.remove("hidden");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = editingProductId ? "Enregistrement..." : "Création en cours...";

    try {
        // Résout (et crée si besoin) l'univers, la sous-catégorie et la marque tapés.
        const { categoryId, brandId } = await resolveCategoryAndBrand();

        const formData = new FormData();
        formData.append("nom", document.getElementById("p_nom").value);
        formData.append("description", document.getElementById("p_description").value);
        formData.append("category_id", categoryId);
        formData.append("brand_id", brandId);
        formData.append("prix", document.getElementById("p_prix").value);
        formData.append("prix_promo", document.getElementById("p_prix_promo").value || "");
        formData.append("etat", document.getElementById("p_etat").value);
        formData.append("livraison_gratuite", document.getElementById("p_livraison_gratuite").checked);
        formData.append("livraison_express", document.getElementById("p_livraison_express").checked);
        formData.append("variants", JSON.stringify(variants));

        if (editingProductId) {
            formData.append("actif", document.getElementById("p_actif").checked);
            formData.append("deleted_image_ids", JSON.stringify(imageIdsToDelete));
        }

        const imageFiles = document.getElementById("p_images").files;
        Array.from(imageFiles).forEach((file) => formData.append("images", file));

        const url = editingProductId ? `/api/admin/products/${editingProductId}` : "/api/admin/products";
        const method = editingProductId ? "PUT" : "POST";

        const response = await apiFetch(url, { method, body: formData });
        if (!response) return;

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Erreur lors de l'enregistrement du produit.");
        }

        closeProductModal();
        loadProducts();
    } catch (err) {
        errorMsg.textContent = err.message;
        errorMsg.classList.remove("hidden");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = editingProductId ? "Enregistrer les modifications" : "Créer le produit";
    }
});

// ============ Chargement & rendu du tableau produits ============

async function loadProducts() {
    const tbody = document.getElementById("productsTableBody");
    tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-8 text-center text-muted">Chargement...</td></tr>`;

    try {
        const response = await apiFetch("/api/admin/products");
        if (!response) return;
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Erreur lors du chargement des produits.");
        }

        if (result.products.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-8 text-center text-muted">Aucun produit pour l'instant.</td></tr>`;
            return;
        }

        tbody.innerHTML = result.products
            .map((p) => {
                const stockColor =
                    p.statut_stock === "Rupture" ? "text-muted" : p.statut_stock === "En stock" ? "text-accent" : "text-orange-500";

                return `
                    <tr class="border-b border-muted/10 last:border-0">
                        <td class="px-5 py-3">${escapeHtml(p.nom)}</td>
                        <td class="px-5 py-3 text-muted">${escapeHtml(p.categorie ?? "—")}</td>
                        <td class="px-5 py-3">${Number(p.prix).toFixed(2)} Ar</td>
                        <td class="px-5 py-3">${p.stock_total}</td>
                        <td class="px-5 py-3 ${stockColor}">${p.statut_stock}</td>
                        <td class="px-5 py-3 text-right whitespace-nowrap">
                            <button data-id="${p.id}" class="editProductBtn text-accent hover:underline text-xs mr-3">Modifier</button>
                            <button data-id="${p.id}" class="deleteProductBtn text-red-500 hover:underline text-xs">Supprimer</button>
                        </td>
                    </tr>
                `;
            })
            .join("");

        document.querySelectorAll(".editProductBtn").forEach((btn) => {
            btn.addEventListener("click", () => openProductModal(btn.dataset.id));
        });

        document.querySelectorAll(".deleteProductBtn").forEach((btn) => {
            btn.addEventListener("click", () => deleteProduct(btn.dataset.id));
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-8 text-center text-red-500">${escapeHtml(err.message)}</td></tr>`;
    }
}

async function deleteProduct(id) {
    if (!confirm("Supprimer ce produit définitivement ?")) return;

    try {
        const response = await apiFetch(`/api/admin/products/${id}`, { method: "DELETE" });
        if (!response) return;
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || "Erreur lors de la suppression.");
        }
        loadProducts();
    } catch (err) {
        alert(err.message);
    }
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
}

// Charge le tableau au premier affichage de la section Produits
document.querySelector('[data-section="products"]').addEventListener("click", loadProducts);