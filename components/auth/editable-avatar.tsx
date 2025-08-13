"use client"

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Loader2, AlertCircle } from 'lucide-react';
import type { SchoolUser } from '@/types/user';
import { updateUserProfilePicture } from '@/lib/user';

interface EditableAvatarProps {
  user: SchoolUser;
}

export function EditableAvatar({ user }: EditableAvatarProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = (user.displayName || "")
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limite de 2MB
        setError("L'image ne doit pas dépasser 2 Mo.");
        return;
      }
      setError(null);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      // 1. Obtenir la signature depuis notre API
      const sigResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paramsToSign: { timestamp: Math.round(new Date().getTime() / 1000) } })
      });
      const { signature, timestamp } = await sigResponse.json();

      // 2. Envoyer le fichier à Cloudinary
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);

      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadResponse.json();

      if (uploadData.error) {
        throw new Error(uploadData.error.message);
      }

      // 3. Mettre à jour le profil utilisateur dans Firestore
      const { success, error: updateError } = await updateUserProfilePicture(user.uid, uploadData.secure_url);

      if (!success) {
        throw new Error(updateError || "Impossible de mettre à jour la photo de profil.");
      }

      // 4. Fermer et rafraîchir
      setOpen(false);
      window.location.reload(); // Rafraîchissement simple pour voir le changement partout

    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'envoi.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer">
          <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
            <AvatarImage src={user.profilePicture} alt={user.displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changer la photo de profil</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="w-40 h-40 rounded-full overflow-hidden flex items-center justify-center bg-muted">
            {previewUrl ? (
              <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
            ) : (
              <Avatar className="h-40 w-40">
                <AvatarImage src={user.profilePicture} alt={user.displayName} />
                <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
              </Avatar>
            )}
          </div>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            Choisir une image
          </Button>
          <Input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
          />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {uploading ? 'Envoi...' : 'Mettre à jour'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
