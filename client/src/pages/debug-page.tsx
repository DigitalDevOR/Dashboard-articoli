import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function DebugPage() {
  const { user, login, register, logout } = useAuth();
  const [email, setEmail] = useState('user@example.com');
  const [username, setUsername] = useState('testuser');
  const [password, setPassword] = useState('password');
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  const [directApiResponse, setDirectApiResponse] = useState<any>(null);
  const [apiResponseStatus, setApiResponseStatus] = useState<string>('');
  const [apiError, setApiError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Usa useAuth hook
  const handleLogin = async () => {
    try {
      setLoading(true);
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      await register({ 
        username, 
        email, 
        password,
        fullName: username // Usiamo lo username come fullName per semplicità
      });
    } catch (error) {
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check session usando API diretta
  const checkSession = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/debug-session');
      const data = await res.json();
      setDebugInfo(data);
      console.log('Debug session:', data);
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Test diretto delle API di auth (bypassando useAuth)
  const testLoginAPI = async () => {
    try {
      setLoading(true);
      setApiError('');
      setDirectApiResponse(null);
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // importante per i cookie
      });
      
      setApiResponseStatus(`${res.status} ${res.statusText}`);
      
      const data = await res.json();
      setDirectApiResponse(data);
      
      if (!res.ok) {
        setApiError(data.message || 'Errore sconosciuto');
      } else {
        // Ricarica la sessione per verificare l'effetto del login
        checkSession();
      }
    } catch (error: any) {
      console.error('API test error:', error);
      setApiError(error.message || 'Errore nella chiamata API');
    } finally {
      setLoading(false);
    }
  };
  
  const testRegisterAPI = async () => {
    try {
      setLoading(true);
      setApiError('');
      setDirectApiResponse(null);
      
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          email, 
          password,
          fullName: username 
        }),
        credentials: 'include', // importante per i cookie
      });
      
      setApiResponseStatus(`${res.status} ${res.statusText}`);
      
      const data = await res.json();
      setDirectApiResponse(data);
      
      if (!res.ok) {
        setApiError(data.message || 'Errore sconosciuto');
      } else {
        // Ricarica la sessione per verificare l'effetto della registrazione
        checkSession();
      }
    } catch (error: any) {
      console.error('API test error:', error);
      setApiError(error.message || 'Errore nella chiamata API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Debug Autenticazione</CardTitle>
          <CardDescription>
            Testa le funzionalità di login, registrazione e verifica sessione
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 font-semibold">Stato utente:</div>
            <div className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">
              {user ? JSON.stringify(user, null, 2) : 'Non autenticato'}
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between flex-wrap gap-2">
          <Button variant="default" onClick={handleLogin} disabled={loading}>
            Login via Hook
          </Button>
          <Button variant="secondary" onClick={handleRegister} disabled={loading}>
            Registrati via Hook
          </Button>
          <Button variant="outline" onClick={handleLogout} disabled={loading}>
            Logout
          </Button>
          <Button variant="ghost" onClick={checkSession} disabled={loading}>
            Verifica Sessione
          </Button>
        </CardFooter>
      </Card>

      {/* Test API dirette */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test API Dirette</CardTitle>
          <CardDescription>
            Testa le API di autenticazione direttamente, bypassando gli hook
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Button 
              variant="default" 
              onClick={testLoginAPI} 
              disabled={loading}
              className="w-full"
            >
              Testa API Login
            </Button>
            <Button 
              variant="secondary" 
              onClick={testRegisterAPI} 
              disabled={loading}
              className="w-full"
            >
              Testa API Registrazione
            </Button>
          </div>
          
          {apiResponseStatus && (
            <div className="mt-4">
              <div className="font-semibold mb-1">Stato risposta API: {apiResponseStatus}</div>
              {apiError && (
                <div className="bg-red-50 text-red-700 p-3 rounded flex items-start gap-2 text-sm mb-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}
              {directApiResponse && (
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(directApiResponse, null, 2)}
                </pre>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Sessione */}
      {Object.keys(debugInfo).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Sessione</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}