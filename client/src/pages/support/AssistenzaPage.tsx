import { FC } from 'react';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';

const AssistenzaPage: FC = () => {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header showBackButton showMenu title="" />

      <motion.div
        className="flex flex-col flex-1 p-6 overflow-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50">
            <i className="text-3xl ri-customer-service-2-line text-primary"></i>
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-gray-800">Assistenza</h1>
          <p className="text-gray-600">Hai bisogno di aiuto? Consulta la guida rapida o contattaci.</p>
        </div>

        <div className="space-y-6">
          <Button
            className="w-full btn-primary"
            onClick={() => navigate('/support/guide')}
          >
            Consulta la guida rapida
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/support/contatti')}
          >
            Scrivici
          </Button>
        </div>


      </motion.div>

      <BottomNavigation />
    </div>
  );
};

export default AssistenzaPage;