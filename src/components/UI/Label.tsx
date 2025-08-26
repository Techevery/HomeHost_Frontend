// ui/Label.tsx
import React, { FC, LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

const Label: FC<LabelProps> = ({ children, ...props }) => (
  <label className="block text-gray-700 font-semibold mb-2" {...props}>
    {children}
  </label>
);

export default Label;