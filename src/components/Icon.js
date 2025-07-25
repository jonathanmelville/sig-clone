import React from 'react';

const Icon = ({ 
  icon: IconComponent, 
  size = 24, 
  color = 'currentColor',
  border = false,
  borderColor = 'currentColor',
  borderWidth = 2,
  className = '',
  ...props 
}) => {
  const iconStyle = {
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...(border && {
      border: `${borderWidth}px solid ${borderColor}`,
      borderRadius: '8px',
      padding: '4px',
      width: `${size + 8}px`,
      height: `${size + 8}px`
    })
  };

  return (
    <div style={iconStyle} className={className}>
      <IconComponent size={size} {...props} />
    </div>
  );
};

export default Icon; 