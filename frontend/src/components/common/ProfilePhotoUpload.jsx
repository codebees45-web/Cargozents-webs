import { useState } from 'react';

const ProfilePhotoUpload = ({ currentPhoto, onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentPhoto || null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show a temporary local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Pass the file up to the parent component
    if (onUpload) {
      setIsUploading(true);
      // Simulate upload delay for UI polish, then execute callback
      setTimeout(() => {
        onUpload(file);
        setIsUploading(false);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-8">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full border-2 border-primary/20 bg-secondary/20 overflow-hidden flex items-center justify-center shadow-sm">
          {preview ? (
            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-10 h-10 text-muted" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </div>
        
        {/* Upload Overlay (Appears on Hover) */}
        <label className="absolute inset-0 w-full h-full rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>

      <div className="text-center sm:text-left">
        <h3 className="text-sm font-bold text-slate-200">Profile Picture</h3>
        <p className="text-xs text-[#8AA399] mt-1 mb-3">Upload a high-res image. Max size 2MB.</p>
        <label className={`inline-block rounded-md border border-primary/20 bg-secondary/10 px-4 py-2 text-xs font-bold text-[#00E676] shadow-sm transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary/30 cursor-pointer'}`}>
          {isUploading ? 'Uploading...' : 'Change Photo'}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;