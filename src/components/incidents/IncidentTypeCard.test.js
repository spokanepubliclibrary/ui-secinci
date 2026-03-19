/**
 * IncidentTypeCard.test.js
 * Snapshot + smoke + basic interaction tests for IncidentTypeCard.
 */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import IncidentTypeCard from './IncidentTypeCard';

/* ------------------------------------------------------------------ *
 * stripes/components mock
 * ------------------------------------------------------------------ */
jest.mock('@folio/stripes/components', () => {
  const React = require('react');

  // Render Card's headerStart, headerEnd, and children so they appear in the DOM
  const Card = (p) => (
    <div data-test-card>
      <div data-slot="headerStart">{p.headerStart}</div>
      <div data-slot="headerEnd">{p.headerEnd}</div>
      <div data-slot="body">{p.children}</div>
    </div>
  );

  // Strip unknown DOM props like buttonStyle to avoid warnings
  const Button = ({ buttonStyle, ...rest }) => <button {...rest}>{rest.children}</button>;

  // Show the icon name in the DOM for assertions
  const Icon = ({ icon, ...rest }) => <span {...rest}>{icon}</span>;

  return { Card, Button, Icon };
});

/* ------------------------------------------------------------------ *
 * DOM setup / teardown
 * ------------------------------------------------------------------ */
let container, root;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  document.body.removeChild(container);
  container = null;
});

/* ------------------------------------------------------------------ *
 * helpers
 * ------------------------------------------------------------------ */
const findButton = (rootEl) => rootEl.querySelector('button');

/* ------------------------------------------------------------------ *
 * fixtures
 * ------------------------------------------------------------------ */
const baseProps = {
  handleTypeToggle: jest.fn(),
  id: 't1',
  category_id: 'cat-1',
  title: 'Type 1 - Disorderly',
  description: 'A description of the incident type.',
};

/* ------------------------------------------------------------------ *
 * tests
 * ------------------------------------------------------------------ */
it('renders without crashing (snapshot)', async () => {
  await act(async () => {
    root.render(<IncidentTypeCard {...baseProps} isSelected={false} />);
  });
  expect(container.innerHTML).toMatchSnapshot();
});

it('shows "Add" when not selected', async () => {
  await act(async () => {
    root.render(<IncidentTypeCard {...baseProps} isSelected={false} />);
  });

  // title in headerStart
  expect(container.textContent).toContain('Type 1 - Disorderly');
  // description in body
  expect(container.textContent).toContain('A description of the incident type.');

  // Button should say "Add"
  const btn = findButton(container);
  expect(btn).toBeTruthy();
  expect(btn.textContent).toContain('Add');
  // Should not show the check icon name
  expect(container.textContent).not.toContain('check-circle');
});

it('shows a check icon when selected', async () => {
  await act(async () => {
    root.render(<IncidentTypeCard {...baseProps} isSelected={true} />);
  });

  const btn = findButton(container);
  expect(btn).toBeTruthy();
  // Our Icon mock renders its `icon` prop as text
  expect(btn.textContent).toContain('check-circle');
  // Should not show "Add"
  expect(btn.textContent).not.toContain('Add');
});

it('calls handleTypeToggle with the correct type data when clicked', async () => {
  const handleTypeToggle = jest.fn();
  await act(async () => {
    root.render(
      <IncidentTypeCard
        {...baseProps}
        handleTypeToggle={handleTypeToggle}
        isSelected={false}
      />
    );
  });

  const btn = findButton(container);
  expect(btn).toBeTruthy();

  await act(async () => {
    btn.click();
  });

  expect(handleTypeToggle).toHaveBeenCalledTimes(1);
  expect(handleTypeToggle).toHaveBeenCalledWith({
    id: 't1',
    title: 'Type 1 - Disorderly',
    category_id: 'cat-1',
    description: 'A description of the incident type.',
  });
});
