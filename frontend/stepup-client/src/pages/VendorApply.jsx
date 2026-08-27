// pages/VendorApply.jsx
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, User, Store, Phone, CreditCard, FileText, Camera } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;
export default function VendorApply() {
    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        nom_boutique: "",
        description: "",
        moyen_paiement: "",
        numero_paiement: "",
        logo: null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Vérifie la taille du fichier (5 Mo max)
            if (file.size > 5 * 1024 * 1024) {
                setError("Le fichier est trop volumineux (max 5 Mo).");
                return;
            }
            setFormData((prev) => ({ ...prev, logo: file }));

            // Créer une URL de prévisualisation
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Validation des champs requis
        const requiredFields = ["nom", "prenom", "email", "nom_boutique", "moyen_paiement", "numero_paiement"];
        const isValid = requiredFields.every((field) => formData[field].trim() !== "");
        if (!isValid) {
            setError("Veuillez remplir tous les champs obligatoires.");
            setIsSubmitting(false);
            return;
        }

        try {
            const data = new FormData();
            Object.keys(formData).forEach((key) => {
                if (key !== "logo" && formData[key]) {
                    data.append(key, formData[key]);
                }
            });
            if (formData.logo) {
                data.append("logo", formData.logo);
            }

            const token = localStorage.getItem("token");

const response = await fetch(`${API_URL}/api/vendor-application/apply`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: data,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Erreur lors de la soumission.");
            }

            setSuccess(true);
            setTimeout(() => navigate("/boutique"), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <main className="min-h-screen font-body bg-backgroundColor text-textColor flex items-center justify-center px-4 py-20">
                <div className="max-w-md text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent flex items-center justify-center">
                        <Store size={40} className="text-backgroundColor" />
                    </div>
                    <h1 className="font-display font-light text-3xl md:text-4xl leading-tight mt-4 mb-4">
                        Candidature envoyée !
                    </h1>
                    <p className="text-muted text-sm leading-relaxed mb-8">
                        Merci pour ton intérêt ! Nous te contacterons bientôt à l’adresse {formData.email}.
                    </p>
                    <Link
                        to="/boutique"
                        className="inline-flex items-center gap-2 bg-accent text-backgroundColor text-sm font-medium px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
                    >
                        Retour à la boutique <ArrowRight size={16} />
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen font-body bg-backgroundColor text-textColor flex items-center justify-center px-4 py-20">
            <div className="w-full max-w-4xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Partie gauche : Illustration et titre */}
                    <div className="text-center lg:text-left">
                        <div className="w-48 h-48 mx-auto lg:mx-0 mb-6 rounded-full bg-accent flex items-center justify-center">
                            <User size={120} className="text-backgroundColor" />
                        </div>
                        <h1 className="font-display font-light text-4xl md:text-5xl leading-tight mb-4">
                            Deviens vendeur sur StepUp
                        </h1>
                        <p className="text-muted text-base leading-relaxed">
                            Rejoins notre plateforme et commence à vendre tes produits à une communauté passionnée.
                            Le processus ne prend que quelques minutes.
                        </p>
                    </div>

                    {/* Partie droite : Formulaire */}
                    <div className="bg-surfaceColor p-8 rounded-lg shadow-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Logo de la boutique */}
                            <div>
                                <label className="block text-sm font-medium text-textColor mb-2">
                                    Logo de ta boutique
                                </label>
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer overflow-hidden"
                                        onClick={triggerFileInput}
                                    >
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Aperçu du logo"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Camera size={40} className="text-muted" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/jpeg, image/png"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={triggerFileInput}
                                        className="text-sm text-accent hover:underline"
                                    >
                                        {previewUrl ? "Changer l'image" : "Ajouter une image"}
                                    </button>
                                </div>
                                <p className="text-xs text-muted mt-2">
                                    Formats acceptés : JPG, PNG. Taille max : 5 Mo.
                                </p>
                            </div>

                            {/* Nom et Prénom */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="nom" className="block text-sm font-medium text-textColor mb-2">
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        id="nom"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                                        placeholder="Doe"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="prenom" className="block text-sm font-medium text-textColor mb-2">
                                        Prénom
                                    </label>
                                    <input
                                        type="text"
                                        id="prenom"
                                        name="prenom"
                                        value={formData.prenom}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                                        placeholder="John"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-textColor mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                                    placeholder="john.doe@example.com"
                                />
                            </div>

                            {/* Téléphone */}
                            <div>
                                <label htmlFor="telephone" className="block text-sm font-medium text-textColor mb-2">
                                    Téléphone
                                </label>
                                <input
                                    type="tel"
                                    id="telephone"
                                    name="telephone"
                                    value={formData.telephone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                                    placeholder="+261 34 123 4567"
                                />
                            </div>

                            {/* Nom de la boutique */}
                            <div>
                                <label htmlFor="nom_boutique" className="block text-sm font-medium text-textColor mb-2">
                                    Nom de la boutique
                                </label>
                                <input
                                    type="text"
                                    id="nom_boutique"
                                    name="nom_boutique"
                                    value={formData.nom_boutique}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                                    placeholder="Ma Boutique"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-textColor mb-2">
                                    Description de ta boutique
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                                    placeholder="Décris ce que tu vends et ce qui rend ta boutique unique..."
                                />
                            </div>

                            {/* Moyen de paiement */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="moyen_paiement" className="block text-sm font-medium text-textColor mb-2">
                                        Moyen de paiement
                                    </label>
                                    <select
                                        id="moyen_paiement"
                                        name="moyen_paiement"
                                        value={formData.moyen_paiement}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                                    >
                                        <option value="" disabled>Sélectionne un moyen</option>
                                        <option value="MVola">MVola</option>
                                        <option value="Orange Money">Orange Money</option>
                                        <option value="Airtel Money">Airtel Money</option>
                                        <option value="Banque">Virement bancaire</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="numero_paiement" className="block text-sm font-medium text-textColor mb-2">
                                        Numéro de compte
                                    </label>
                                    <input
                                        type="text"
                                        id="numero_paiement"
                                        name="numero_paiement"
                                        value={formData.numero_paiement}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                                        placeholder="034 12 345 67"
                                    />
                                </div>
                            </div>

                            {/* Boutons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate("/boutique")}
                                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-md text-textColor hover:bg-gray-100 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent text-backgroundColor rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {isSubmitting ? "Envoi en cours..." : "Soumettre"}
                                    {!isSubmitting && <ArrowRight size={16} />}
                                </button>
                            </div>

                            {error && (
                                <p className="text-sm text-red-500 mt-4 text-center">{error}</p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}