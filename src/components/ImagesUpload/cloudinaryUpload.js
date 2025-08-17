"use client";
import { CldImage, CldUploadWidget } from 'next-cloudinary';
import { useState } from 'react';

export default function ImagesUpload({ value, onChange }) {
    const [publicId, setPublicId] = useState("");

    return (
        <div>
            {/* Display uploaded image using publicId */}
            {publicId && (
                <CldImage
                    src={publicId}
                    alt="Uploaded content"
                    width={300}
                    height={180}
                    crop="fill"
                    className="mb-4 rounded-lg border"
                />
            )}

            <CldUploadWidget
                uploadPreset="ca_db_images"
                options={{
                    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                    sources: ['local'],
                    multiple: false
                }}
                onUpload={(result) => {
                    if (result.event === 'success') {
                        setPublicId(result.info.public_id);
                        onChange(result.info.secure_url); // Also pass the URL to parent
                    }
                }}
            >
                {({ open }) => (
                    <button
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                        onClick={() => open()}
                    >
                        Upload Image
                    </button>
                )}
            </CldUploadWidget>
        </div>
    );
}