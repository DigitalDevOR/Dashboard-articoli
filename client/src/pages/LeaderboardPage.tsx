import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tournament } from '@/lib/types';
import { Loader2, Trophy, Medal, Award, LogIn, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface LeaderboardEntry {
  user: {
    id: string;
    username: string;
    fullName: string;
  };
  position: number;
  points: number;
}

export default function LeaderboardPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();

  // Carica i dati di classifica per il torneo attivo (se c'è)
  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/tournaments/leaderboard'],
    enabled: !!user && activeTab === 'all',
  });

  // Renderizza il badge di posizione per la classifica

  // Renderizza il badge di posizione
  const renderPositionBadge = (position: number) => {
    if (position === 1) {
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    } else if (position === 2) {
      return <Medal className="w-5 h-5 text-gray-400" />;
    } else if (position === 3) {
      return <Award className="w-5 h-5 text-amber-700" />;
    } else {
      return <span className="text-sm font-medium text-gray-600">{position}°</span>;
    }
  };

  return (
    <div className="page-container bg-neutral-50">
      <Header title="Classifiche" showBackButton={false} />

      <div className="px-4 py-6">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="all">Classifica Generale</TabsTrigger>
            <TabsTrigger value="personal">La mia classifica</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <h2 className="mb-4 text-lg font-semibold">Classifica Generale</h2>

            {!user ? (
              <div className="p-6 py-8 space-y-4 text-center bg-white rounded-lg shadow-sm">
                <LogIn className="w-12 h-12 mx-auto text-primary opacity-80" />
                <h3 className="text-lg font-medium">Accesso richiesto</h3>
                <p className="max-w-xs mx-auto mb-4 text-gray-500">
                  Registrati o accedi per visualizzare la classifica generale dei tornei
                </p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Button
                    variant="default"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => navigate('/auth/login?redirect=/leaderboard')}
                  >
                    Accedi
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/auth/register?redirect=/leaderboard')}
                  >
                    Registrati
                  </Button>
                </div>
              </div>
            ) : isLoadingLeaderboard ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <Card key={index} className={`${entry.position <= 3 ? 'border-primary/20' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 mr-3">
                          {renderPositionBadge(entry.position)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{entry.user.username}</div>
                          <div className="text-sm truncate text-muted-foreground">
                            {entry.user.fullName}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">{entry.points}</div>
                          <div className="text-xs text-muted-foreground">punti</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>Nessun dato disponibile per la classifica generale.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="personal" className="space-y-4">
            <h2 className="mb-4 text-lg font-semibold">La mia classifica</h2>

            {!user ? (
              <div className="p-6 py-8 space-y-4 text-center bg-white rounded-lg shadow-sm">
                <User className="w-12 h-12 mx-auto text-primary opacity-80" />
                <h3 className="text-lg font-medium">Accesso richiesto</h3>
                <p className="max-w-xs mx-auto mb-4 text-gray-500">
                  Registrati o accedi per visualizzare la tua posizione in classifica
                </p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Button
                    variant="default"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => navigate('/auth/login?redirect=/leaderboard')}
                  >
                    Accedi
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/auth/register?redirect=/leaderboard')}
                  >
                    Registrati
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 mr-3">
                      <span className="text-sm font-medium text-primary">42°</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm truncate text-muted-foreground">
                        {user.fullName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">78</div>
                      <div className="text-xs text-muted-foreground">punti</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
}