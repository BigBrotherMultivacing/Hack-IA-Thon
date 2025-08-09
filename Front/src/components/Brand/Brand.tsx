import React from 'react';

const Brand: React.FC = () => {
  return (
    <div className="brand" role="banner" aria-label="Creencia">
      <div className="logo" aria-hidden />
      <div>
        <h1>Creencia</h1>
        <p>Modelar para creer</p>
      </div>
    </div>
  );
};

export default Brand;