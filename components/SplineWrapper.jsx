'use client';

import Spline from '@splinetool/react-spline';

export default function SplineWrapper({ sceneUrl }) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Spline scene={sceneUrl} />
    </div>
  );
}