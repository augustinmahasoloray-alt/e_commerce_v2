import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`Le port ${PORT} est déjà utilisé. Arrête l'ancien processus ou change de PORT dans .env.`);
    } else {
        console.error(err);
    }
    process.exit(1);
});