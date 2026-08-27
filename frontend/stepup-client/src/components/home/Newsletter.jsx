import { useState } from "react";
import { Send } from "lucide-react";

function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: brancher sur le service newsletter
  };

  return (
    <section className="w-full bg-backgroundColor py-24 sm:py-28 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40">
      <div className="max-w-xl mx-auto text-center">
        <p className="font-body text-sm tracking-[0.2em] uppercase text-accent mb-5">
          Restez informé
        </p>

        <h2 className="font-headline text-2xl sm:text-3xl text-textColor tracking-wide mb-4">
          Les dernières découvertes. Dans votre boîte mail.
        </h2>

        <p className="font-body text-base text-muted leading-relaxed mb-10">
          Recevez nos sélections, les nouveautés des créateurs et nos coups de cœur avant tout le monde.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 border-b border-muted/30 focus-within:border-accent transition-colors duration-300 max-w-md mx-auto"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre adresse e-mail"
            className="bg-transparent flex-1 py-3 text-sm font-body text-textColor placeholder:text-muted outline-none"
          />
          <button
            type="submit"
            aria-label="S'inscrire"
            className="flex items-center gap-2 text-accent font-body text-sm hover:opacity-80 transition-opacity duration-200"
          >
            S'inscrire
            <Send size={16} />
          </button>
        </form>

        <p className="font-body text-xs text-muted mt-6">
          Nous respectons votre vie privée. Désabonnez-vous en un clic.
        </p>
      </div>
    </section>
  );
}

export default Newsletter;