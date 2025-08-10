import React from 'react';

// Componente que muestra la marca de la aplicación (logo + nombre + eslogan)
const Brand: React.FC = () => {
  return (
    <div
      className="brand"            // Clase para estilos globales de la marca
      role="banner"                // Rol ARIA para indicar que es un banner/encabezado principal
      aria-label="Creencia"        // Etiqueta accesible para lectores de pantalla
    >
      <div className="logo" aria-hidden />  {/* Logo visual (sin texto) oculto para lectores de pantalla */}
      <div>
        <h1>Creencia</h1>                   {/* Nombre de la app */}
        <p>Modelar para creer</p>            {/* Eslogan */}
      </div>
    </div>
  );
};

export default Brand;
