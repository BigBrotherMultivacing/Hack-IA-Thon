import styles from './ReviewCard.module.css';

export default function ReviewCard({ author, rating, text, ts }: { author: string; rating: number; text: string; ts: string }){
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <strong>{author}</strong>
        <span className={styles.star}>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5-Math.round(rating))}</span>
      </header>
      <p className={styles.text}>{text}</p>
      <span className={styles.ts}>{new Date(ts).toLocaleDateString()}</span>
    </article>
  );
}