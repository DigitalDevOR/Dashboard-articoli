import { Link } from "wouter";

export default function NotFound() {
    return (
        <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Pagina non trovata</h2>
            <Link href="/upload-articoli" className="text-primary underline underline-offset-4">
                Torna agli articoli
            </Link>
        </section>
    );
}