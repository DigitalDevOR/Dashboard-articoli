import { FC, useState } from 'react';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RegolamentoPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'regolamento' | 'privacy'>('regolamento');
  const handleTabChange = (value: 'regolamento' | 'privacy') => {
    setActiveTab(value);
  };
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header showBackButton showMenu title="" />

      <motion.div
        className="flex-1 p-6 pb-24 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Tabs defaultValue="regolamento">
          <TabsList className="w-full mb-4">
            <TabsTrigger onClick={() => handleTabChange('regolamento')} value="regolamento" className={'w-1/2 ' + (activeTab === 'regolamento' ? '  bg-[#ffd700]! ' : '  ')}>Regolamento</TabsTrigger>
            <TabsTrigger onClick={() => handleTabChange('privacy')} value="privacy" className={'w-1/2 ' + (activeTab === 'privacy' ? ' bg-[#ffd700]! ' : '  ')}>Policy</TabsTrigger>
          </TabsList>

          <TabsContent value="regolamento" className="space-y-6">
            <div className="prose max-w-none">
              <h2 className="mb-3 text-xl font-semibold">Regolamento Generale</h2>
              <p className="mb-4 text-gray-700">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus rhoncus malesuada odio, sit amet feugiat nibh maximus eget. Vivamus eleifend, libero eu pretium rutrum, duis magna eros, quis aliquam turpis felis et arcu.
              </p>

              <h3 className="mb-2 text-lg font-medium">1. Registrazione e Account</h3>
              <p className="mb-4 text-gray-700">
                Duis sed quam ut orci vestibulum in vel odio. Proin vel tincidunt magna. In vel pharetra tellus, vel luctus justo. Maecenas tempor elementum risus non vulputate. Vestibulum sodales dui non efficitur auctor.
              </p>

              <h3 className="mb-2 text-lg font-medium">2. Tornei e Iscrizioni</h3>
              <p className="mb-4 text-gray-700">
                Cras mollis nisi in lobortis fermentum. Quisque purus eros, pellentesque sit amet lorem eu, lacinia molestie neque. Morbi feugiat porta quam, at dapibus diam placerat non.
              </p>

              <h3 className="mb-2 text-lg font-medium">3. Punteggi e Classifiche</h3>
              <p className="mb-4 text-gray-700">
                Etiam consequat vitae dolor vel vulputate. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vivamus viverra nisl in ultrices venenatis.
              </p>

              <h3 className="mb-2 text-lg font-medium">4. Premi e Crediti</h3>
              <p className="mb-4 text-gray-700">
                Curabitur scelerisque nulla ut quam condimentum, vel pulvinar nisl varius. Nullam vel sapien vel libero dignissim iaculis in eu lectus. Cras auctor, mauris at pellentesque dapibus.
              </p>

              <h3 className="mb-2 text-lg font-medium">5. Comportamento e Fair Play</h3>
              <p className="mb-4 text-gray-700">
                Morbi malesuada nisi ut mi euismod, vel bibendum mi consectetur. Etiam rutrum nisi eu augue sodales, ac lobortis enim vestibulum. Quisque ac consectetur risus, quis euismod magna.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <div className="prose max-w-none">
              <h2 className="mb-3 text-xl font-semibold">Informativa sulla Privacy</h2>
              <p className="mb-4 text-gray-700">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vulputate ex ut finibus consequat. Nulla facilisi. Donec vitae dui eu eros dapibus hendrerit. Maecenas semper auctor arcu, id eleifend lectus accumsan non.
              </p>

              <h3 className="mb-2 text-lg font-medium">1. Raccolta dei Dati</h3>
              <p className="mb-4 text-gray-700">
                Quisque pharetra ultricies sapien, ut ultrices lacus lobortis sed. Integer vitae facilisis libero. Aenean lacinia fermentum nisi, id egestas arcu. Integer suscipit turpis risus, sit amet volutpat orci tempus a.
              </p>

              <h3 className="mb-2 text-lg font-medium">2. Utilizzo dei Dati</h3>
              <p className="mb-4 text-gray-700">
                Aliquam rhoncus ipsum mi. Nam at dui at felis porta sollicitudin sit amet ut mi. Etiam a lacus sed nulla vehicula posuere et in urna. Praesent vitae tellus finibus, finibus magna ac, faucibus eros.
              </p>

              <h3 className="mb-2 text-lg font-medium">3. Condivisione dei Dati</h3>
              <p className="mb-4 text-gray-700">
                Sed commodo turpis mi, vel elementum felis porta ac. Etiam condimentum porttitor tellus, vel condimentum neque tempor eget. Proin pharetra pellentesque libero ac imperdiet.
              </p>

              <h3 className="mb-2 text-lg font-medium">4. Diritti dell'Utente</h3>
              <p className="mb-4 text-gray-700">
                Nulla vel lacus quis ex bibendum maximus. Phasellus elementum nisi ut diam vulputate, nec convallis nisl maximus. Mauris iaculis leo eros, non consectetur tellus pulvinar quis.
              </p>

              <h3 className="mb-2 text-lg font-medium">5. Cookie Policy</h3>
              <p className="mb-4 text-gray-700">
                Cras id finibus lectus. Nulla viverra hendrerit tortor, at convallis neque hendrerit eget. Morbi dapibus purus in faucibus rutrum. Nullam porttitor neque turpis, non commodo ex sollicitudin at.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <BottomNavigation />
    </div>
  );
};

export default RegolamentoPage;