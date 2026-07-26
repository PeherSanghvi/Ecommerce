import React from 'react';

const Skeleton = ({ className = '', variant = 'default' }) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variants = {
    default: 'h-4 w-full',
    text: 'h-4 w-3/4',
    title: 'h-8 w-1/2',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-48 w-full',
    button: 'h-10 w-24',
    input: 'h-10 w-full'
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} />
  );
};

export const SkeletonCard = () => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-full">
    <Skeleton variant="card" className="h-48 w-full rounded-none" />
    <div className="p-4 space-y-3 flex-1 flex flex-col">
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-2/3" />
      <Skeleton variant="title" className="w-1/3 mt-2" />
      <div className="mt-auto pt-4">
        <Skeleton variant="button" className="w-full rounded-full" />
      </div>
    </div>
  </div>
);

export default Skeleton;
