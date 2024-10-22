import React from 'react';
import { createRoot } from 'react-dom';
import WelcomeHome from './components/home';

const container = (document.getElementById('root'));
const root = createRoot(container)

root.render(<WelcomeHome />);