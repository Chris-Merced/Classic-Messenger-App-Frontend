// tests/contexts/websocketContext.test.js

import React from "react";
import { render, screen, act, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { WebSocketProvider } from "../../src/context/websocketContext";


afterEach(() => {
  cleanup();
  jest.resetAllMocks();
  delete process.env.REACT_APP_WS_URL;
});


describe("WebSocket Crucial Unit Tests", () => {
  test("without WS URL it renders the loading placeholder and never calls WebSocket", () => {
    const WS = jest.fn();
    global.WebSocket = WS;

    render(
      <WebSocketProvider>
        <span>child</span>
      </WebSocketProvider>
    );

    expect(screen.getByText(/loading websocket/i)).toBeInTheDocument();
    expect(WS).not.toHaveBeenCalled();
  });

  test("with WS URL it opens socket, sends registration, shows children & closes on unmount", () => {
    process.env.REACT_APP_WS_URL = "ws://test";

    let instance;
    const WS = jest.fn(() => {
      instance = {
        send: jest.fn(),
        close: jest.fn(),
        onopen: null,
        onmessage: null,
        onclose: null,
        onerror: null,
      };
      return instance;
    });
    global.WebSocket = WS;

    const { unmount } = render(
      <WebSocketProvider>
        <span>socket-ready</span>
      </WebSocketProvider>
    );

    expect(WS).toHaveBeenCalledTimes(2);
    expect(WS).toHaveBeenCalledWith("ws://test");

    act(() => {
      instance.onopen && instance.onopen();
    });

    expect(screen.getByText("socket-ready")).toBeInTheDocument();
    expect(instance.send).toHaveBeenCalledTimes(1);
    expect(JSON.parse(instance.send.mock.calls[0][0])).toEqual({ registration: true });

    unmount();
    expect(instance.close).toHaveBeenCalled();
  });
});
