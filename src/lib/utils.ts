// src/lib/utils.ts
// Dummy cn function to prevent import errors after removing Tailwind CSS.
// Styling will not work as originally intended.
export function cn(...inputs: any[]): string {
  return inputs.filter(Boolean).join(' ');
}
