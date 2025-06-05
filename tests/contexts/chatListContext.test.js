import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserChats, UserChatsContext } from '../../src/context/chatListContext';
import { UserContext } from '../../src/context/userContext';

const fakeChats = [
  { id: 1, name: 'Alpha' },
  { id: 2, name: 'Beta' },
];

beforeAll(() => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => fakeChats })
    .mockResolvedValue({ ok: true, json: async () => ({}) });
});

afterEach(() => {
  jest.clearAllMocks();
});

const makeWrapper = (user) => ({ children }) =>
  (
    <UserContext.Provider value={{ user }}>
      <UserChats>{children}</UserChats>
    </UserContext.Provider>
  );

test('with NO user → fetch is NOT called and chatList is null', () => {
  render(
    <UserChatsContext.Consumer>
      {(ctx) => <span role="status">{ctx.chatList === null ? 'null' : 'set'}</span>}
    </UserChatsContext.Consumer>,
    { wrapper: makeWrapper(null) }
  );

  expect(screen.getByRole('status')).toHaveTextContent('null');
  expect(global.fetch).not.toHaveBeenCalled();
});

test('with a user → fetches chats once and supplies list', async () => {
  render(
    <UserChatsContext.Consumer>
      {(ctx) => (
        <>
          <ul>
            {ctx.chatList?.map((c) => (
              <li key={c.id}>{c.name}</li>
            ))}
          </ul>
          <span role="status">{ctx.chatList ? 'loaded' : 'loading'}</span>
        </>
      )}
    </UserChatsContext.Consumer>,
    { wrapper: makeWrapper({ id: 7 }) }
  );

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  const list = await screen.findByRole('list');
  expect(list).toBeInTheDocument();
  expect(screen.getByText('Alpha')).toBeInTheDocument();
  expect(screen.getByText('Beta')).toBeInTheDocument();
});

test('changeChat updates currentChat', async () => {
  render(
    <UserChatsContext.Consumer>
      {(ctx) => (
        <>
          <span role="status">{ctx.currentChat?.name || 'none'}</span>
          <button onClick={() => ctx.changeChat({ name: 'Beta' })}>pick‑beta</button>
        </>
      )}
    </UserChatsContext.Consumer>,
    { wrapper: makeWrapper({ id: 7 }) }
  );

  fireEvent.click(screen.getByRole('button', { name: /pick‑beta/i }));
  expect(screen.getByRole('status')).toHaveTextContent('Beta');
});
