// Function to create and insert the static icon
function insertStaticIcon(text, page) {
  // Remove the existing icon if it exists
  const existingIcon = document.getElementById("my-static-icon");
  if (existingIcon) {
    console.log(
      "Removing existing icon with text...: ",
      existingIcon.textContent
    );
    existingIcon.parentNode.removeChild(existingIcon);
  }

  // Create a div element for the static icon
  const icon = document.createElement("div");
  icon.id = "my-static-icon"; // Give the icon a unique ID to style it if needed
  icon.textContent = text;
  icon.type = "button";
  if (page === "watch") {
    icon.style.cssText = `
    width: 170px;
    height: 48px;
    flex-shrink: 0;
    border-radius: 38px;
    background: #FF671F;
    color: #FFF;
    text-align: center;
    font-family: 'jioTypeVar';
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 20px; /* 125% */
    margin-top: 25px;
    padding-top: 14px;
    user-select: none;
    cursor: pointer;
    font-family: Poppins, sans-serif;
    position: absolute; /* Keep the icon in a fixed position */
    bottom: 7%; /* Percentage from the bottom of the screen */
    left: 50%; /* Center horizontally */
    transform: translateX(-50%); /* Adjust to truly center the icon */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000; /* Ensure the icon is above other elements */
    `;
    document.body.appendChild(icon);
    console.log("Static Icon Added😉 with text: ", text);

    return icon;
  } else if (page === "content") {
    icon.style.cssText = `
    width: 170px;
    height: 48px;
    flex-shrink: 0;
    border-radius: 38px;
    background: #FF671F;
    color: #FFF;
    text-align: center;
    font-family: 'jioTypeVar';
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 20px; /* 125% */
    margin-top: 25px;
    padding-top: 14px;
    user-select: none;
    cursor: pointer;
    font-family: Poppins, sans-serif;
    `;
    // Insert the static icon into the document body
    // Function to find the element and insert the box
    function findAndInsertBox() {
      const selectors = [
        ".mui-style-8eznwp-buttonsContainer",
        // ".MuiGrid-root.mui-style-rfnosa",
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          // Remove other found elements to avoid duplication
          selectors
            .filter((sel) => sel !== selector)
            .forEach((sel) => {
              const otherElement = document.querySelector(sel);
              if (otherElement) {
                otherElement.parentNode.removeChild(otherElement);
              }
            });

          element.insertAdjacentElement("afterend", icon);
          console.log("Box Element Added😉 with text: ", text);
          return; // Exit the function once the box is added
        }
      }

      // If none of the elements are found, insert the box at the end of the document body
      console.log("Button not found to insert⚠");
      document.body.appendChild(icon);
    }

    // Set an interval to try finding the element and inserting the box
    const findButtonElem = setInterval(() => {
      findAndInsertBox();
      // Clear the interval once the box is added
      if (document.getElementById("my-static-icon")) {
        clearInterval(findButtonElem);
      }
    }, 1000);

    return icon;
  }
}

// Function to create and insert the box element after the specified selectors

function insertBoxAfterButton(text) {
  // Remove the existing box if it exists
  const existingBox = document.getElementById("my-custom-box");
  if (existingBox) {
    console.log(
      "Removing existing box with text...: ",
      existingBox.textContent
    );
    existingBox.parentNode.removeChild(existingBox);
  }

  // Create a div element for the box
  const box = document.createElement("div");
  box.id = "my-custom-box"; // Give the box a unique ID to style it if needed
  box.textContent = text;
  box.type = "button";
  box.style.cssText = `
    width: 170px;
    height: 48px;
    flex-shrink: 0;
    border-radius: 38px;
    background: #FF671F;
    color: #FFF;
    text-align: center;
    font-family: 'jioTypeVar';
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 20px; /* 125% */
    margin-top: 25px;
    padding-top: 14px;
    user-select: none;
    cursor: pointer;
    font-family: Poppins, sans-serif;
  `;

  // Function to find the element and insert the box
  function findAndInsertBox() {
    const selectors = [
      ".mui-style-8eznwp-buttonsContainer",
      // ".MuiGrid-root.mui-style-rfnosa",
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        // Remove other found elements to avoid duplication
        selectors
          .filter((sel) => sel !== selector)
          .forEach((sel) => {
            const otherElement = document.querySelector(sel);
            if (otherElement) {
              otherElement.parentNode.removeChild(otherElement);
            }
          });

        element.insertAdjacentElement("afterend", box);
        console.log("Box Element Added😉 with text: ", text);
        return; // Exit the function once the box is added
      }
    }

    // If none of the elements are found, insert the box at the end of the document body
    console.log("Button not found to insert⚠");
    document.body.appendChild(box);
  }

  // Set an interval to try finding the element and inserting the box
  const findButtonElem = setInterval(() => {
    findAndInsertBox();
    // Clear the interval once the box is added
    if (document.getElementById("my-custom-box")) {
      clearInterval(findButtonElem);
    }
  }, 2000);

  return box;
}

// Example usage
// insertStaticIcon("Choose Content");
