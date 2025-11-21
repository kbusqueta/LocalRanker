import React, { useState, useRef } from 'react';
import { Business, BusinessImage } from '../types';

interface ImageManagerProps {
  business: Business;
  images: BusinessImage[];
  setImages: React.Dispatch<React.SetStateAction<BusinessImage[]>>;
}

export const ImageManager: React.FC<ImageManagerProps> = ({ business, images, setImages }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const file = e.target.files[0];
      
      // Simulation of getting Location
      let lat, lng;
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } catch (err) {
        console.warn("Could not get location", err);
      }

      // Simulate upload delay
      setTimeout(() => {
        const newImage: BusinessImage = {
          id: Date.now().toString(),
          url: URL.createObjectURL(file), // Create local preview URL
          uploadDate: new Date().toISOString(),
          latitude: lat,
          longitude: lng
        };

        setImages([newImage, ...images]);
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold mb-4">Ajouter une photo</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*"
          />
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-500">Upload et Géocodage en cours...</p>
            </div>
          ) : (
            <>
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Cliquez pour uploader une image</p>
              <p className="text-xs text-gray-400 mt-1">Les coordonnées GPS actuelles seront ajoutées aux métadonnées</p>
            </>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800">Galerie ({images.length})</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map(img => (
          <div key={img.id} className="group relative bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
            <img src={img.url} alt="Business" className="w-full h-48 object-cover" />
            <div className="p-2 bg-white text-xs text-gray-500 flex flex-col">
              <span>{new Date(img.uploadDate).toLocaleDateString()}</span>
              {img.latitude && img.longitude ? (
                <span className="text-green-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Géocodé ({img.latitude.toFixed(4)}, {img.longitude.toFixed(4)})
                </span>
              ) : (
                 <span className="text-red-400">Non géolocalisé</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
