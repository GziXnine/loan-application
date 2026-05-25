import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Checkbox from '../Checkbox';

test('fires onChange when checkbox is clicked', async () => {
  const handleChange = vi.fn();
  const user = userEvent.setup();

  render(
    <Checkbox
      label="I accept the terms"
      name="terms"
      checked={false}
      onChange={handleChange}
    />
  );

  const checkbox = screen.getByRole('checkbox', { name: /i accept the terms/i });
  await user.click(checkbox);

  expect(handleChange).toHaveBeenCalled();
});
