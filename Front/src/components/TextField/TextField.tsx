import React from 'react';
import styles from './TextField.module.css'; // Estilos locales para el campo de texto

// Props personalizadas para este input
interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;                // Etiqueta visible para el campo
  error?: string | null;        // Mensaje de error opcional
}

// Componente de campo de texto reutilizable con etiqueta y mensaje de error
// Usa forwardRef para permitir que el padre pueda acceder al <input> directamente
const TextField = React.forwardRef<HTMLInputElement, Props>(
  ({ label, error, className, ...props }, ref) => {
    // Genera un ID único si no se pasa 'id' ni 'name' (para vincular label e input)
    const id = props.id || props.name || Math.random().toString(36).slice(2);

    return (
      <div className={styles.field}>
        {/* Etiqueta vinculada al input por el atributo htmlFor */}
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>

        {/* Campo de entrada */}
        <input
          ref={ref} // Permite que el padre acceda al elemento input
          id={id}
          className={[styles.input, className].filter(Boolean).join(' ')}
          {...props}
        />

        {/* Si hay error, lo muestra en un div con rol "alert" para accesibilidad */}
        {error ? (
          <div className={styles.err} role="alert">
            {error}
          </div>
        ) : null}
      </div>
    );
  }
);

export default TextField;
