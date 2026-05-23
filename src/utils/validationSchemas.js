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
