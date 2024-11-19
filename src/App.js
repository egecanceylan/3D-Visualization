import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PotreeViewerPage from './PotreeViewerPage';
import ThreeViewerPage from './ThreeViewerPage';
import './App.css';
import FileUploadModal from './FileUploadModel';

const Home = () => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAvailableFiles = async () => {
    try {
      const response = await axios.get('http://localhost:8080/get-output-files');
      setAvailableFiles(response.data.files);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    // Fetch available files on component mount
    fetchAvailableFiles();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (['las'].includes(ext)) {
      setFileType('las');
      setFile(selectedFile);
    } else if (['xyz', 'ply', 'obj'].includes(ext)) {
      setFileType(ext);
      setFile(URL.createObjectURL(selectedFile));
    } else {
      alert('Unsupported file format');
    }
  };

  const handleFileClick = (fileName) => {
    navigate(`/potree-viewer/${fileName}`); // Navigate to PotreeViewer page
  };

  const handleUploadClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchAvailableFiles()
  };

  return (
    <div className="home-container">
      {/* Header section with title and upload button */}
      <div className="table-header">
        <h2 className="table-title">3D Visualization</h2>
        <button className="upload-button" onClick={handleUploadClick}>
          <span className="material-icons">cloud_upload</span> Upload File
        </button>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>File Name</th>
            </tr>
          </thead>
          <tbody>
            {availableFiles.length > 0 ? (
              availableFiles.map((file, index) => (
                <tr key={index}>
                  <td><Link to={`/potree-viewer/${file}`}>{`${file}.las`}</Link></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="1" style={{ textAlign: 'center', padding: '20px' }}>
                  No files uploaded yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Conditionally render the modal */}
      {isModalOpen && <FileUploadModal onClose={handleCloseModal} />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/potree-viewer/:fileName" element={<PotreeViewerPage />} />
        <Route path="/three-viewer/:fileName" element={<ThreeViewerPage />} />
      </Routes>
    </Router>
  );
};

export default App;
