const ORDER_STATUTS = [
    { value: "", label: "Toutes" },
    { value: "en_attente", label: "En attente" },
    { value: "confirmee", label: "Confirmées" },
    { value: "expediee", label: "Expédiées" },
    { value: "livree", label: "Livrées" },
    { value: "annulee", label: "Annulées" },
];

const STATUT_BADGE_CLASS = {
    en_attente: "bg-yellow-500/15 text-yellow-600",
    confirmee: "bg-blue-500/15 text-blue-600",
    expediee: "bg-indigo-500/15 text-indigo-600",
    livree: "bg-green-500/15 text-green-600",
    annulee: "bg-red-500/15 text-red-600",
};

let currentOrderStatut = "";
let currentOrderPage = 1;
const ORDER_PAGE_SIZE = 20;

function formatMontantOrder(valeur) {
    return `${Number(valeur).toFixed(2)} Ar`;
}

function formatDateOrder(dateStr) {
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function orderStatutLabel(statut) {
    return ORDER_STATUTS.find((s) => s.value === statut)?.label || statut;
}

async function loadOrders(statut = currentOrderStatut, page = currentOrderPage) {
    currentOrderStatut = statut;
    currentOrderPage = page;

    const tbody = document.getElementById("ordersTableBody");
    tbody.innerHTML = `<tr><td colspan="7" class="px-5 py-8 text-center text-muted">Chargement...</td></tr>`;

    try {
        const params = new URLSearchParams({ page, limit: ORDER_PAGE_SIZE });
        if (statut) params.set("statut", statut);

        const response = await apiFetch(`/api/admin/orders?${params.toString()}`);
        if (!response) return;
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Erreur lors du chargement des commandes.");
        }

        renderOrderTabs(result.counts);
        renderOrdersTable(result.orders);
    } catch (err) {
        console.error("Erreur chargement commandes :", err);
        tbody.innerHTML = `<tr><td colspan="7" class="px-5 py-8 text-center text-red-500">Impossible de charger les commandes.</td></tr>`;
    }
}

function renderOrderTabs(counts) {
    const wrapper = document.getElementById("orderStatusTabs");
    wrapper.innerHTML = ORDER_STATUTS.map(({ value, label }) => {
        const count = value === "" ? counts.toutes : (counts[value] ?? 0);
        const isActive = value === currentOrderStatut;
        return `
            <button data-statut="${value}"
                class="order-tab px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? "bg-accent text-backgroundColor" : "bg-surfaceColor text-muted hover:bg-backgroundColor"}">
                ${label} <span class="ml-1 opacity-70">${count}</span>
            </button>`;
    }).join("");

    wrapper.querySelectorAll(".order-tab").forEach((btn) => {
        btn.addEventListener("click", () => loadOrders(btn.dataset.statut, 1));
    });
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById("ordersTableBody");

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-5 py-8 text-center text-muted">Aucune commande.</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map((vo) => {
        const client = vo.order.user;
        const badgeClass = STATUT_BADGE_CLASS[vo.statut] || "bg-muted/15 text-muted";
        return `
            <tr class="border-b border-muted/10 hover:bg-backgroundColor/50 cursor-pointer order-row" data-vendor-order-id="${vo.id}">
                <td class="px-5 py-3">${client.prenom} ${client.nom}</td>
                <td class="px-5 py-3 text-muted">${formatDateOrder(vo.order.date_commande)}</td>
                <td class="px-5 py-3">${formatMontantOrder(vo.montant_total)}</td>
                <td class="px-5 py-3 text-muted">${vo.order.mode_paiement}</td>
                <td class="px-5 py-3 text-muted">${vo.order.mode_livraison}</td>
                <td class="px-5 py-3"><span class="px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}">${orderStatutLabel(vo.statut)}</span></td>
                <td class="px-5 py-3 text-right text-muted">→</td>
            </tr>`;
    }).join("");

    tbody.querySelectorAll(".order-row").forEach((row) => {
        row.addEventListener("click", () => openOrderDetail(row.dataset.vendorOrderId));
    });
}

