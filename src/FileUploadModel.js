import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileUploadModel.css'; // Import the separate CSS file

const FileUploadModal = ({ onClose }) => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [loading, setLoading] = useState(false); // For loading state


    // Function to handle dropped files
    const onDrop = (acceptedFiles) => {
        setUploadedFiles([...uploadedFiles, ...acceptedFiles]);
    };

    // React Dropzone hook for drag and drop functionality
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/octet-stream': ['.las'], // Accept only .las files
        },
    });

    const handleUpload = async () => {
        if (uploadedFiles.length === 0) return;

        setLoading(true); // Show loading indicator

        try {
            // Iterate over each file in uploadedFiles array and upload them
            for (const file of uploadedFiles) {
                const formData = new FormData();
                formData.append('file', file);

                // Upload each file to the server
                const uploadResponse = await fetch('http://localhost:8080/upload', {
                    method: 'POST',
                    body: formData,
                });

                const uploadData = await uploadResponse.json();
                console.log('Upload Success:', uploadData);

                if (uploadData.file && uploadData.file.filename) {
                    // After successful upload, trigger conversion for each file
                    await triggerConversion(uploadData.file.filename);
                } else {
                    console.error('Error: No file returned from the server.');
                }
            }
        } catch (error) {
            console.error('Error uploading file(s):', error);
        } finally {
            setLoading(false); // Hide loading indicator after all files are processed
            onClose()
        }
    };

    const triggerConversion = async (filename) => {
        try {
            const convertResponse = await fetch('http://localhost:8080/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filename }), // Send the filename for conversion
            });

            if (convertResponse.ok) {
                const result = await convertResponse.json();
                console.log('Conversion Success:', result);
            } else {
                console.error('Error during conversion:', convertResponse);
            }
        } catch (error) {
            console.error('Error during conversion:', error);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}>✖</button>

                <div className="upload-section">
                    {/* Drag and Drop Area */}
                    <div {...getRootProps({ className: 'dropzone' })}>
                        <input {...getInputProps()} />
                        {
                            isDragActive ?
                                <p>Drop the files here...</p> :
                                <p>Drag and drop file here or <button className="browse-btn">Browse to upload</button></p>
                        }
                        <p className="upload-info">Accepted file types: LAS, LAZ. Maximum point count ~15M for your Free Account</p>
                    </div>

                    {/* File List Area */}
                    <div className="file-list-section">
                        <h4>Added files will be displayed here</h4>
                        <ul>
                            {uploadedFiles.map((file, index) => (
                                <li key={index}>{file.name}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Upload Button */}
                <div className="modal-footer">
                    <button className="upload-btn" onClick={handleUpload} disabled={loading}>
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileUploadModal;