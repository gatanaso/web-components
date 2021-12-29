import { color, typography } from './all-imports.js';

const style = document.createElement('style');
style.innerHTML = `${color.toString()} ${typography.toString()}`;
document.head.appendChild(style);

export * from './all-imports.js';
