import { useState } from 'react';

export default function MemberAvatar({ member, size = 32, className = '' }) {
  const [imgError, setImgError] = useState(false);

  const getInitials = () => {
    if (!member) return '?';
    const name = member.displayName || member.name || member.email || '';
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const name = member?.displayName || member?.name || 'Miembro';
  
  return (
    <div 
      className={`member-avatar ${className}`} 
      style={{ width: `${size}px`, height: `${size}px`, fontSize: `${size * 0.4}px` }}
      title={name}
    >
      {member?.photoURL && !imgError ? (
        <img 
          src={member.photoURL} 
          alt={name} 
          onError={() => setImgError(true)} 
        />
      ) : (
        <span>{getInitials()}</span>
      )}
    </div>
  );
}
