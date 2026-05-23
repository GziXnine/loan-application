import { forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step7Schema } from '../../utils/validationSchemas';
import useLoanStore from '../../store/loanStore';
import FileUpload from '../common/FileUpload';

const Step7Documents = forwardRef((props, ref) => {
  const stepData = useLoanStore((state) => state.getStepData(7));
  const updateStepData = useLoanStore((state) => state.updateStepData);

  const {
    control,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step7Schema),
    defaultValues: stepData,
    mode: 'onChange',
  });

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const isValid = await trigger();
      if (isValid) {
        updateStepData(7, getValues());
      }
      return isValid;
    },
  }));

  // Helper component to display selected files
  const FilePreview = ({ files, onRemove }) => {
    if (!files || files.length === 0) return null;
    return (
      <ul className="mt-3 space-y-2">
        {Array.from(files).map((file, index) => (
          <li key={`${file.name}-${index}`} className="flex items-center justify-between p-2 text-sm bg-white border border-surface-200 rounded-lg shadow-sm">
            <span className="truncate max-w-[200px] text-gray-700">{file.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              <button 
                type="button"
                onClick={() => onRemove(index)}
                className="text-error-500 hover:text-error-700 p-1"
                title="Remove file"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-semibold text-gray-900 mb-1">
          Upload Documents
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Please upload clear copies of the following documents. All files are encrypted before upload.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Controller
            name="identityProof"
            control={control}
            render={({ field }) => (
              <>
                <FileUpload
                  label="Identity Proof (PAN/Aadhaar/Passport)"
                  required
                  error={errors.identityProof?.message}
                  onChange={(files) => {
                    // Append files up to max limit of 3
                    const newFiles = [...(field.value || []), ...files].slice(0, 3);
                    field.onChange(newFiles);
                  }}
                />
                <FilePreview 
                  files={field.value} 
                  onRemove={(idx) => field.onChange(field.value.filter((_, i) => i !== idx))} 
                />
              </>
            )}
          />
        </div>

        <div>
          <Controller
            name="addressProof"
            control={control}
            render={({ field }) => (
              <>
                <FileUpload
                  label="Address Proof (Utility Bill/Rental Agreement)"
                  required
                  error={errors.addressProof?.message}
                  onChange={(files) => {
                    const newFiles = [...(field.value || []), ...files].slice(0, 3);
                    field.onChange(newFiles);
                  }}
                />
                <FilePreview 
                  files={field.value} 
                  onRemove={(idx) => field.onChange(field.value.filter((_, i) => i !== idx))} 
                />
              </>
            )}
          />
        </div>

        <div>
          <Controller
            name="incomeProof"
            control={control}
            render={({ field }) => (
              <>
                <FileUpload
                  label="Income Proof (Bank Statement/Salary Slips)"
                  required
                  error={errors.incomeProof?.message}
                  onChange={(files) => {
                    const newFiles = [...(field.value || []), ...files].slice(0, 3);
                    field.onChange(newFiles);
                  }}
                />
                <FilePreview 
                  files={field.value} 
                  onRemove={(idx) => field.onChange(field.value.filter((_, i) => i !== idx))} 
                />
              </>
            )}
          />
        </div>

        <div>
          <Controller
            name="additionalDocs"
            control={control}
            render={({ field }) => (
              <>
                <FileUpload
                  label="Additional Documents (Optional)"
                  error={errors.additionalDocs?.message}
                  onChange={(files) => {
                    const newFiles = [...(field.value || []), ...files].slice(0, 3);
                    field.onChange(newFiles);
                  }}
                />
                <FilePreview 
                  files={field.value} 
                  onRemove={(idx) => field.onChange(field.value.filter((_, i) => i !== idx))} 
                />
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
});

export default Step7Documents;
