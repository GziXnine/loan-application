import { z } from 'zod';

export const step1Schema = z.object({
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
  loanPurpose: z.string().min(5, 'Please provide a valid purpose (min 5 characters)'),
});

export const step2Schema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters').regex(/^[A-Za-z\s]+$/, 'Only alphabets are allowed'),
  dateOfBirth: z.string().refine((date) => {
    const dob = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 18 && age <= 65;
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
});

export const step3Schema = z.object({
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)'),
  isPanVerified: z.boolean().refine((val) => val === true, {
    message: 'Please verify your PAN to proceed',
  }),
  aadhaarNumber: z.string().regex(/^\d{12}$/, 'Aadhaar must be exactly 12 digits'),
  isAadhaarVerified: z.boolean().refine((val) => val === true, {
    message: 'Please verify your Aadhaar to proceed',
  }),
});

export const step4Schema = z.object({
  residenceType: z.enum(['owned', 'rented', 'company_provided', 'family_owned'], {
    required_error: 'Please select residence type',
  }),
  currentAddress: z.string().min(10, 'Address must be at least 10 characters').max(200, 'Address is too long'),
  city: z.string().min(2, 'City name is required'),
  state: z.string().min(2, 'State name is required'),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Invalid Indian pincode'),
  yearsAtCurrentAddress: z.coerce.number().min(0, 'Cannot be negative').max(100, 'Invalid years'),
  rentAmount: z.coerce.number().optional().or(z.literal('')),
}).refine(
  (data) => {
    if (data.residenceType === 'rented' && (!data.rentAmount || data.rentAmount <= 0)) {
      return false;
    }
    return true;
  },
  {
    message: 'Rent amount is required for rented residence',
    path: ['rentAmount'],
  }
);

export const step5Schema = z.object({
  employmentType: z.enum(['salaried', 'self_employed'], {
    required_error: 'Please select employment type',
  }),
  // Salaried fields
  companyName: z.string().optional(),
  designation: z.string().optional(),
  workExperience: z.coerce.number().optional(),
  monthlyIncome: z.coerce.number().optional(),
  // Self-employed fields
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  businessVintage: z.coerce.number().optional(),
  annualTurnover: z.coerce.number().optional(),
  monthlyProfit: z.coerce.number().optional(),
  companyRegistrationNumber: z.string().optional(),
  gstNumber: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.employmentType === 'salaried') {
    if (!data.companyName || data.companyName.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Company name is required', path: ['companyName'] });
    }
    if (!data.designation || data.designation.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Designation is required', path: ['designation'] });
    }
    if (data.workExperience === undefined || data.workExperience < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valid experience is required', path: ['workExperience'] });
    }
    if (!data.monthlyIncome || data.monthlyIncome <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Monthly income is required', path: ['monthlyIncome'] });
    }
  } else if (data.employmentType === 'self_employed') {
    if (!data.businessName || data.businessName.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Business name is required', path: ['businessName'] });
    }
    if (!data.businessType) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Business type is required', path: ['businessType'] });
    }
    if (data.businessVintage === undefined || data.businessVintage < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valid vintage is required', path: ['businessVintage'] });
    }
    if (!data.annualTurnover || data.annualTurnover <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Annual turnover is required', path: ['annualTurnover'] });
    }
    if (data.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(data.gstNumber)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid GST format', path: ['gstNumber'] });
    }
  }
});

export const step6Schema = z.object({
  hasCoapplicant: z.boolean(),
  coapplicantName: z.string().optional(),
  coapplicantRelationship: z.string().optional(),
  coapplicantIncome: z.coerce.number().optional(),
  coapplicantEmail: z.string().optional(),
  coapplicantMobile: z.string().optional(),
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
  }
});

export const step7Schema = z.object({
  identityProof: z.array(z.any()).min(1, 'Identity proof is required'),
  addressProof: z.array(z.any()).min(1, 'Address proof is required'),
  incomeProof: z.array(z.any()).min(1, 'Income proof is required'),
  additionalDocs: z.array(z.any()).optional(),
});

export const step8Schema = z.object({
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Terms and Conditions',
  }),
  kfsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge the Key Fact Statement',
  }),
  consentToDataProcessing: z.boolean().refine((val) => val === true, {
    message: 'You must consent to data processing',
  }),
  signature: z.string({
    required_error: 'Signature is required',
  }).min(10, 'Signature is required'), // Data URL will be much longer than 10 chars
});
