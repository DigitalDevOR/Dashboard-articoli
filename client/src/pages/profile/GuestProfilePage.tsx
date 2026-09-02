import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle2, Trophy, Users, CreditCard } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';

export default function GuestProfilePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="page-container bg-neutral-50">
      <Header showLogo={false} showMenu={true} title="Profilo" />
      
      <div className="p-4 flex flex-col items-center space-y-6">
        <div className="relative w-full">
          <div className="bg-primary h-20 w-full rounded-lg"></div>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-12">
            <div className="bg-white p-2 rounded-full shadow-md">
              <UserCircle2 className="h-20 w-20 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="mt-14 w-full">
          <Card className="border-none shadow-sm">
            <CardHeader className="text-center">
              <CardTitle>Crea il tuo profilo</CardTitle>
              <CardDescription>
                Registrati per iniziare a giocare e guadagnare crediti!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 py-2">
              <div className="flex items-center space-x-4">
                <Trophy className="h-8 w-8 text-amber-500" />
                <div>
                  <h3 className="font-medium">Partecipa ai tornei</h3>
                  <p className="text-sm text-muted-foreground">Competi con altri giocatori e vinci premi</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <CreditCard className="h-8 w-8 text-emerald-500" />
                <div>
                  <h3 className="font-medium">Guadagna crediti</h3>
                  <p className="text-sm text-muted-foreground">Fai pronostici corretti e accumula punti</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-medium">Invita amici</h3>
                  <p className="text-sm text-muted-foreground">Ottieni bonus per ogni amico che inviti</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                className="w-full"
                onClick={() => setLocation('/auth/register')}
              >
                Registrati ora
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <BottomNavigation activeItem="profile" />
    </div>
  );
}