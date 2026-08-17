import { useRef, useState } from "react";
import {
  Upload,
  FileText,
  Image,
  Trash2,
  FileSpreadsheet,
} from "lucide-react";

export default function UploadDocuments({
  formData,
  setFormData,
}) {
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // File objects cannot survive JSON.stringify (they serialize to `{}`),
  // and the order submission goes out as a plain JSON POST — not
  // multipart/form-data — so without this conversion every "uploaded"
  // document silently turns into an empty object and never reaches the
  // server. Converting to a base64 data URL keeps the actual bytes intact
  // through JSON serialization.
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setUploading(true);

    try {
      const encoded = await Promise.all(
        selectedFiles.map(async (file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          data: await fileToDataUrl(file),
        }))
      );

      const updatedFiles = [...files, ...encoded];

      setFiles(updatedFiles);

      setFormData({
        ...formData,
        documents: updatedFiles,
      });
    } catch (err) {
      console.error("Failed to read file(s):", err);
      alert("Could not read one of the selected files. Please try again.");
    } finally {
      setUploading(false);
      // Allow re-selecting the same file after removal.
      e.target.value = "";
    }
  };

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);

    setFiles(updated);

    setFormData({
      ...formData,
      documents: updated,
    });
  };

  const getIcon = (file) => {
    if (file.type.startsWith("image"))
      return <Image size={20} />;

    if (file.type.includes("pdf"))
      return <FileText size={20} />;

    return <FileSpreadsheet size={20} />;
  };

  return (
    <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">

      <h2 className="text-xl font-semibold text-primary">
        Upload Documents
      </h2>

      <p className="text-sm text-[#5B7A70] mt-2">
        Upload shipment related documents.
      </p>

      {/* Upload Area */}

      <div
        onClick={() => !uploading && inputRef.current.click()}
        className={`mt-8 rounded-xl border-2 border-dashed border-primary/20 p-10 text-center transition ${
          uploading ? "cursor-wait opacity-70" : "cursor-pointer hover:bg-primary/5"
        }`}
      >

        <Upload
          className="mx-auto text-primary"
          size={40}
        />

        <h3 className="mt-4 font-semibold">
          {uploading ? "Reading files..." : "Drag & Drop files here"}
        </h3>

        <p className="mt-2 text-sm text-[#5B7A70]">
          or click to browse
        </p>

        <p className="mt-4 text-xs text-[#5B7A70]">
          PDF, JPG, PNG
          <br />
          Maximum file size: 10 MB
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          disabled={uploading}
          onChange={handleUpload}
        />

      </div>

      {/* Uploaded Files */}

      {files.length > 0 && (

        <div className="mt-8 space-y-4">

          {files.map((file, index) => (

            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-primary/10 p-4"
            >

              <div className="flex items-center gap-4">

                <div className="rounded-lg bg-primary/10 p-3 text-primary">

                  {getIcon(file)}

                </div>

                <div>

                  <h4 className="font-medium">
                    {file.name}
                  </h4>

                  <p className="text-xs text-[#5B7A70]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                </div>

              </div>

              <button
                onClick={() => removeFile(index)}
                className="rounded-lg border border-danger/20 p-2 text-danger hover:bg-danger/5"
              >

                <Trash2 size={18} />

              </button>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}