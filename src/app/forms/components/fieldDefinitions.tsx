// app/forms/components/fieldDefinitions.tsx
import React from 'react';
import {
  Type as TextIcon,
  Pilcrow as ParagraphIcon,
  Phone as PhoneIcon,
  Hash as HashIcon,
  ChevronDown,
  CheckSquare,
  CircleDot as RadioIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon
} from 'lucide-react';
import { FieldType } from '../../../types/formTypes';

export const FIELD_DEFINITIONS: { type: FieldType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Text', icon: <TextIcon /> },
  { type: 'textarea', label: 'Paragraph', icon: <ParagraphIcon /> },
  { type: 'tel', label: 'Phone', icon: <PhoneIcon /> },
  { type: 'number', label: 'Number', icon: <HashIcon /> },
  { type: 'date', label: 'Date', icon: <CalendarIcon /> },
  { type: 'time', label: 'Time', icon: <ClockIcon /> },
  { type: 'dropdown', label: 'Dropdown', icon: <ChevronDown /> },
  { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare /> },
  { type: 'radio', label: 'Radio Group', icon: <RadioIcon /> },
];
