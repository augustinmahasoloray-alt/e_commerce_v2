const API_URL = import.meta.env.VITE_API_URL;

export const getDefaultAddress = async (token) => {
  const response = await fetch(`${API_URL}/api/addresses/default`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Erreur lors de la récupération de l'adresse.");
  return data.address; // null si aucune adresse
};

export const createAddress = async (token, addressData) => {
  const response = await fetch(`${API_URL}/api/addresses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Erreur lors de la création de l'adresse.");
  return data.address;
};