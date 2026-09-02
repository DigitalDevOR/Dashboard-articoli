import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useGetTempPronosticiByLegaQuery, useDeleteTempPronosticoMutation } from "@/store/api/tempPronostici";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useCreateSchedinaMutation } from "../../store/api/schedinaApi";

export function SchedinaSidebar() {
  const [createSchedina, { isLoading: createSchedinaIsLoading }] = useCreateSchedinaMutation();
  const [location] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Logica apertura/chiusura modale
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const openHandler = () => setIsOpen(true);
    window.addEventListener("open-schedina", openHandler);
    return () => window.removeEventListener("open-schedina", openHandler);
  }, []);

  const closeSchedina = () => setIsOpen(false);

  // Estrai la legaId dalla route
  const match = location.match(/^\/sports\/tournaments\/([^/]+)$/);
  const legaId = match ? match[1] : null;

  // Mostra la sidebar solo se siamo nella rotta giusta e c'è una legaId
  if (!legaId) return null;

  // Recupera i pronostici temporanei per questa lega
  const { data: pronostici, isLoading, isError } = useGetTempPronosticiByLegaQuery(legaId, {
    pollingInterval: Number(import.meta.env.VITE_TEMP_PRONOSTICI_POLLING_INTERVAL) || 5000, // aggiorna ogni 5 secondi
  });
  const [deletePronostico, { isLoading: isDeleting }] = useDeleteTempPronosticoMutation();

  // Cancella un pronostico
  const handleDelete = async (id: string) => {
    try {
      await deletePronostico(id).unwrap();
      toast({
        title: "Pronostico rimosso",
        variant: "default",
        className: "bg-[#3F8F6B] text-white"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile cancellare il pronostico.",
        variant: "destructive"
      });
    }
  };

  const handleGiocaSchedina = async () => {
    if (!pronostici || pronostici.length < 10) {
      toast({
        title: "Errore",
        description: "Devi piazzare almeno 10 pronostici per giocare la schedina.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await createSchedina({ pronostici, legaId }).unwrap();

      toast({
        title: "Successo",
        description: "Schedina giocata con successo!",
        variant: "success",
      });

      console.log("Schedina creata:", response);
    } catch (error) {
      console.error("Errore nella creazione della schedina:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione della schedina.",
        variant: "destructive",
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed right-0 top-0 h-full z-50 w-[85%] max-w-md shadow-xl"
          initial={{ x: 300 }}
          animate={{ x: 0 }}
          exit={{ x: 300 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card className="h-[calc(100%-70px)] max-h-[calc(100vh-70px)] flex flex-col rounded-none">
            <CardHeader className="bg-[#112244] text-white p-3 flex-shrink-0">
              <CardTitle className="flex items-center justify-between text-lg font-bold">
                <span>Bet Master</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-white hover:text-white hover:bg-[#112244]/80"
                  onClick={closeSchedina}
                >
                  <X size={16} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardTitle className="p-3 text-[#112244] text-lg">La tua schedina</CardTitle>
            <CardContent className="flex-1 px-3 py-2 overflow-y-auto">
              {isLoading ? (
                <div className="py-8 text-center">Caricamento...</div>
              ) : isError ? (
                <div className="py-8 text-center text-red-600">Errore nel caricamento</div>
              ) : !pronostici || pronostici.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-[#1C1C1E]">
                    La tua schedina è vuota. Clicca sulle quote per aggiungere pronostici.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {pronostici.map((bet) => (
                      <div key={bet._id} className="relative p-3 rounded-lg border border-[#C4C4C6]">
                        <div className="flex flex-col">
                          <div className="font-medium text-[#1C1C1E] mb-1">{bet.home} - {bet.away}</div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="bg-[#112244]/10 text-[#112244] px-2 py-1 rounded text-sm">
                              {bet.odd.label}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="ml-2"
                              onClick={() => handleDelete(bet._id)}
                              disabled={isDeleting}
                              title="Rimuovi pronostico"
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center mt-6">
                    <Button
                      size="lg"
                      className="w-full max-w-xs bg-[#112244] text-white hover:bg-[#112244]/90"
                      onClick={handleGiocaSchedina}
                    >
                      Gioca schedina
                    </Button>
                  </div>

                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}