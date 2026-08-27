// Petit wrapper autour de fetch pour le dashboard admin.
// Ajoute automatiquement le token JWT stocké en localStorage
// et redirige vers /admin/index.html si la session est invalide/expirée.

const API_BASE = "http://localhost:3000";

async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("admin_token");

    const headers = {
        ...(options.headers || {}),
    };

    // Ne pas forcer Content-Type si le body est un FormData (upload de fichier)
    if (!(options.body instanceof FormData) && options.body) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        window.location.href = "/admin/index.html";
        return null;
    }

    return response;
}