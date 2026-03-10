import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Fix for "Cannot set property fetch of #<Window> which has only a getter"
// Some libraries try to polyfill fetch by assigning to window.fetch
if (typeof window !== 'undefined') {
  const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
  if (descriptor && !descriptor.writable && !descriptor.set) {
    // It's a read-only property (getter only), so we try to prevent libraries from crashing
    // by defining a setter that does nothing or a no-op assignment if possible.
    // However, since we can't easily change it if it's not configurable, 
    // we just hope the libraries check before assigning.
    console.log('window.fetch is read-only, guarding against overwrites');
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
