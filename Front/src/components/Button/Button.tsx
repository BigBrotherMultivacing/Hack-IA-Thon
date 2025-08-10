import React from 'react';
import styles from './Button.module.css'; // Estilos locales del botón

// Componente de botón reutilizable
// Recibe todas las props estándar de un <button> de HTML
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,    // Contenido del botón (texto o iconos)
  className,   // Clases adicionales opcionales
  ...props     // Otras props (onClick, disabled, etc.)
}) =>
  (
    <button
      // Combina clase del módulo CSS con clases adicionales si existen
      className={[styles.button, className].filter(Boolean).join(' ')}
      {...props}  // Pasa el resto de props al elemento <button>
    >
      {children}  {/* Renderiza el contenido dentro del botón */}
    </button>
  );

export default Button;