async function openOrderDetail(vendorOrderId) {
    const modal = document.getElementById("orderModal");
    const body = document.getElementById("orderModalBody");
    modal.classList.remove("hidden");
    body.innerHTML = `<p class="text-muted text-sm">Chargement...</p>`;

    try {
        const response = await apiFetch(`/api/admin/orders/${vendorOrderId}`);
        if (!response) return;
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Erreur lors du chargement de la commande.");
        }

        renderOrderDetail(result.order);
    } catch (err) {
        body.innerHTML = `<p class="text-sm text-red-500">Impossible de charger cette commande.</p>`;
    }
}

function renderOrderDetail(vo) {
    const body = document.getElementById("orderModalBody");
    const client = vo.order.user;
    const address = vo.order.address;

    const itemsHtml = vo.items.map((item) => `
        <div class="flex justify-between text-sm py-2 border-b border-muted/10 last:border-0">
            <span>${item.variant.product.nom} × ${item.quantite}</span>
            <span class="text-muted">${formatMontantOrder(item.prix_unitaire * item.quantite)}</span>
        </div>`).join("");

    body.innerHTML = `
        <div class="space-y-4">
            <div>
                <p class="text-xs text-muted mb-1">Client</p>
                <p class="text-sm">${client.prenom} ${client.nom} — ${client.email}</p>
                <p class="text-sm text-muted">${client.telephone ?? ""}</p>
            </div>
            <div>
                <p class="text-xs text-muted mb-1">Adresse de livraison</p>
                <p class="text-sm">${address.ligne1}, ${address.ville} ${address.code_postal}, ${address.pays}</p>
            </div>
            <div>
                <p class="text-xs text-muted mb-1">Articles</p>
                ${itemsHtml}
            </div>
            <div class="flex justify-between text-sm font-medium pt-2">
                <span>Total</span>
                <span>${formatMontantOrder(vo.montant_total)}</span>
            </div>
            <div>
                <label class="block text-xs text-muted mb-2">Statut</label>
                <select id="orderStatutSelect" class="w-full px-3 py-2 rounded-md bg-backgroundColor border border-muted/30 outline-none text-sm">
                    ${ORDER_STATUTS.filter((s) => s.value).map((s) => `<option value="${s.value}" ${s.value === vo.statut ? "selected" : ""}>${s.label}</option>`).join("")}
                </select>
            </div>
            <p id="orderDetailError" class="text-sm text-red-500 hidden"></p>
            <button id="saveOrderStatutBtn" data-vendor-order-id="${vo.id}"
                class="w-full bg-accent text-backgroundColor text-sm font-medium py-2.5 rounded-md hover:opacity-90 transition-opacity">
                Mettre à jour le statut
            </button>
        </div>`;

    document.getElementById("saveOrderStatutBtn").addEventListener("click", saveOrderStatut);
}

async function saveOrderStatut(e) {
    const btn = e.currentTarget;
    const vendorOrderId = btn.dataset.vendorOrderId;
    const statut = document.getElementById("orderStatutSelect").value;
    const errorEl = document.getElementById("orderDetailError");
    errorEl.classList.add("hidden");
    btn.disabled = true;
    btn.textContent = "Mise à jour...";

    try {
        const response = await apiFetch(`/api/admin/orders/${vendorOrderId}/statut`, {
            method: "PUT",
            body: JSON.stringify({ statut }),
        });
        if (!response) return;
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Erreur lors de la mise à jour.");
        }

        document.getElementById("orderModal").classList.add("hidden");
        loadOrders(currentOrderStatut, currentOrderPage);
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove("hidden");
    } finally {
        btn.disabled = false;
        btn.textContent = "Mettre à jour le statut";
    }
}

document.getElementById("closeOrderModalBtn")?.addEventListener("click", () => {
    document.getElementById("orderModal").classList.add("hidden");
});
document.getElementById("orderModalBackdrop")?.addEventListener("click", () => {
    document.getElementById("orderModal").classList.add("hidden");
});

document.querySelector('[data-section="orders"]')?.addEventListener("click", () => loadOrders("", 1), { once: true });