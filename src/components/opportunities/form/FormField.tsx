
import React from 'react';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ id, label, children }) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <div className="col-span-3">
        {children}
      </div>
    </div>
  );
};

export default FormField;
