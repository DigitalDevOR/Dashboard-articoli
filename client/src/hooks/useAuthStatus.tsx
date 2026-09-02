import { useEffect, useState } from 'react';

export function useAuthStatus() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    
    async function checkAuth() {
        try {
            const res = await fetch( apiBaseUrl+'/api/auth/check-auth', {
                method: 'GET',
                credentials: 'include', // invia i cookie HTTP-only
            });
            const data = await res.json();
            
            if(data.isAuthenticated === false) {
                throw new Error('Utente non autenticato');
            }

            setIsAuthenticated(res.ok);
            localStorage.setItem('isLoggedIn', 'true');
        } catch {
            console.log('effettuo logout');
            await fetch(apiBaseUrl + '/api/auth/logout', {
                method: 'GET',
            });
            setIsAuthenticated(false);
            localStorage.setItem('isLoggedIn', 'false');
           
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        checkAuth();
    }, []);

    return { isAuthenticated, isLoading };
}