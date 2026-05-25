import { z } from 'zod';
import {
  buildStep1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  buildStep5Schema,
  step6Schema,
  step7Schema,
  step8Schema,
} from './validationSchemas';

/**
 * Returns the correct Zod schema for a given step, incorporating
 * all cross-step validation dependencies.
 *
 * @param {number} stepId - The current step number (1-8)
 * @param {object} formData - The complete global form state from useLoanStore
 */
export function getSchemaForStep(stepId, formData) {
  switch (stepId) {
    case 1: {
      // Step 1: Needs DOB from Step 2 for age at maturity calculation.
      const dateOfBirth = formData?.step2?.dateOfBirth;
      return buildStep1Schema(dateOfBirth);
    }
    case 2: {
      return step2Schema;
    }
    case 3: {
      return step3Schema;
    }
    case 4: {
      return step4Schema;
    }
    case 5: {
      // Step 5: Business loans require self-employed or business owner.
      const loanType = formData?.step1?.loanType;
      return buildStep5Schema(loanType);
    }
    case 6: {
      // Step 6 has complex rules internally, but doesn't depend on other steps
      // in terms of field-level validation, except for its visibility.
      return step6Schema;
    }
    case 7: {
      // Step 7: Documents required based on loan type and employment
      const loanType = formData?.step1?.loanType;
      const employmentType = formData?.step5?.employmentType;
      const residenceType = formData?.step4?.residenceType;
      const hasCoapplicant = formData?.step6?.hasCoapplicant;

      return step7Schema.superRefine((data, ctx) => {
        // Business proof
        if (loanType === 'business' && (!data.additionalDocs || data.additionalDocs.length === 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Business Registration Document is required for business loans',
            path: ['additionalDocs'],
          });
        }
        
        // Income proof
        if ((employmentType === 'salaried' || employmentType === 'self_employed' || employmentType === 'business_owner') && (!data.incomeProof || data.incomeProof.length === 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Income Proof is required based on your employment type',
            path: ['incomeProof'],
          });
        }

        // Rent agreement
        if (residenceType === 'rented' && (!data.addressProof || data.addressProof.length === 0)) {
           // We might need to make sure one of the address proofs is a rent agreement, 
           // but checking length > 0 is a proxy for now if they haven't uploaded anything.
           // Usually address proof handles it, but let's enforce address proof here.
           if (!data.addressProof || data.addressProof.length === 0) {
             ctx.addIssue({
               code: z.ZodIssueCode.custom,
               message: 'Rent Agreement is required as address proof for rented residence',
               path: ['addressProof'],
             });
           }
        }
      });
    }
    case 8: {
      // Step 8: Submission rules and consents
      const isPanVerified = formData?.step3?.isPanVerified;
      const isAadhaarVerified = formData?.step3?.isAadhaarVerified;

      return step8Schema.superRefine((data, ctx) => {
        if (!isPanVerified || !isAadhaarVerified) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'PAN and Aadhaar must be verified before submission.',
            path: ['declarationAccepted'], // attach to top level or declaration
          });
        }
      });
    }
    default:
      return z.any();
  }
}
