import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import WebSocketComponent from '../../src/components/home';
import { UserContext } from '../../src/context/userContext';

class MockWebSocket {
  constructor() {
    this.readyState = WebSocket.OPEN;
    this.send = jest.fn();
    this.close = jest.fn();
  }
}

describe('WebSocketComponent', () => {
  let originalWebSocket;
  let mockWebSocket;

  const mockContext = {
    user: {
      id: '123',
      username: 'testuser',
    },
  };

  beforeEach(() => {
    originalWebSocket = global.WebSocket;

    mockWebSocket = new MockWebSocket();

    global.WebSocket = jest.fn(() => mockWebSocket);

    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({
        messages: [
          {
            user: 'olduser',
            message: 'Previous message',
            time: new Date().toISOString(),
          },
        ],
      }),
      ok: true,
    });
  });

  afterEach(() => {
    global.WebSocket = originalWebSocket;
  });

  const renderComponent = (contextOverrides = {}) => {
    const mergedContext = { ...mockContext, ...contextOverrides };
    return render(
      <UserContext.Provider value={mergedContext}>
        <MemoryRouter>
          <WebSocketComponent />
        </MemoryRouter>
      </UserContext.Provider>
    );
  };

  it('handles websocket connection lifecycle', async () => {
    await act(async () => {
      renderComponent();
    });

    const websocketInstance = global.WebSocket.mock.results[0].value;

    const openSpy = jest.spyOn(websocketInstance, 'onopen');
    const closeSpy = jest.spyOn(websocketInstance, 'onclose');
    const errorSpy = jest.spyOn(websocketInstance, 'onerror');

    websocketInstance.onopen();
    websocketInstance.onclose();
    websocketInstance.onerror(new Error('Test error'));

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
