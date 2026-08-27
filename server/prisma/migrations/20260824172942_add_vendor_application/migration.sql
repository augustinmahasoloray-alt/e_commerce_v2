-- CreateTable
CREATE TABLE "vendor_applications" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "nom_boutique" TEXT NOT NULL,
    "description" TEXT,
    "moyen_paiement" TEXT,
    "numero_paiement" TEXT,
    "statut" "VendorStatus" NOT NULL DEFAULT 'en_attente',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_applications_pkey" PRIMARY KEY ("id")
);
