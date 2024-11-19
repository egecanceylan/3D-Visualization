import React, { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import { XYZLoader } from 'three/examples/jsm/loaders/XYZLoader';
import { Box } from '@mui/material'; // Import Material UI Box for styling

const ThreeViewer = ({ fileUrl, fileType }) => {
  useEffect(() => {
    const container = document.getElementById('three_render_area');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 1).normalize();
    scene.add(light);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.autoRotate = false;
    controls.rotateSpeed = 1.0;

    const loaderMap = {
      obj: new OBJLoader(),
      ply: new PLYLoader(),
      xyz: new XYZLoader(),
    };

    const loader = loaderMap[fileType];

    if (loader) {
      loader.load(fileUrl, (geometry) => {
        let material, object;

        if (fileType === 'obj') {
          material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
          object = new THREE.Mesh(geometry, material);
        } else {
          if (geometry.hasAttribute('color')) {
            material = new THREE.PointsMaterial({
              size: 0.01,
              vertexColors: true, // Use vertex colors from the file
            });
          } else {
            material = new THREE.PointsMaterial({
              size: 0.01,
              color: 0x0055ff, // Fallback color
            });
          }
          object = new THREE.Points(geometry, material);
        }

        scene.add(object);

        const boundingBox = new THREE.Box3().setFromObject(object);
        const center = boundingBox.getCenter(new THREE.Vector3());

        controls.target.copy(center);
        camera.position.set(center.x, center.y, center.z + 5);

        const animate = function () {
          requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        renderer.setSize(container.clientWidth, container.clientHeight);
      });
    }

    // Handle window resize
    const onWindowResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', onWindowResize, false);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', onWindowResize);
      container.removeChild(renderer.domElement); // Remove the canvas on unmount
      controls.dispose();
    };
  }, [fileUrl, fileType]);

  return (
    <Box
      id="three_render_area"
      sx={{
        width: '100%', // Make it fully responsive
        maxWidth: '800px', // Maximum width for desktop
        height: '400px', // Set the desired height
        border: '1px solid #ccc', // Optional border for visibility
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Adding a shadow for modern look
        borderRadius: '8px', // Rounded corners
        overflow: 'hidden', // Prevents overflow of the content
        backgroundColor: '#fff', // Background color
        margin: '0 auto', // Center the viewer horizontally
      }}
    ></Box>
  );
};

export default ThreeViewer;
