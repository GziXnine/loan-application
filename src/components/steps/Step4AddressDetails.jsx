import { forwardRef, useImperativeHandle } from 'react';

const Step4AddressDetails = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    validate: async () => true // Placeholder validation
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Address Details</h3>
      <p className="text-gray-500">Form fields will be implemented in Day 4.</p>
    </div>
  );
});

export default Step4AddressDetails;
