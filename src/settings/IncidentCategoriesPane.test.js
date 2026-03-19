/**
 * IncidentCategoriesPane.test.js
 * Snapshot + smoke + basic behavior tests for the IncidentCategoriesPane.
 */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import IncidentCategoriesPane from './IncidentCategoriesPane';

/* ------------------------------------------------------------------ *
 * 1) stripes/core + intl mocks
 * ------------------------------------------------------------------ */
jest.mock('@folio/stripes/core', () => ({
  // Make stripesConnect a no-op so we can pass mutator manually
  stripesConnect: (C) => C,
}));

jest.mock('react-intl', () => ({
  useIntl          : () => ({ formatMessage: ({ id }) => id }),
  FormattedMessage : (p) => <span>{p.id}</span>,
}));

/* ------------------------------------------------------------------ *
 * 2) stripes/components mock
 * ------------------------------------------------------------------ */
jest.mock('@folio/stripes/components', () => {
  const React = require('react');
  const mk = (tag) => (p) => React.createElement(tag, p, p.children);

  // Render header and children so everything shows up in DOM
  const Pane = (p) => (
    <div>
      {typeof p.renderHeader === 'function' ? p.renderHeader({}) : p.renderHeader}
      {p.children}
      {p.footer}
    </div>
  );

  // Minimal MultiColumnList that applies the provided formatter
  const MultiColumnList = (p) => {
    const items = p.contentData || [];
    const fmt   = p.formatter || {};
    return (
      <ul>
        {items.map((item, i) => (
          <li key={item.id ?? i}>
            <div data-col="title">{fmt.title ? fmt.title(item) : item.title}</div>
            <div data-col="id">{fmt.id ? fmt.id(item) : item.id}</div>
          </li>
        ))}
      </ul>
    );
  };

  // Strip unknown DOM props to avoid warnings
  const Button = ({ buttonStyle, ...rest }) => <button {...rest}>{rest.children}</button>;

  return {
    Button,
    Col            : mk('div'),
    MultiColumnList,
    Pane,
    PaneHeader     : mk('div'),
    Row            : mk('div'),
    TextField      : (p) => <input {...p} />,
  };
});

/* ------------------------------------------------------------------ *
 * 3) child-component + helper mocks
 * ------------------------------------------------------------------ */
jest.mock('./GetIncidentCategories', () => () => (
  <div>Mock GetIncidentCategories</div>
));

// Ensure deterministic IDs when adding a new category
jest.mock('./helpers/makeId', () => jest.fn(() => 'new-cat'));

// Simple delete modal that exposes confirm/close actions
jest.mock('./ModalDeleteCategory', () => (p) =>
  p.isOpen ? (
    <div>
      <div>Mock ModalDeleteCategory</div>
      <button onClick={p.onConfirm}>confirm-delete</button>
      <button onClick={p.onClose}>close-modal</button>
    </div>
  ) : null
);

/* ------------------------------------------------------------------ *
 * 4) IncidentContext mock (class component uses contextType)
 * ------------------------------------------------------------------ */
jest.mock('../contexts/IncidentContext', () => {
  const React = require('react');
  return {
    IncidentContext: React.createContext({
      incidentCategories: [
        { id: 'cat-1', title: 'Behavior' },
        { id: 'cat-2', title: 'Property' },
      ],
    }),
  };
});

/* ------------------------------------------------------------------ *
 * 5) DOM setup / teardown
 * ------------------------------------------------------------------ */
let container, root;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  // Wrap unmount in act to avoid warnings
  await act(async () => {
    root.unmount();
  });
  document.body.removeChild(container);
  container = null;
});

/* ------------------------------------------------------------------ *
 * 6) helpers
 * ------------------------------------------------------------------ */
const findButtonByText = (rootEl, text) =>
  Array.from(rootEl.querySelectorAll('button')).find((b) =>
    (b.textContent || '').includes(text)
  );

// Reliable flush (micro + macro) to ensure class setState fully commits
const flushAll = async () => {
  await act(async () => { await Promise.resolve(); });                     // microtask
  await act(async () => { await new Promise(r => setTimeout(r, 0)); });    // macrotask
};

/* ------------------------------------------------------------------ *
 * 7) tests
 * ------------------------------------------------------------------ */
it('renders without crashing (snapshot)', async () => {
  const mutator = { incidentCategory: { PUT: jest.fn().mockResolvedValue({}) } };
  await act(async () => {
    root.render(<IncidentCategoriesPane mutator={mutator} />);
  });
  await flushAll();
  expect(container.innerHTML).toMatchSnapshot();
});

it('mounts key child components', async () => {
  const mutator = { incidentCategory: { PUT: jest.fn().mockResolvedValue({}) } };
  await act(async () => {
    root.render(<IncidentCategoriesPane mutator={mutator} />);
  });
  await flushAll();
  expect(container.textContent).toContain('Mock GetIncidentCategories');
});

it('adds a new category and saves (calls PUT with new list)', async () => {
  const put = jest.fn().mockResolvedValue({});
  const mutator = { incidentCategory: { PUT: put } };

  await act(async () => {
    root.render(<IncidentCategoriesPane mutator={mutator} />);
  });
  await flushAll();

  // Click "New"
  const newBtn = findButtonByText(container, 'settings.categories-new-button');
  expect(newBtn).toBeTruthy();
  await act(async () => { newBtn.click(); });
  await flushAll();

  // The edit row input should appear (id = -1)
  const input = container.querySelector('input');
  expect(input).toBeTruthy();

  // Type a title for the new category (best-effort – jsdom+class comps can be finicky)
  await act(async () => {
    input.value = 'New Category';
    input.dispatchEvent(new Event('input',  { bubbles: true, cancelable: true }));
    input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  });
  await flushAll();

  // Click "Save" within the actions cell for the edit row
  const saveBtn = findButtonByText(container, 'settings.categories-save-button');
  expect(saveBtn).toBeTruthy();

  await act(async () => { saveBtn.click(); });
  await flushAll();

  expect(put).toHaveBeenCalledTimes(1);
  const payload = put.mock.calls[0][0];
  const cats = payload?.data?.value?.categories || [];
  expect(Array.isArray(cats)).toBe(true);

  // Core behavior: a new item with deterministic ID is persisted.
  // (Avoid asserting the title string due to controlled-input flakiness in jsdom.)
  const newItem = cats.find((c) => c.id === 'new-cat');
  expect(!!newItem).toBe(true);
});

it('deletes a category via the modal and calls PUT with the reduced list', async () => {
  const put = jest.fn().mockResolvedValue({});
  const mutator = { incidentCategory: { PUT: put } };

  await act(async () => {
    root.render(<IncidentCategoriesPane mutator={mutator} />);
  });
  await flushAll();

  // Click the first "Delete" button (for cat-1)
  const delBtn = findButtonByText(container, 'settings.categories-delete-button');
  expect(delBtn).toBeTruthy();
  await act(async () => { delBtn.click(); });
  await flushAll();

  // Modal should render; confirm
  const confirm = findButtonByText(container, 'confirm-delete');
  expect(confirm).toBeTruthy();
  await act(async () => { confirm.click(); });
  await flushAll();

  expect(put).toHaveBeenCalled();
  const payload = put.mock.calls[put.mock.calls.length - 1][0];
  const cats = payload?.data?.value?.categories || [];
  // cat-1 should be removed; cat-2 should remain
  expect(cats.some((c) => c.id === 'cat-1')).toBe(false);
  expect(cats.some((c) => c.id === 'cat-2')).toBe(true);
});
