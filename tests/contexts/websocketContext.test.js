import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  WebSocketProvider,
  WebsocketContext,
} from '../../src/context/websocketContext';


class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    this.close = jest.fn();
  }
}


const TestComponent = () => {
  const websocket = React.useContext(WebsocketContext);
  return (
    <div>
      {websocket && websocket.current ? (
        <div>WebSocket Connected</div>
      ) : (
        <div>Not Connected</div>
      )}
    </div>
  );
};

describe('WebSocketProvider', () => {
  let originalWebSocket;
  let originalEnv;
  let mockWebSocket;

  beforeEach(() => {
    originalWebSocket = global.WebSocket;
    originalEnv = process.env;

    
    mockWebSocket = new MockWebSocket('ws://test');
    global.WebSocket = jest.fn(() => mockWebSocket);

    
    process.env = {
      ...process.env,
      REACT_APP_WS_URL: 'ws://test-websocket-url',
    };

    
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    global.WebSocket = originalWebSocket;
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    render(
      <WebSocketProvider>
        <TestComponent />
      </WebSocketProvider>
    );

    expect(screen.getByText('Loading Websocket..')).toBeInTheDocument();
  });

  it('initializes WebSocket with correct URL', () => {
    render(
      <WebSocketProvider>
        <TestComponent />
      </WebSocketProvider>
    );

    expect(global.WebSocket).toHaveBeenCalledWith('ws://test-websocket-url');
  });

  it('provides WebSocket reference after connection is ready', async () => {
    render(
      <WebSocketProvider>
        <TestComponent />
      </WebSocketProvider>
    );

    
    expect(screen.getByText('Loading Websocket..')).toBeInTheDocument();

    
    await act(async () => {
      mockWebSocket.onopen();
    });

    
    expect(screen.getByText('WebSocket Connected')).toBeInTheDocument();
  });

  it('handles WebSocket messages correctly', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const testMessage = { type: 'test', content: 'Hello' };

    render(
      <WebSocketProvider>
        <TestComponent />
      </WebSocketProvider>
    );

    
    await act(async () => {
      mockWebSocket.onopen();
    });

    
    await act(async () => {
      mockWebSocket.onmessage({ data: JSON.stringify(testMessage) });
    });

    expect(consoleSpy).toHaveBeenCalledWith('Message received:', testMessage);
  });

  it('handles WebSocket errors correctly', async () => {
    const consoleSpy = jest.spyOn(console, 'error');
    const testError = new Error('Test WebSocket error');

    render(
      <WebSocketProvider>
        <TestComponent />
      </WebSocketProvider>
    );

    
    await act(async () => {
      mockWebSocket.onerror(testError);
    });

    expect(consoleSpy).toHaveBeenCalledWith('WebSocket Error:', testError);
  });

  it('handles WebSocket close correctly', async () => {
    const consoleSpy = jest.spyOn(console, 'log');

    render(
      <WebSocketProvider>
        <TestComponent />
      </WebSocketProvider>
    );

    
    await act(async () => {
      mockWebSocket.onclose();
    });

    expect(consoleSpy).toHaveBeenCalledWith('WebSocket connection closed');
  });

  it('cleans up WebSocket connection on unmount', async () => {
    const { unmount } = render(
      <WebSocketProvider>
        <TestComponent />
      </WebSocketProvider>
    );

    
    await act(async () => {
      mockWebSocket.onopen();
    });

    
    unmount();

    
    expect(mockWebSocket.close).toHaveBeenCalled();
  });

  it('maintains WebSocket reference across multiple consumers', async () => {
    const AnotherTestComponent = () => {
      const websocket = React.useContext(WebsocketContext);
      return websocket && websocket.current ? (
        <div>Another Component Connected</div>
      ) : null;
    };

    render(
      <WebSocketProvider>
        <TestComponent />
        <AnotherTestComponent />
      </WebSocketProvider>
    );

    
    await act(async () => {
      mockWebSocket.onopen();
    });

    expect(screen.getByText('WebSocket Connected')).toBeInTheDocument();
    expect(screen.getByText('Another Component Connected')).toBeInTheDocument();
  });
});
