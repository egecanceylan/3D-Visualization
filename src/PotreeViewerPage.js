import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PotreeViewer from './PotreeViewer';

const PotreeViewerPage = () => {
  const { fileName } = useParams(); // Get the file name from the route params
  const fileUrl = `http://localhost:8080/potree_output/${fileName}/metadata.json`;
  const navigate = useNavigate();

  return (
    <div>
      <PotreeViewer url={fileUrl} />
    </div>
  );
};

export default PotreeViewerPage;
