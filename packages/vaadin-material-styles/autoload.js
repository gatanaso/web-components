import { colorLight, typography } from './all-imports.js';

const color = colorLight.toString().replace(/:host,[\s\S].+#host-fix/, 'html');

const style = document.createElement('style');
style.innerHTML = `${color} ${typography.toString()}`;
document.head.appendChild(style);

export * from './all-imports.js';
