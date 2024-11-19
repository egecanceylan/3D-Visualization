import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ThreeViewer from './ThreeViewer';

const ThreeViewerPage = () => {
  const { fileName } = useParams(); // Get the file name from the route params
  const navigate = useNavigate();
  const fileUrl = `http://localhost:8080/potree_output/${fileName}`; // Adjust this URL if needed

  return (
    <div>
      <button onClick={() => navigate('/')}>Back to Home</button>
      <ThreeViewer fileUrl={fileUrl} fileType={fileName.split('.').pop()} />
    </div>
  );
};

export default ThreeViewerPage;
