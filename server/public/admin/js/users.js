let currentUserRole = "client";
let currentUserPage = 1;
let currentUserSearch = "";
const USER_PAGE_SIZE = 20;
let userSearchTimeout = null;

function formatDateUser(dateStr) {
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

async function loadUsers(role = currentUserRole, page = currentUserPage, recherche = currentUserSearch) {
    currentUserRole = role;
    currentUserPage = page;
    currentUserSearch = recherche;

    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-8 text-center text-muted">Chargement...</td></tr>`;

    try {
        const params = new URLSearchParams({ role, page, limit: USER_PAGE_SIZE });
        if (recherche) params.set("recherche", recherche);

        const response = await apiFetch(`/api/admin/users?${params.toString()}`);
        if (!response) return;
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Erreur lors du chargement des utilisateurs.");
        }

        renderUserTabs(result.counts);
        renderUsersTable(result.users);
    } catch (err) {
        console.error("Erreur chargement utilisateurs :", err);
        tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-8 text-center text-red-500">Impossible de charger les utilisateurs.</td></tr>`;
    }
}

function renderUserTabs(counts) {
    const wrapper = document.getElementById("userRoleTabs");
    const tabs = [
        { value: "client", label: "Clients" },
        { value: "vendeur", label: "Vendeurs" },
    ];

    wrapper.innerHTML = tabs.map(({ value, label }) => {
        const isActive = value === currentUserRole;
        return `
            <button data-role="${value}"
                class="user-tab px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? "bg-accent text-backgroundColor" : "bg-surfaceColor text-muted hover:bg-backgroundColor"}">
                ${label} <span class="ml-1 opacity-70">${counts[value] ?? 0}</span>
            </button>`;
    }).join("");

    wrapper.querySelectorAll(".user-tab").forEach((btn) => {
        btn.addEventListener("click", () => loadUsers(btn.dataset.role, 1, currentUserSearch));
    });
}

function renderUsersTable(users) {
    const tbody = document.getElementById("usersTableBody");

    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-8 text-center text-muted">Aucun utilisateur.</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map((u) => {
        const badgeClass = u.compte_actif
            ? "bg-green-500/15 text-green-600"
            : "bg-red-500/15 text-red-600";
        const statutLabel = u.compte_actif ? "Actif" : "Bloqué";
        const actionLabel = u.compte_actif ? "Bloquer" : "Débloquer";
        const actionClass = u.compte_actif
            ? "text-red-500 hover:underline"
            : "text-green-600 hover:underline";

        return `
            <tr class="border-b border-muted/10">
                <td class="px-5 py-3">${u.prenom} ${u.nom}</td>
                <td class="px-5 py-3 text-muted">${u.email}</td>
                <td class="px-5 py-3 text-muted">${u.telephone ?? "—"}</td>
                <td class="px-5 py-3 text-muted">${formatDateUser(u.date_creation)}</td>
                <td class="px-5 py-3"><span class="px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}">${statutLabel}</span></td>
                <td class="px-5 py-3 text-right">
                    <button class="toggle-user-status text-sm font-medium ${actionClass}"
                        data-user-id="${u.id}" data-next-status="${!u.compte_actif}">
                        ${actionLabel}
                    </button>
                </td>
            </tr>`;
    }).join("");

    tbody.querySelectorAll(".toggle-user-status").forEach((btn) => {
        btn.addEventListener("click", () => toggleUserStatus(btn));
    });
}

async function toggleUserStatus(btn) {
    const userId = btn.dataset.userId;
    const nextStatus = btn.dataset.nextStatus === "true";
    const confirmMsg = nextStatus
        ? "Débloquer ce compte ?"
        : "Bloquer ce compte ? L'utilisateur ne pourra plus se connecter.";

    if (!confirm(confirmMsg)) return;

    btn.disabled = true;
    try {
        const response = await apiFetch(`/api/admin/users/${userId}/statut`, {
            method: "PUT",
            body: JSON.stringify({ compte_actif: nextStatus }),
        });
        if (!response) return;
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Erreur lors de la mise à jour du statut.");
        }

        loadUsers(currentUserRole, currentUserPage, currentUserSearch);
    } catch (err) {
        alert(err.message);
        btn.disabled = false;
    }
}

document.getElementById("userSearchInput")?.addEventListener("input", (e) => {
    clearTimeout(userSearchTimeout);
    userSearchTimeout = setTimeout(() => loadUsers(currentUserRole, 1, e.target.value.trim()), 300);
});

document.querySelector('[data-section="users"]')?.addEventListener("click", () => loadUsers("client", 1, ""), { once: true });