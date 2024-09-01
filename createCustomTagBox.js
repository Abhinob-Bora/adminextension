function createCustomTagBox() {
  console.log("Creating custom tag box...");
  let existingBox = document.getElementById("CTbox");
  if (existingBox) {
    console.log("Removing existing custom tag box...");
    existingBox.parentNode.removeChild(existingBox);
  }
  // Create the main container
  const CTbox = document.createElement("div");
  CTbox.id = "CTbox";
  CTbox.style.cssText = `
        position: absolute;
        top: 90%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #181A23;
        border-radius: 14px;
        color: white;
        z-index: 9999;
        width: 650px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    `;

  // Function to create a styled button
  function createStyledButton(label) {
    let button = document.createElement("button");
    button.textContent = label;
    button.style.cssText = `
            padding: 10px;
            margin-right: 10px;
            background-color: #333;
            color: white;
            border: none;
            border-radius: 5px;
            
        `;
    return button;
  }

  // Creating a container div for the header and close symbol
  const headerContainer = document.createElement("div");
  headerContainer.style.display = "flex";
  headerContainer.style.justifyContent = "space-between";
  headerContainer.style.alignItems = "center";
  CTbox.appendChild(headerContainer);

  // Create the header
  const header = document.createElement("h3");
  header.textContent = "Custom Tag";
  header.style.cssText = `
        text-align: left;
        color: #ff671f;
        font-weight: bold;
        font-size: 20px;
    `;
  headerContainer.appendChild(header);

  // Create the close button
  const closeSymbol = document.createElement("img");
  closeSymbol.src =
    "https://api.iconify.design/ep/close-bold.svg?color=%23595959"; // Make sure this path is correct
  closeSymbol.style.cssText = `
        width: 20px;
        height: 20px;
        cursor: pointer;
    `;
  closeSymbol.addEventListener("click", () => {
    document.body.removeChild(CTbox);
    document.getElementById("my-custom-box").style.pointerEvents = "auto";
  });
  headerContainer.appendChild(closeSymbol);

  // Creating inputs
  // Creating inputs
  const inputRow = document.createElement("div");
  inputRow.style.display = "flex";
  inputRow.style.justifyContent = "space-around"; // Adjusted to space-around for even spacing

  const startInput = document.createElement("input");
  // startInput.type = "number";
  startInput.placeholder = "Start";
  startInput.style.cssText = `
        width: 150px;
        height: 30px;
        background-color: rgba(0, 0, 0, 0.5);
        border: 1px solid white;
        color: white;
        padding: 10px;
        margin: 5px;
    `;
  inputRow.appendChild(startInput);
  video = document.querySelector("video");
  startInput.addEventListener("click", () => {
    const currentTime = Math.round(video.currentTime);
    startInput.value = secondsToHMS(currentTime.toString());
  });

  const endInput = document.createElement("input");
  // endInput.type = "number";
  endInput.placeholder = "End";
  endInput.style.cssText = `
        
        width: 150px;
        height: 30px;
        background-color: rgba(0, 0, 0, 0.5);
        border: 1px solid white;
        color: white;
        padding: 10px;
        margin: 5px;
    `;
  inputRow.appendChild(endInput);
  endInput.addEventListener("click", () => {
    const currentTime = Math.round(video.currentTime);
    endInput.value = secondsToHMS(currentTime.toString());
  });

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Category";
  categoryInput.style.cssText = `
        
        width: 150px;
        height: 30px;
        background-color: rgba(0, 0, 0, 0.5);
        border: 1px solid white;
        color: white;
        padding: 10px;
        margin: 5px;
    `;
  inputRow.appendChild(categoryInput);

  CTbox.appendChild(inputRow);

  // Creating the tag button at the bottom right
  const tagButton = createStyledButton("Tag");
  tagButton.style.alignSelf = "flex-end";
  tagButton.addEventListener("click", () => {
    const startValue = timeToSeconds(startInput.value);
    const endValue = timeToSeconds(endInput.value);
    const categoryValue = categoryInput.value;
    if (startValue === "" || endValue === "" || categoryValue === "") {
      alert("❗Please enter valid values for start, end, and category.");
    } else {
      const startText = startValue;
      const endText = endValue;
      const sceneTime = endValue - startValue;
      console.log("Scene Time !!!:", sceneTime);
      const custom_range = {
        start_number: startText,
        end_number: endText,
        category_text: categoryValue,
        cs: 100,
        scenetime_number: sceneTime,
      };
      const custom_range_HMS = {
        start_text: secondsToHMS(startText),
        end_text: secondsToHMS(endText),
        category_text: categoryValue,
        cs: 100,
        scenetime_text: secondsToHMS(sceneTime),
        
      };
      UpdatedtimeRanges.push(custom_range_HMS);
      // sendMessageToBg("addCustomTag", custom_range);
      console.log(`email: ${uniqueId}`);
      chrome.runtime.sendMessage({
        action: "addCustomTag",
        data: custom_range,
        url: window.location.href,
        uniqueId: uniqueId,
      });
      // chrome.storage.sync.set({timeRanges: UpdatedtimeRanges});
      console.log(
        "New time range added to UpdatedtimeRanges:",
        UpdatedtimeRanges
      );
      alert("✔️Time range tagged successfully!");
      CTbox.style.display = "none";
      createFloatingBox(
        `Custom tag added: ${categoryValue} (${startText} - ${endText})`
      );

      document.getElementById("my-custom-box").style.pointerEvents = "auto";
      // console.log(UpdatedtimeRanges)
    }
  });

  CTbox.appendChild(tagButton);

  // Prevent keyboard shortcuts from affecting the input fields
  CTbox.addEventListener("keydown", (event) => {
    event.stopPropagation();
  });
  CTbox.addEventListener("keypress", (event) => {
    event.stopPropagation();
  });
  CTbox.addEventListener("keyup", (event) => {
    event.stopPropagation();
  });

  document.body.appendChild(CTbox);
}

// Parameterized function to send message and data
function sendMessageToBg(action, data) {
  chrome.runtime.sendMessage(
    { action: action, data: data },
    function (response) {
      console.log("Response from receiver:", response);
    }
  );
}
// Call the function to create the custom tag box
// createCustomTagBox();
