import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';

function App() {
  const [sessionId] = useState(() => {
    // Generate or retrieve session ID
    const stored = sessionStorage.getItem('chat-session-id');
    if (stored) return stored;
    
    const newId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('chat-session-id', newId);
    return newId;
  });

  useEffect(() => {
    document.title = 'Domain Analysis Chat';
  }, []);

  return (
    <div className="App">
      <ChatInterface />
      
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          height: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          overflow: hidden;
        }

        #root {
          height: 100%;
        }

        .App {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .App {
            padding: 0;
          }
          
          .chat-interface {
            height: 100vh;
            max-width: 100%;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
