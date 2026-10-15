import { useCallback, useState } from 'react';
import { validateCustomer } from '../lib/customer-form.js';

const emptyCustomer = { customerName: '', phone: '' };

// Isian data diri disimpan di alur (bukan di form) agar tetap ada setelah konflik 409.
export function useCustomerDetails() {
  const [values, setValues] = useState(emptyCustomer);
  const [errors, setErrors] = useState({});
  const update = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }, []);
  const validate = useCallback(() => {
    const found = validateCustomer(values);
    setErrors(found);
    return found;
  }, [values]);
  const clear = useCallback(() => {
    setValues(emptyCustomer);
    setErrors({});
  }, []);
  return { values, errors, update, validate, clear };
}
