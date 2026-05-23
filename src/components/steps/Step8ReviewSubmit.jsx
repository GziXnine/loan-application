import { forwardRef, useImperativeHandle } from 'react';

const Step8ReviewSubmit = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    validate: async () => true // Placeholder validation
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Review & Submit</h3>
      <p className="text-gray-500">Review screen will be implemented later.</p>
    </div>
  );
});

export default Step8ReviewSubmit;
