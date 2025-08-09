import React from 'react';
import styles from './TextField.module.css';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string; error?: string | null;
}
const TextField = React.forwardRef<HTMLInputElement, Props>(({ label, error, className, ...props }, ref) => {
  const id = props.id || props.name || Math.random().toString(36).slice(2);
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <input ref={ref} id={id} className={[styles.input, className].filter(Boolean).join(' ')} {...props}/>
      {error ? <div className={styles.err} role="alert">{error}</div> : null}
    </div>
  );
});
export default TextField;
