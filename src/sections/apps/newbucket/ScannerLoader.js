import React from 'react';

const ScannerLoader = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(255, 255, 255, 0.8)', // Change the background color and opacity as needed
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <p>Loading...</p>
    </div>
  );
};

export default ScannerLoader;
