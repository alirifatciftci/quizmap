interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 20, md: 32, lg: 48 };

export default function LoadingSpinner({ size = 'md', className = '' }: Props) {
  const s = sizes[size];
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ animation: 'spin-ring 0.8s linear infinite' }}
      aria-label="Yükleniyor"
    >
      <style>{`@keyframes spin-ring{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="9" stroke="rgba(124,58,237,0.2)" strokeWidth="2.5" />
      <path
        d="M12 3a9 9 0 0 1 9 9"
        stroke="#a78bfa"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
