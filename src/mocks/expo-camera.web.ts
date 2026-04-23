import React from 'react';

export const Camera = {
  requestCameraPermissionsAsync: async () => ({ status: 'denied' as const }),
};

export const CameraView = () => null;

export default { Camera, CameraView };
