import { useState, useRef, FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, User } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function EditProfilePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(user?.profileImage || null);
  
  // Mutazione per aggiornare i dati del profilo
  const updateProfileMutation = useMutation({
    mutationFn: async (userData: any) => {
      const res = await apiRequest('PATCH', '/api/users/me', userData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/me'], data);
      toast({
        title: 'Profilo aggiornato',
        description: 'Le tue informazioni sono state aggiornate con successo.',
      });
      setLocation('/profile');
    },
    onError: (error: any) => {
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante l\'aggiornamento del profilo.',
        variant: 'destructive',
      });
    },
  });
  
  // Mutazione per upload immagine profilo
  const uploadImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/users/me/profile-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Errore durante l\'upload dell\'immagine');
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/me'], (oldData: any) => ({
        ...oldData,
        profileImage: data.profileImage,
      }));
      toast({
        title: 'Immagine aggiornata',
        description: 'La tua immagine del profilo è stata aggiornata con successo.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante l\'upload dell\'immagine.',
        variant: 'destructive',
      });
    },
  });
  
  // Gestione selezione immagine
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Anteprima immagine
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Avvia upload immagine
  const handleImageUpload = async () => {
    if (!selectedImage) return;
    
    const formData = new FormData();
    formData.append('profileImage', selectedImage);
    
    uploadImageMutation.mutate(formData);
  };
  
  // Gestione submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Prima carica l'immagine se selezionata
    if (selectedImage) {
      await handleImageUpload();
    }
    
    // Poi aggiorna i dati del profilo
    updateProfileMutation.mutate({
      fullName,
      bio
    });
  };
  
  return (
    <div className="page-container bg-neutral-50">
      <Header 
        title="Modifica Profilo" 
        showBackButton={true}
        backDestination="/profile"
        leftElement={
          <button 
            onClick={() => setLocation('/profile')}
            className="text-white"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        }
      />
      
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden mb-3 bg-gray-200 flex items-center justify-center border-2 border-primary">
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt={fullName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-gray-400" />
              )}
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full"
              >
                <Upload className="h-4 w-4" />
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-500">Tocca per cambiare l'immagine del profilo</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                placeholder="Inserisci il tuo nome"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                placeholder="Raccontaci qualcosa di te..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary" 
            disabled={updateProfileMutation.isPending || uploadImageMutation.isPending}
          >
            {(updateProfileMutation.isPending || uploadImageMutation.isPending) ? 
              'Salvataggio in corso...' : 'Salva modifiche'}
          </Button>
        </form>
      </div>
    </div>
  );
}