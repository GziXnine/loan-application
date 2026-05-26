/** @format */

import {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSchemaForStep } from '../../utils/schemaFactory';
import useLoanStore from '../../store/loanStore';
import FileUpload from '../common/FileUpload';
import SignatureCanvas from '../common/SignatureCanvas';

// Helper component to display selected files
function FilePreviewItem({ file, onRemove }) {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
    return undefined;
  }, [file]);

  const isPdf = file.type === 'application/pdf';

  return (
    <li className="flex items-center justify-between p-2 text-sm bg-white border border-surface-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={file.name}
            className="w-10 h-10 rounded-lg object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center text-gray-400">
            {isPdf ? (
              <span className="text-xs font-semibold text-error-600">
                PDF
              </span>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h10M7 12h10M7 17h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
                />
              </svg>
            )}
          </div>
        )}
        <div className="min-w-0">
          <span className="truncate block max-w-[220px] text-gray-700">
            {file.name}
          </span>
          <span className="text-xs text-gray-400">
            {(file.size / 1024 / 1024).toFixed(2)}
            {' '}
            MB
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-error-500 hover:text-error-700 p-1"
        title="Remove file"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </li>
  );
}

function FilePreview({ files, onRemove }) {
  if (!files || files.length === 0) return null;
  return (
    <ul className="mt-3 space-y-2">
      {Array.from(files).map((file, index) => (
        <FilePreviewItem
          key={file.name}
          file={file}
          onRemove={() => onRemove(index)}
        />
      ))}
    </ul>
  );
}

