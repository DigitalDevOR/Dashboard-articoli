import React from 'react';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const ContattiPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title="" showBackButton showMenu={true} />

      <motion.div
        className="flex-1 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">I nostri contatti</h1>

          <div className="space-y-6">
            {/* Email */}
            <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
              <div className="flex items-start">
                <div className="p-3 mr-4 rounded-full bg-primary bg-opacity-10">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-medium">Email</h3>
                  <p className="mb-2 text-gray-700">Inviaci una email, ti risponderemo entro 24 ore.</p>
                  <a href="mailto:supporto@betmaster.app" className="font-medium text-primary">
                    supporto@betmaster.app
                  </a>
                </div>
              </div>
            </div>

            {/* Telefono 1 */}
            <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
              <div className="flex items-start">
                <div className="p-3 mr-4 rounded-full bg-primary bg-opacity-10">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-medium">Supporto Tecnico</h3>
                  <p className="mb-2 text-gray-700">Per problemi tecnici e assistenza sull'app.</p>
                  <a href="tel:+393331234567" className="font-medium text-primary">
                    +39 333 1234567
                  </a>
                  <p className="mt-1 text-xs text-gray-500">
                    Disponibile Lun-Ven: 9:00 - 18:00
                  </p>
                </div>
              </div>
            </div>

            {/* Telefono 2 */}
            <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
              <div className="flex items-start">
                <div className="p-3 mr-4 rounded-full bg-primary bg-opacity-10">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-medium">Assistenza Clienti</h3>
                  <p className="mb-2 text-gray-700">Per informazioni generali e domande sui tornei.</p>
                  <a href="tel:+393459876543" className="font-medium text-primary">
                    +39 345 9876543
                  </a>
                  <p className="mt-1 text-xs text-gray-500">
                    Disponibile Lun-Dom: 10:00 - 20:00
                  </p>
                </div>
              </div>
            </div>
          </div>


        </div>
      </motion.div>

      <BottomNavigation activeItem="home" />
    </div>
  );
};

export default ContattiPage;