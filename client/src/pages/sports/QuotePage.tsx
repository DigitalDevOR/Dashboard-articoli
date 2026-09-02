import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/layout/Header';
import { OddsListing } from '@/components/betting/OddsListing';
import { SchedinaSidebar } from '@/components/betting/SchedinaSidebar';
import { BonusBookmakers } from '@/components/betting/BonusBookmakers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockMatches, getUpcomingMatches, getLiveMatches } from '@/mock/mockMatches';
import { Card, CardContent } from '@/components/ui/card';
// Importazione diretta del Footer
import Footer from '../../components/layout/Footer';

export default function QuotePage() {
  const [location] = useLocation();
  const [upcomingMatches, setUpcomingMatches] = useState(getUpcomingMatches());
  const [liveMatches, setLiveMatches] = useState(getLiveMatches());
  
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      
      <main className="flex-1 p-4 page-content">
        <h1 className="text-2xl font-bold mb-4">Quote</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Tabs defaultValue="upcoming" className="mb-6">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="upcoming">Pre-Match</TabsTrigger>
                <TabsTrigger value="live">Live</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="mt-4">
                <OddsListing 
                  matches={upcomingMatches} 
                  title="Prossimi Eventi" 
                />
              </TabsContent>
              
              <TabsContent value="live" className="mt-4">
                {liveMatches.length > 0 ? (
                  <OddsListing 
                    matches={liveMatches} 
                    title="Partite Live"
                  />
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-500">Non ci sono partite live al momento</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
            
            <BonusBookmakers />
          </div>
          
          <div>
            <SchedinaSidebar />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}