/* global Potree */
import React, { useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button'; // Import Material UI Button
import * as THREE from 'three'
import './PotreeViewer.css'

const LasViewer = ({ url }) => {
  const viewerRef = useRef(null);
  const [viewerRefSet, setViewerRefSet] = useState(false)
  const [classificationVisibility, setClassificationVisibility] = useState({
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
    9: true,
    12: true,
  });
  const [selectedAttribute, setSelectedAttribute] = useState('composite');

  useEffect(() => {
    if (window.Potree) {
      const container = document.getElementById('potree_render_area');
      const viewer = new window.Potree.Viewer(container);
      viewer.setEDLEnabled(true);
      viewer.setFOV(60);
      viewer.setPointBudget(8_000_000);
      viewer.setBackground('gradient');

      viewerRef.current = viewer;
      setViewerRefSet(true);

      console.log('name: ', viewerRef.current.classifications[0].name);

      window.Potree.loadPointCloud(url, 'pointcloud', (e) => {
        const pointcloud = e.pointcloud;
        viewer.scene.addPointCloud(pointcloud);
        viewer.fitToScreen();

        updateClassificationVisibility();
        updateDisplayAttribute();
      }, (error) => {
        console.error('Error loading point cloud:', error);
      });

      // Resize viewer on window resize
      const onWindowResize = () => {
        viewer.renderer.setSize(container.clientWidth, container.clientHeight);
      };

      window.addEventListener('resize', onWindowResize, false);

      // Cleanup on unmount
      return () => {
        window.removeEventListener('resize', onWindowResize);
        viewer.scene.pointclouds.forEach(pointcloud => {
          viewer.scene.scene.remove(pointcloud);
        });
        container.innerHTML = '';  // Clear the container
      };
    }

  }, [url]);

  // Function to handle checkbox changes
  const handleCheckboxChange = (event) => {
    const { id, checked } = event.target;
    setClassificationVisibility((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const updateClassificationVisibility = () => {
    if (viewerRef.current) {
      const classifications = Object.keys(classificationVisibility);
      classifications.forEach((classification) => {
        const classIndex = parseInt(classification);
        viewerRef.current.setClassificationVisibility(classIndex, classificationVisibility[classification]);
      });
    }
  };

  useEffect(() => {
    // Update visibility when classificationVisibility state changes
    if (viewerRef.current) {
      updateClassificationVisibility();
    }
  }, [classificationVisibility]);

  const handleAttributeChange = (event) => {
    setSelectedAttribute(event.target.value);
  };

  const updateDisplayAttribute = () => {
    if (viewerRef.current && viewerRef.current.scene.pointclouds.length > 0) {
      switch (selectedAttribute) {
        case 'RGB':
          viewerRef.current.scene.pointclouds[0].material.activeAttributeName = 'rgb'
          break;
        case 'RGB and Elevation':
          viewerRef.current.scene.pointclouds[0].material.activeAttributeName = 'rgb_height'
          break;
        case 'Color':
          viewerRef.current.scene.pointclouds[0].material.activeAttributeName = 'color'
          break;
        case 'Elevation':
          viewerRef.current.scene.pointclouds[0].material.activeAttributeName = 'height'
          break;
        case 'Intensity':
          viewerRef.current.scene.pointclouds[0].material.activeAttributeName = 'intensity'
          break;
        case 'Intensity Gradient':
          viewerRef.current.scene.pointclouds[0].material.activeAttributeName = 'intensity_gradient'
          break;
        case 'Classification':
          viewerRef.current.scene.pointclouds[0].material.activeAttributeName = 'classification'
          break;
        case 'Return Number':
          viewerRef.current.scene.pointclouds[0].material.activeAttributeName = 'return_number'
          break;
        case 'Source':
          viewerRef.current.scene.pointclouds[0].material.activeAttributeName = 'source'
          break;
        case 'GPS Time':
          viewerRef.current.scene.pointclouds[0].material.activeAttributeName = 'gps_time'
          break;
        case 'Index':
          viewerRef.current.scene.pointclouds[0].material.activeAttributeName = 'index'
          break;
        case 'Level of Detail':
          viewerRef.current.scene.pointclouds[0].material.activeAttributeName = 'lod'
          break;
        case 'Composite':
          viewerRef.current.scene.pointclouds[0].material.activeAttributeName = 'composite'
          break;
        default:
          viewerRef.current.scene.pointclouds[0].material.activeAttributeName = 'composite'
      }
      viewerRef.current.scene.pointclouds[0].material.needsUpdate = true;
    }
  };

  useEffect(() => {
    if (viewerRef.current) {
      updateDisplayAttribute();
    }
  }, [selectedAttribute]);

  return (
    <div className="potree-viewer-container" style={{ display: 'flex' }}>
      {/* Left panel for classification options */}
      <div className="classification-container">
        {/* Classification Section */}
        <div>
          <div className="section-title">Classification</div>
          <ul className="checkbox-list">
            {viewerRefSet && viewerRef.current && Object.keys(classificationVisibility).map((classification) => (
              <li key={classification}>
                <label style={{ color: 'black' }}>
                  <input
                    type="checkbox"
                    id={classification}
                    checked={classificationVisibility[classification]}
                    onChange={handleCheckboxChange}
                    style={{ marginRight: '10px' }}
                  />
                  {viewerRef.current.classifications[classification].name.replace(/\b\w/g, (char) => char.toUpperCase())}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Horizontal Line Separator */}
        <div className="section-separator"></div>

        {/* Display Attribute Section */}
        {viewerRefSet && viewerRef.current && <div>
          <div className="section-title">Display Attribute</div>
          <select className="custom-dropdown" onChange={handleAttributeChange}>
            <option value="Composite">Composite</option>
            <option value="RGB">RGB</option>
            <option value="RGB and Elevation">RGB and Elevation</option>
            <option value="Color">Color</option>
            <option value="Elevation">Elevation</option>
            <option value="Intensity">Intensity</option>
            <option value="Intensity Gradient">Intensity Gradient</option>
            <option value="Classification">Classification</option>
            <option value="Return Number">Return Number</option>
            <option value="Source">Source</option>
            <option value="GPS Time">GPS Time</option>
            <option value="Index">Index</option>
            <option value="Level of Detail">Level of Detail</option>
          </select>
        </div> }
      </div>

      {/* Right panel for Potree viewer */}
      <div
        id="potree_render_area"
        style={{ flex: 1, height: '100vh' }}
      ></div>
    </div>
  );
};

export default LasViewer;
