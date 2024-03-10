import React from 'react';

interface CardImageProps {
  image: string;
}

const CardImage = ({ image }: CardImageProps) => {
  return (
    <img src={image} className="card-img-top" style={{ width: '100%', height: '12vw', objectFit: 'cover' }} alt="" />
  );
};

export default CardImage;
