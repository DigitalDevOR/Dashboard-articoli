import { ChevronDown, LogOut, Menu, UserCircle, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCurrentUser, useLogout } from "../../queries/auth.queries";

type HeaderProps = {
    onMenuClick: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [, setLocation] = useLocation();
    const currentUserQuery = useCurrentUser();
    const logoutMutation = useLogout();

    const user = currentUserQuery.data;
    const userName = user ? `${user.nome} ${user.cognome}` : "Utente";
    const userRole = user?.isSuperAdmin ? "Amministratore" : "Utente";

    return (
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6">
            <div className="flex items-center">
            <button
                type="button"
                className="mr-3 rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
                aria-label="Apri menu"
                onClick={onMenuClick}
            >
                <Menu className="h-5 w-5" />
            </button>
            <div>
                <p className="text-sm text-muted-foreground">Gestione contenuti</p>
                <h1 className="text-lg font-semibold">Dashboard articoli</h1>
            </div>
            </div>

            <div className="relative">
                <button
                    type="button"
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                    aria-expanded={isProfileOpen}
                    aria-haspopup="menu"
                    onClick={() => setIsProfileOpen((open) => !open)}
                >
                    <UserCircle className="h-7 w-7 text-primary" />
                    <span className="hidden text-left sm:block">
                        <span className="block font-medium">{userName}</span>
                        <span className="block text-xs text-muted-foreground">{userRole}</span>
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {isProfileOpen && (
                    <div
                        className="absolute right-0 top-12 z-50 w-52 rounded-md border bg-card p-1 shadow-md"
                        role="menu"
                    >
                        <Link
                            href="/profilo"
                            className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-muted"
                            role="menuitem"
                            onClick={() => setIsProfileOpen(false)}
                        >
                            <UserRound className="h-4 w-4" />
                            Gestione profilo
                        </Link>
                        <button
                            type="button"
                            className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-destructive hover:bg-muted"
                            role="menuitem"
                            disabled={logoutMutation.isPending}
                            onClick={() => {
                                logoutMutation.mutate(undefined, {
                                    onSuccess: () => {
                                        setIsProfileOpen(false);
                                        setLocation("/login");
                                    },
                                });
                            }}
                        >
                            <LogOut className="h-4 w-4" />
                            {logoutMutation.isPending ? "Uscita..." : "Esci"}
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}