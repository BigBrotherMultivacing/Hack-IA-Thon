import React from 'react';
import styles from './Button.module.css';

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) =>
  <button className={[styles.button, className].filter(Boolean).join(' ')} {...props}>{children}</button>;

export default Button;
