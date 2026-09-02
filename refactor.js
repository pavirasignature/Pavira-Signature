const fs = require('fs');
const path = require('path');

const files = [
  'frontend/app/dashboard/page.tsx',
  'frontend/app/admin/page.tsx'
];

const replacements = [
  // Layout Backgrounds
  { regex: /bg-\[\#1B2D20\]/g, replacement: 'bg-[#F9F6F0]' },
  { regex: /bg-\[\#1A2E20\]/g, replacement: 'bg-white' },
  { regex: /bg-\[\#111E16\]/g, replacement: 'bg-white' },
  { regex: /bg-\[\#243F2C\]/g, replacement: 'bg-[#F9F6F0]' },
  { regex: /bg-gradient-to-r from-\[\#243F2C\] to-\[\#1A2E20\]/g, replacement: 'bg-[#0C3A2E]' },
  { regex: /bg-gradient-to-b from-\[\#243F2C\] to-transparent/g, replacement: 'bg-[#0C3A2E]' },
  { regex: /bg-gradient-to-br from-\[\#1A2E20\] to-\[\#111E16\]/g, replacement: 'bg-white' },
  { regex: /bg-\[radial-gradient\([^)]+\)\]/g, replacement: 'bg-transparent' },
  
  // Text Colors
  { regex: /text-white/g, replacement: 'text-[#1A1A1A]' },
  { regex: /text-gray-400/g, replacement: 'text-[#1A1A1A]/60' },
  { regex: /text-gray-300/g, replacement: 'text-[#1A1A1A]/70' },
  { regex: /text-gray-500/g, replacement: 'text-[#1A1A1A]/40' },
  
  // Borders
  { regex: /border-\[\#D4AF37\]\/10/g, replacement: 'border-[#1A1A1A]/10' },
  { regex: /border-\[\#D4AF37\]\/15/g, replacement: 'border-[#1A1A1A]/10' },
  { regex: /border-\[\#D4AF37\]\/20/g, replacement: 'border-[#1A1A1A]/20' },
  { regex: /border-\[\#2A4734\]/g, replacement: 'border-[#1A1A1A]/10' },
  { regex: /hover:border-\[\#D4AF37\]\/35/g, replacement: 'hover:border-[#0C3A2E]/50' },
  { regex: /hover:border-\[\#D4AF37\]/g, replacement: 'hover:border-[#0C3A2E]' },
  
  // Typography
  { regex: /font-serif/g, replacement: 'font-brand' },
  { regex: /text-foreground/g, replacement: 'text-[#1A1A1A]' },
  
  // Specific Buttons / Accents
  { regex: /bg-primary/g, replacement: 'bg-[#0C3A2E]' },
  { regex: /text-primary-foreground/g, replacement: 'text-white' },
  
  // Rounding -> Sharp corners
  { regex: /rounded-2xl/g, replacement: 'rounded-none' },
  { regex: /rounded-xl/g, replacement: 'rounded-none' },
  { regex: /rounded-lg/g, replacement: 'rounded-none' },
  { regex: /rounded-full/g, replacement: 'rounded-none' },
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    replacements.forEach(({ regex, replacement }) => {
      content = content.replace(regex, replacement);
    });

    // Fix contrast issues created by blanket text-white -> text-[#1A1A1A] replacements
    content = content.replace(/bg-\[\#0C3A2E\] text-\[\#1A1A1A\]/g, 'bg-[#0C3A2E] text-white');
    content = content.replace(/bg-red-500 text-\[\#1A1A1A\]/g, 'bg-[#A85751] text-white');
    content = content.replace(/bg-green-500 text-\[\#1A1A1A\]/g, 'bg-[#2A7D6B] text-white');
    content = content.replace(/bg-red-600 text-\[\#1A1A1A\]/g, 'bg-[#A85751] text-white');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored ${file}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});
