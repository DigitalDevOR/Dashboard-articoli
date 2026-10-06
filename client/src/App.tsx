import "./index.css";
import { Loader2 } from "lucide-react";
import { Redirect, Route, Switch } from "wouter";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Roles from "./pages/Roles";
import Users from "./pages/Users";
import WordpressSites from "./pages/WordpressSites";
import Articoli from "./pages/Articoli";
import { useCurrentUser } from "./queries/auth.queries";

function ManagementPlaceholder({ title }: { title: string }) {
    return (
        <section className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="text-muted-foreground">Questa sezione è pronta per essere implementata.</p>
        </section>
    );
}

function ProtectedRoutes() {
    const currentUserQuery = useCurrentUser();

    if (currentUserQuery.isPending) {
        return (
            <main className="flex min-h-screen items-center justify-center" aria-label="Caricamento">
                <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
            </main>
        );
    }

    if (currentUserQuery.isError || !currentUserQuery.data) {
        return <Redirect to="/login" />;
    }

    return (
        <DashboardLayout>
            <Switch>
                <Route path="/">
                    <Redirect to="/upload-articoli" />
                </Route>
                <Route path="/upload-articoli">
                    <Articoli />
                </Route>
                <Route path="/gestione-utenti">
                    <Users />
                </Route>
                <Route path="/gestione-ruoli">
                    <Roles />
                </Route>
                <Route path="/gestione-siti-wordpress">
                    <WordpressSites />
                </Route>
                <Route path="/profilo">
                    <Profile />
                </Route>
                <Route component={NotFound} />
            </Switch>
        </DashboardLayout>
    );
}

function App() {
    return (
        <Switch>
            <Route path="/login" component={Login} />
            <Route>
                <ProtectedRoutes />
            </Route>
        </Switch>
    );
}

export default App;
