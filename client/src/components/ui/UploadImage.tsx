import React, { useState } from "react";
import axios from "axios";

export default function UploadImage() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await axios.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImageUrl(response.data.url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed! ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {loading && <p>Uploading...</p>}
      {imageUrl && (
        <img src={imageUrl} alt="Uploaded" style={{ maxWidth: 300 }} />
      )}
    </div>
  );
}
