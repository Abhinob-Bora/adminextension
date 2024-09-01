function createStyledButton(textContent) {
  const button = document.createElement("button");
  button.id = "Skip/Watch button";
  button.textContent = textContent;

  button.style.cssText = `
    display: inline-flex;
    padding: 8px 17px 8px 14px;
    align-items: center;
    gap: 10px;
    border-radius: 6px;
    border: 1px solid #72747E;
    background: #da5900;
    color: white;
    cursor: pointer;
    margin-right: 10px;

    user-select: none;
    text-align: center;
    font-family: 'jioTypeVar';
    font-size: 15px;
    font-style: normal;
    font-weight: 700;
    line-height: 20px; /* 125% */
  `;

  button.addEventListener("mouseout", () => {
    button.style.color = "white";
    button.style.background = "#da5900";
  });

  button.addEventListener("mouseover", () => {
    button.style.color = "#white";
    button.style.background = "#a74719";
  });

  return button;
}
