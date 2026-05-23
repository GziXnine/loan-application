import { forwardRef, useImperativeHandle } from 'react';

const Step7Documents = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    validate: async () => true // Placeholder validation
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Document Uploads</h3>
      <p className="text-gray-500">Form fields will be implemented later.</p>
    </div>
  );
});

export default Step7Documents;
