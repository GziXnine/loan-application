import { forwardRef, useImperativeHandle } from 'react';

const Step3KYCVerification = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    validate: async () => true // Placeholder validation
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">KYC Verification</h3>
      <p className="text-gray-500">Form fields will be implemented in Day 3.</p>
    </div>
  );
});

export default Step3KYCVerification;
