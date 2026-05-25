import { z } from 'zod';
import { validateAadhaar, validateGST, validatePAN } from './validators';

const loanConstraintsByType = {
  personal: { minAmount: 10000, maxAmount: 2000000, minTenure: 6, maxTenure: 60 },
  home: { minAmount: 500000, maxAmount: 50000000, minTenure: 60, maxTenure: 360 },
  business: { minAmount: 100000, maxAmount: 20000000, minTenure: 12, maxTenure: 120 },
};

const getLoanConstraints = (loanType) => (
  loanConstraintsByType[loanType] || { minAmount: 10000, maxAmount: 50000000, minTenure: 6, maxTenure: 360 }
);

const computeAge = (dateString) => {
  if (!dateString) return null;
  const dob = new Date(dateString);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
};

export const buildStep1Schema = (dateOfBirth) => z.object({
  loanType: z.enum(['personal', 'home', 'business'], {
    required_error: 'Please select a loan type',
  }),
  loanAmount: z.coerce.number({
    required_error: 'Loan amount is required',
    invalid_type_error: 'Must be a valid number',
  }).min(10000, 'Minimum loan amount is ₹10,000')
    .max(50000000, 'Maximum loan amount is ₹5,00,00,000'),
  loanTenure: z.coerce.number({
    required_error: 'Please select a tenure',
  }).min(6, 'Minimum tenure is 6 months')
    .max(360, 'Maximum tenure is 360 months'),
  loanPurpose: z.string().min(2, 'Please select a valid purpose'),
}).superRefine((data, ctx) => {
  const { minAmount, maxAmount, minTenure, maxTenure } = getLoanConstraints(data.loanType);
  if (data.loanAmount < minAmount || data.loanAmount > maxAmount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Loan amount must be between ₹${minAmount.toLocaleString('en-IN')} and ₹${maxAmount.toLocaleString('en-IN')}`,
      path: ['loanAmount'],
    });
  }
  if (data.loanTenure < minTenure || data.loanTenure > maxTenure) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Tenure must be between ${minTenure} and ${maxTenure} months`,
      path: ['loanTenure'],
    });
  }

  const age = computeAge(dateOfBirth);
  if (age !== null) {
    const tenureYears = data.loanTenure / 12;
    if (age + tenureYears > 65) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Tenure exceeds the maximum allowed age of 65 years',
        path: ['loanTenure'],
      });
    }
  }
});

export const step2Schema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters').regex(/^[A-Za-z\s]+$/, 'Only alphabets are allowed'),
  dateOfBirth: z.string().refine((date) => {
    const age = computeAge(date);
    return age !== null && age >= 18 && age <= 65;
  }, 'Applicant must be between 18 and 65 years old'),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Please select your gender',
  }),
  email: z.string().email('Please enter a valid email address'),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  alternateMobile: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number').optional().or(z.literal('')),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed'], {
    required_error: 'Please select your marital status',
  }),
}).superRefine((data, ctx) => {
  if (data.alternateMobile && data.alternateMobile === data.mobileNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Alternate mobile number must be different from primary number',
      path: ['alternateMobile'],
    });
  }
});

export const step3Schema = z.object({
  panNumber: z.string().refine((val) => validatePAN(val), 'Invalid PAN format (e.g. ABCDE1234F)'),
  isPanVerified: z.boolean().refine((val) => val === true, {
    message: 'Please verify your PAN to proceed',
  }),
  aadhaarNumber: z.string().refine((val) => validateAadhaar(val), 'Invalid Aadhaar number'),
  isAadhaarVerified: z.boolean().refine((val) => val === true, {
    message: 'Please verify your Aadhaar to proceed',
  }),
  aadhaarConsent: z.boolean().refine((val) => val === true, {
    message: 'Please provide consent to proceed',
  }),
});

const pincodeSchema = z.string().regex(/^[1-9][0-9]{5}$/, 'Invalid Indian pincode');

export const step4Schema = z.object({
  residenceType: z.enum(['owned', 'rented', 'company_provided', 'family_owned'], {
    required_error: 'Please select residence type',
  }),
  currentAddress: z.string().min(10, 'Address must be at least 10 characters').max(200, 'Address is too long'),
  city: z.string().min(2, 'City name is required'),
  state: z.string().min(2, 'State name is required'),
  pincode: pincodeSchema,
  yearsAtCurrentAddress: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.coerce.number({ required_error: 'Years at current address is required' })
      .min(0, 'Cannot be negative')
      .max(100, 'Invalid years')
  ),
  rentAmount: z.coerce.number().optional().or(z.literal('')),
  sameAsPermanent: z.boolean(),
  permanentAddress: z.string().optional().or(z.literal('')),
  permanentCity: z.string().optional().or(z.literal('')),
  permanentState: z.string().optional().or(z.literal('')),
  permanentPincode: z.string().optional().or(z.literal('')),
  previousAddress: z.string().optional().or(z.literal('')),
  previousCity: z.string().optional().or(z.literal('')),
  previousState: z.string().optional().or(z.literal('')),
  previousPincode: z.string().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.residenceType === 'rented' && (!data.rentAmount || data.rentAmount <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Rent amount is required for rented residence',
      path: ['rentAmount'],
    });
  }

  if (!data.sameAsPermanent) {
    if (!data.permanentAddress || data.permanentAddress.length < 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Permanent address is required', path: ['permanentAddress'] });
    }
    if (!data.permanentCity || data.permanentCity.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Permanent city is required', path: ['permanentCity'] });
    }
    if (!data.permanentState || data.permanentState.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Permanent state is required', path: ['permanentState'] });
    }
    if (!data.permanentPincode || !pincodeSchema.safeParse(data.permanentPincode).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Permanent pincode is invalid', path: ['permanentPincode'] });
    }
  }

  if (Number(data.yearsAtCurrentAddress) < 1) {
    if (!data.previousAddress || data.previousAddress.length < 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Previous address is required', path: ['previousAddress'] });
    }
    if (!data.previousCity || data.previousCity.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Previous city is required', path: ['previousCity'] });
    }
    if (!data.previousState || data.previousState.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Previous state is required', path: ['previousState'] });
    }
    if (!data.previousPincode || !pincodeSchema.safeParse(data.previousPincode).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Previous pincode is invalid', path: ['previousPincode'] });
    }
  }
});

