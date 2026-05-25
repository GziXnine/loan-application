import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Select from '../Select';

test('allows selecting options in custom variant', async () => {
  const handleChange = vi.fn();
  const user = userEvent.setup();

  render(
    <Select
      label="Loan Type"
      name="loanType"
      variant="custom"
      value=""
      onChange={handleChange}
      options={[
        { value: 'personal', label: 'Personal Loan' },
        { value: 'home', label: 'Home Loan' },
      ]}
    />
  );

  const button = screen.getByRole('button');
  await user.click(button);

  const option = screen.getByRole('option', { name: 'Personal Loan' });
  await user.click(option);

  expect(handleChange).toHaveBeenCalled();
  expect(handleChange.mock.calls[0][0].target.value).toBe('personal');
});
