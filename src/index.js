import React from 'react';
import { createRoot } from 'react-dom';

const App = () => <h1>hello world</h1>;
const container = (document.getElementById('root'));
const root = createRoot(container)

root.render(<App />);