const salariedSchema = z.object({
  employmentType: z.literal('salaried'),
  companyName: z.string().min(2, 'Company name is required'),
  designation: z.string().min(2, 'Designation is required'),
  workExperience: z.coerce.number().min(0, 'Valid experience is required'),
  monthlyIncome: z.coerce.number().min(1, 'Monthly income is required'),
});

const selfEmployedSchema = z.object({
  employmentType: z.literal('self_employed'),
  businessName: z.string().min(2, 'Business name is required'),
  businessType: z.string().min(2, 'Business type is required'),
  businessVintage: z.coerce.number().min(0, 'Valid vintage is required'),
  annualTurnover: z.coerce.number().min(1, 'Annual turnover is required'),
  monthlyProfit: z.coerce.number().optional().or(z.literal('')),
  companyRegistrationNumber: z.string().optional().or(z.literal('')),
  gstNumber: z.string().optional().or(z.literal('')).refine((val) => !val || validateGST(val), 'Invalid GST format'),
});

const businessOwnerSchema = z.object({
  employmentType: z.literal('business_owner'),
  businessName: z.string().min(2, 'Business name is required'),
  businessType: z.string().min(2, 'Business type is required'),
  businessVintage: z.coerce.number().min(0, 'Valid vintage is required'),
  annualTurnover: z.coerce.number().min(1, 'Annual turnover is required'),
  monthlyProfit: z.coerce.number().optional().or(z.literal('')),
  companyRegistrationNumber: z.string().min(6, 'Company registration number is required'),
  gstNumber: z.string().min(15, 'GST number is required').refine((val) => validateGST(val), 'Invalid GST format'),
});

const baseEmploymentSchema = z.discriminatedUnion('employmentType', [
  salariedSchema,
  selfEmployedSchema,
  businessOwnerSchema,
]);

export const buildStep5Schema = (loanType) => baseEmploymentSchema.superRefine((data, ctx) => {
  if (loanType === 'business' && data.employmentType === 'salaried') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Business loans require Self-Employed or Business Owner status',
      path: ['employmentType'],
    });
  }
});

export const step6Schema = z.object({
  hasCoapplicant: z.boolean(),
  coapplicantName: z.string().optional().or(z.literal('')),
  coapplicantRelationship: z.string().optional().or(z.literal('')),
  coapplicantIncome: z.coerce.number().optional().or(z.literal('')),
  coapplicantEmail: z.string().optional().or(z.literal('')),
  coapplicantMobile: z.string().optional().or(z.literal('')),
  coapplicantPan: z.string().optional().or(z.literal('')),
  isCoapplicantPanVerified: z.boolean().optional(),
  coapplicantConsent: z.boolean().optional(),
  coapplicantSignature: z.string().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.hasCoapplicant) {
    if (!data.coapplicantName || data.coapplicantName.length < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Full name must be at least 3 characters', path: ['coapplicantName'] });
    }
    if (!data.coapplicantRelationship) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select a relationship', path: ['coapplicantRelationship'] });
    }
    if (!data.coapplicantIncome || data.coapplicantIncome <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Income is required', path: ['coapplicantIncome'] });
    }
    if (!data.coapplicantEmail || !/^\S+@\S+\.\S+$/.test(data.coapplicantEmail)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valid email is required', path: ['coapplicantEmail'] });
    }
    if (!data.coapplicantMobile || !/^[6-9]\d{9}$/.test(data.coapplicantMobile)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valid 10-digit mobile is required', path: ['coapplicantMobile'] });
    }
    if (!data.coapplicantPan || !validatePAN(data.coapplicantPan)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valid PAN is required', path: ['coapplicantPan'] });
    }
    if (data.isCoapplicantPanVerified !== true) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please verify co-applicant PAN', path: ['isCoapplicantPanVerified'] });
    }
    if (data.coapplicantConsent !== true) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Consent is required', path: ['coapplicantConsent'] });
    }
    if (!data.coapplicantSignature || data.coapplicantSignature.length < 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Co-applicant signature is required', path: ['coapplicantSignature'] });
    }
  }
});

export const step7Schema = z.object({
  identityProof: z.array(z.any()).optional(),
  addressProof: z.array(z.any()).optional(),
  incomeProof: z.array(z.any()).optional(),
  additionalDocs: z.array(z.any()).optional(),
  signature: z.string({
    required_error: 'Signature is required',
  }).min(10, 'Signature is required'),
});

export const step8Schema = z.object({
  declarationAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must confirm the declaration',
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Terms and Conditions',
  }),
  kfsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge the Key Fact Statement',
  }),
  consentToDataProcessing: z.boolean().refine((val) => val === true, {
    message: 'You must consent to data processing',
  }),
  highEmiConsent: z.boolean().optional(),
});
