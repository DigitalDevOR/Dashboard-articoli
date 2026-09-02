import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Moon, 
  Sun, 
  Smartphone, 
  Monitor, 
  MousePointer,
  EyeOff,
  PanelLeft,
  Type,
  RefreshCw,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

const DisplayPage: React.FC = () => {
  const { toast } = useToast();
  
  // State per le impostazioni di visualizzazione
  const [settings, setSettings] = useState({
    theme: 'light',
    fontSize: 2, // 0: small, 1: medium, 2: large
    colorBlindMode: false,
    autoRotation: true,
    dataUsageMode: false,
    highContrastMode: false,
    fontScale: [4], // 1-7 range for font scaling
  });

  const handleThemeChange = (value: string) => {
    setSettings(prev => ({ ...prev, theme: value }));
    
    toast({
      title: 'Tema modificato',
      description: `Il tema è stato impostato su: ${value === 'light' ? 'Chiaro' : value === 'dark' ? 'Scuro' : 'Automatico'}`,
      variant: 'default',
    });
  };

  const handleFontSizeChange = (value: number) => {
    setSettings(prev => ({ ...prev, fontSize: value }));
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFontScaleChange = (value: number[]) => {
    setSettings(prev => ({ ...prev, fontScale: value }));
  };

  return (
    <div className="page-container">
      <Header title="Impostazioni Schermo" showBackButton backDestination="/settings" />
      
      <div className="p-4 flex-1 bg-gray-50">
        <div className="space-y-5">
          {/* Tema */}
          <Card>
            <CardHeader>
              <CardTitle>Tema</CardTitle>
              <CardDescription>Personalizza l'aspetto dell'app</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={settings.theme} 
                onValueChange={handleThemeChange}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light" className="flex items-center">
                    <Sun className="h-5 w-5 mr-2 text-yellow-500" />
                    <span>Tema chiaro</span>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark" className="flex items-center">
                    <Moon className="h-5 w-5 mr-2 text-blue-500" />
                    <span>Tema scuro</span>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border">
                  <RadioGroupItem value="system" id="theme-system" />
                  <Label htmlFor="theme-system" className="flex items-center">
                    <Monitor className="h-5 w-5 mr-2 text-gray-600" />
                    <span>Usa impostazioni di sistema</span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          
          {/* Dimensione testo */}
          <Card>
            <CardHeader>
              <CardTitle>Dimensione testo</CardTitle>
              <CardDescription>Regola la dimensione del testo nell'app</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between mb-2">
                  <Type className="h-4 w-4" />
                  <Type className="h-6 w-6" />
                  <Type className="h-8 w-8" />
                </div>
                
                <Slider
                  defaultValue={settings.fontScale}
                  max={7}
                  min={1}
                  step={1}
                  onValueChange={handleFontScaleChange}
                  className="w-full"
                />
                
                <div className="mt-4 flex justify-between">
                  <span className="text-xs">Piccolo</span>
                  <span className="text-xs">Medio</span>
                  <span className="text-xs">Grande</span>
                </div>
                
                <div className="mt-8">
                  <div className="bg-white p-4 rounded-lg text-primary">
                    <p className={`text-${settings.fontScale[0] <= 3 ? 'sm' : settings.fontScale[0] <= 5 ? 'base' : 'lg'}`}>
                      Esempio di testo con la dimensione selezionata
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Altre impostazioni */}
          <Card>
            <CardHeader>
              <CardTitle>Altre impostazioni</CardTitle>
              <CardDescription>Personalizza ulteriori aspetti dell'interfaccia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <PanelLeft className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <h3 className="font-medium text-sm">Modalità Contrasto Elevato</h3>
                      <p className="text-xs text-gray-500">Migliora la leggibilità dei testi</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.highContrastMode}
                    onCheckedChange={() => handleToggle('highContrastMode')}
                    className="data-[state=checked]:bg-secondary"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <EyeOff className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <h3 className="font-medium text-sm">Modalità Daltonismo</h3>
                      <p className="text-xs text-gray-500">Ottimizza i colori per la visione cromatica</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.colorBlindMode}
                    onCheckedChange={() => handleToggle('colorBlindMode')}
                    className="data-[state=checked]:bg-secondary"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Smartphone className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <h3 className="font-medium text-sm">Risparmio dati</h3>
                      <p className="text-xs text-gray-500">Riduci l'utilizzo dei dati mobili</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.dataUsageMode}
                    onCheckedChange={() => handleToggle('dataUsageMode')}
                    className="data-[state=checked]:bg-secondary"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <RefreshCw className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <h3 className="font-medium text-sm">Rotazione automatica</h3>
                      <p className="text-xs text-gray-500">Ruota l'app quando giri il dispositivo</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.autoRotation}
                    onCheckedChange={() => handleToggle('autoRotation')}
                    className="data-[state=checked]:bg-secondary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Button Reset */}
          <div className="flex justify-center mt-6">
            <Button 
              variant="outline" 
              className="text-gray-600"
              onClick={() => {
                setSettings({
                  theme: 'light',
                  fontSize: 2,
                  colorBlindMode: false,
                  autoRotation: true,
                  dataUsageMode: false,
                  highContrastMode: false,
                  fontScale: [4],
                });
                
                toast({
                  title: 'Impostazioni ripristinate',
                  description: 'Tutte le impostazioni di visualizzazione sono state ripristinate ai valori predefiniti.',
                  variant: 'default',
                });
              }}
            >
              Ripristina impostazioni predefinite
            </Button>
          </div>
        </div>
      </div>
      
      <BottomNavigation activeItem="home" />
    </div>
  );
};

export default DisplayPage;