const Step7Documents = forwardRef((props, ref) => {
  const stepData = useLoanStore((state) => state.getStepData(7));
  const updateStepData = useLoanStore((state) => state.updateStepData);
  const loanType = useLoanStore((state) => state.formData.step1.loanType);
  const employmentType = useLoanStore(
    (state) => state.formData.step5.employmentType,
  );
  const isPanVerified = useLoanStore(
    (state) => state.formData.step3.isPanVerified,
  );

  const signatureRef = useRef(null);
  const statusTimersRef = useRef({});
  const [docStatus, setDocStatus] = useState({
    identityProof: 'pending',
    addressProof: 'pending',
    incomeProof: 'pending',
    additionalDocs: 'pending',
  });

  const formData = useLoanStore((state) => state.formData);

  const {
    control,
    trigger,
    getValues,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getSchemaForStep(7, formData)),
    defaultValues: stepData,
    mode: 'onChange',
  });

  const identityProof = watch('identityProof');
  const addressProof = watch('addressProof');
  const incomeProof = watch('incomeProof');
  const additionalDocs = watch('additionalDocs');

  const requiresAdditionalDocs = useMemo(
    () => loanType === 'home'
      || loanType === 'business'
      || ['self_employed', 'business_owner'].includes(employmentType),
    [loanType, employmentType],
  );

  const documentRequirements = useMemo(
    () => [
      {
        key: 'identityProof',
        label: isPanVerified
          ? 'Identity Proof (Optional - PAN verified)'
          : 'Identity Proof (PAN/Aadhaar/Passport)',
        required: !isPanVerified,
      },
      {
        key: 'addressProof',
        label: 'Address Proof (Utility Bill/Rental Agreement)',
        required: true,
      },
      {
        key: 'incomeProof',
        label: 'Income Proof (Bank Statement/Salary Slips)',
        required: true,
      },
      {
        key: 'additionalDocs',
        label: requiresAdditionalDocs
          ? 'Additional Documents (Property/Business Proofs)'
          : 'Additional Documents (Optional)',
        required: requiresAdditionalDocs,
      },
    ],
    [isPanVerified, requiresAdditionalDocs],
  );

  const updateStatusFor = (key, files) => {
    if (statusTimersRef.current[key]) {
      clearTimeout(statusTimersRef.current[key]);
    }

    if (!files || files.length === 0) {
      setDocStatus((prev) => ({ ...prev, [key]: 'pending' }));
      return;
    }

    setDocStatus((prev) => ({ ...prev, [key]: 'uploaded' }));
    statusTimersRef.current[key] = setTimeout(() => {
      setDocStatus((prev) => ({ ...prev, [key]: 'verified' }));
    }, 1000);
  };

  useEffect(
    () => updateStatusFor('identityProof', identityProof),
    [identityProof],
  );
  useEffect(
    () => updateStatusFor('addressProof', addressProof),
    [addressProof],
  );
  useEffect(() => updateStatusFor('incomeProof', incomeProof), [incomeProof]);
  useEffect(
    () => updateStatusFor('additionalDocs', additionalDocs),
    [additionalDocs],
  );

  useEffect(() => {
    if (identityProof && identityProof.length > 0) clearErrors('identityProof');
  }, [identityProof, clearErrors]);

  useEffect(() => {
    if (addressProof && addressProof.length > 0) clearErrors('addressProof');
  }, [addressProof, clearErrors]);

  useEffect(() => {
    if (incomeProof && incomeProof.length > 0) clearErrors('incomeProof');
  }, [incomeProof, clearErrors]);

  useEffect(() => {
    if (additionalDocs && additionalDocs.length > 0) clearErrors('additionalDocs');
  }, [additionalDocs, clearErrors]);

  useEffect(
    () => () => {
      Object.values(statusTimersRef.current).forEach((timer) => clearTimeout(timer));
    },
    [],
  );

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const isValid = await trigger();
      const values = getValues();
      let hasManualErrors = false;

      documentRequirements.forEach((doc) => {
        if (
          doc.required
          && (!values[doc.key] || values[doc.key].length === 0)
        ) {
          setError(doc.key, {
            type: 'manual',
            message: 'This document is required',
          });
          hasManualErrors = true;
        } else {
          clearErrors(doc.key);
        }
      });

      if (signatureRef.current) {
        const sigData = signatureRef.current.getSignature();
        if (sigData) {
          values.signature = sigData;
          clearErrors('signature');
        } else {
          setError('signature', {
            type: 'manual',
            message: 'Signature is required',
          });
          hasManualErrors = true;
        }
      }

      if (isValid && !hasManualErrors) {
        updateStepData(7, values);
      }
      return isValid && !hasManualErrors;
    },
  }));

  const statusBadge = (status) => {
    if (status === 'verified') return 'badge-success';
    if (status === 'uploaded') return 'badge-primary';
    return 'badge-warning';
  };

  const formatStatus = (status) => status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-semibold text-gray-900 mb-1">
          Upload Documents
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Please upload clear copies of the following documents. All files are
          encrypted before upload.
        </p>
      </div>

      <div className="bg-surface-50 border border-surface-200 rounded-xl p-5">
        <h4 className="font-heading font-semibold text-gray-900 mb-3">
          Document Checklist
        </h4>
        <ul className="space-y-2 text-sm">
          {documentRequirements.map((doc) => (
            <li key={doc.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700">
                <span>{doc.label}</span>
                {doc.required ? (
                  <span className="text-error-500 text-xs">Required</span>
                ) : (
                  <span className="text-gray-400 text-xs">Optional</span>
                )}
              </div>
              <span className={`badge ${statusBadge(docStatus[doc.key])}`}>
                {formatStatus(docStatus[doc.key])}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Controller
            name="identityProof"
            control={control}
            render={({ field }) => (
              <FileUpload
                label={
                  isPanVerified
                    ? 'Identity Proof (Optional - PAN verified)'
                    : 'Identity Proof (PAN/Aadhaar/Passport)'
                }
                required={!isPanVerified}
                error={errors.identityProof?.message}
                value={field.value}
                onChange={field.onChange}
                renderPreview={(files, onRemove) => (
                  <FilePreview files={files} onRemove={onRemove} />
                )}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="addressProof"
            control={control}
            render={({ field }) => (
              <FileUpload
                label="Address Proof (Utility Bill/Rental Agreement)"
                required
                error={errors.addressProof?.message}
                value={field.value}
                onChange={field.onChange}
                renderPreview={(files, onRemove) => (
                  <FilePreview files={files} onRemove={onRemove} />
                )}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="incomeProof"
            control={control}
            render={({ field }) => (
              <FileUpload
                label="Income Proof (Bank Statement/Salary Slips)"
                required
                error={errors.incomeProof?.message}
                value={field.value}
                onChange={field.onChange}
                renderPreview={(files, onRemove) => (
                  <FilePreview files={files} onRemove={onRemove} />
                )}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="additionalDocs"
            control={control}
            render={({ field }) => (
              <FileUpload
                label={
                  requiresAdditionalDocs
                    ? 'Additional Documents (Property/Business Proofs)'
                    : 'Additional Documents (Optional)'
                }
                required={requiresAdditionalDocs}
                error={errors.additionalDocs?.message}
                value={field.value}
                onChange={field.onChange}
                renderPreview={(files, onRemove) => (
                  <FilePreview files={files} onRemove={onRemove} />
                )}
              />
            )}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-surface-200">
        <h4 className="font-heading font-semibold text-gray-900 mb-4">
          E-Signature
        </h4>
        <Controller
          name="signature"
          control={control}
          render={({ field }) => (
            <SignatureCanvas
              ref={signatureRef}
              label="Please sign to confirm your document submissions"
              required
              error={errors.signature?.message}
              onEnd={(data) => {
                field.onChange(data);
                if (data) clearErrors('signature');
              }}
            />
          )}
        />
      </div>
    </div>
  );
});

export default Step7Documents;
