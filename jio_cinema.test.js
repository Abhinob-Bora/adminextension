// Import the createStyledButton function
const { createStyledButton } = require('./jio_cinema');

// Test case 1: Verify that the button is created with the correct text content
test('Create styled button with text content', () => {
  const button = createStyledButton('Click me');
  expect(button.textContent).toBe('Click me');
});

// Test case 2: Verify that the button has the correct CSS styles applied
test('Create styled button with CSS styles', () => {
  const button = createStyledButton('Click me');
  expect(button.style.display).toBe('inline-flex');
  expect(button.style.padding).toBe('8px 17px 8px 14px');
  expect(button.style.borderRadius).toBe('6px');
  expect(button.style.border).toBe('1px solid #72747E');
  expect(button.style.background).toBe('#FF671F');
  expect(button.style.color).toBe('white');
  expect(button.style.cursor).toBe('pointer');
  expect(button.style.marginRight).toBe('10px');
  expect(button.style.userSelect).toBe('none');
  expect(button.style.textAlign).toBe('center');
  expect(button.style.fontFamily).toBe("'jioTypeVar'");
  expect(button.style.fontSize).toBe('15px');
  expect(button.style.fontStyle).toBe('normal');
  expect(button.style.fontWeight).toBe('700');
  expect(button.style.lineHeight).toBe('20px');
});

// Test case 3: Verify that the button changes color on mouseover and mouseout events
test('Create styled button with mouseover and mouseout events', () => {
  const button = createStyledButton('Click me');
  button.dispatchEvent(new Event('mouseover'));
  expect(button.style.color).toBe('white');
  expect(button.style.background).toBe('#a74719');
  button.dispatchEvent(new Event('mouseout'));
  expect(button.style.color).toBe('white');
  expect(button.style.background).toBe('#FF671F');
});