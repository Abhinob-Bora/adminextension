// let filteredTimeRanges = [];
function showFloatingObject() {
  const floatingBox = document.createElement("div");
  floatingBox.id = "floating-obj";
  floatingBox.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #181A23;
    
    border-radius: 14px;
    color: white;
    z-index: 9999;
    width: 650px;
    
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    align-content: center;
    flex-direction: column;
    align-items: center;
    gap: 20px;
`;

  // Create the image element for the PNG
  const image = document.createElement("img");
  image.src = chrome.runtime.getURL("assets/rectangle.png"); // Replace with the path to your image
  image.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 360px; /* Adjust width as needed */
      height: 45px; /* Adjust height as needed */
      z-index: -1; /* Place the image behind other content */
  `;
  // Append the image to the floating box
  floatingBox.appendChild(image);

  const header = document.createElement("h2");
  header.textContent = "Choose Content to Skip or Watch";
  header.style.cssText = `
    color: #FFF;
    font-family: 'jioTypeVar';
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 20px;
    margin-left: 5px;
    margin-top: 0;
    width: 100%;
    user-select: none;

`;

  const contentBox = document.createElement("div");
  contentBox.id = "content-box";
  contentBox.style.cssText = `
    display: flex;
    align-items: center;
    padding-top: 11px;
    width: 630px;
  `;

  const backgroundLayout = document.createElement("div");
  backgroundLayout.style.cssText = `
        width: 367.5px;
        height: 60px;
        flex-shrink: 0;
        background: #FF671F;
        display: flex;
        align-items: center;
        padding: 0 16px;
    `;

  // Create the white cross symbol for closing the floating box
  const closeSymbol = document.createElement("img");
  closeSymbol.src =
    "https://api.iconify.design/ep/close-bold.svg?color=%23595959"; // Make sure this path is correct

  closeSymbol.alt = "Close";
  closeSymbol.style.cssText = `
      width: 20px;
      height: 20px;
      cursor: pointer;
      margin-left: 6px;
      
    `;
  closeSymbol.addEventListener("click", () => {
    document.body.removeChild(floatingBox);
    // document.getElementById("my-custom-box").style.pointerEvents = "auto";
    document.getElementById("my-static-icon").style.pointerEvents = "auto";
  });

  contentBox.appendChild(header);
  // contentBox.appendChild(backgroundLayout);
  contentBox.appendChild(closeSymbol);

  // Create input blocks for entering minimum and maximum confidence scores
  const minConfidenceInput = document.createElement("input");
  minConfidenceInput.id = "min-confidence-input";
  minConfidenceInput.type = "number";
  minConfidenceInput.step = "any";
  minConfidenceInput.placeholder = "Min Confidence";
  minConfidenceInput.style.cssText = `
    margin-right: 10px;
    width: 120px;
    padding: 5px;
    border-radius: 5px;
    border: 1px solid #ccc;
    color: white;
    background-color: #494949;
  `;

  const maxConfidenceInput = document.createElement("input");
  maxConfidenceInput.id = "max-confidence-input";
  maxConfidenceInput.type = "number";
  maxConfidenceInput.step = "any";
  maxConfidenceInput.placeholder = "Max Confidence";
  maxConfidenceInput.style.cssText = `
    margin-right: 10px;
    width: 120px;
    padding: 5px;
    border-radius: 5px;
    border: 1px solid #ccc;
    color: white;
    background-color: #494949;
  `;

  // Add the input blocks to the content box
  contentBox.insertBefore(maxConfidenceInput, closeSymbol);
  contentBox.insertBefore(minConfidenceInput, maxConfidenceInput);

  minConfidenceInput.style.display = "none"; //unhide when needed !!!!!!!
  maxConfidenceInput.style.display = "none";

  let minConfidenceScore;
  let maxConfidenceScore;

  // Retrieve the previously set confidence scores from localStorage, if available
  const storedMinConfidenceScore = localStorage.getItem("minConfidenceScore");
  if (storedMinConfidenceScore !== null) {
    minConfidenceScore = parseFloat(storedMinConfidenceScore);
  } else {
    minConfidenceScore = 0;
  }
  minConfidenceInput.value = minConfidenceScore;

  const storedMaxConfidenceScore = localStorage.getItem("maxConfidenceScore");
  if (storedMaxConfidenceScore !== null) {
    maxConfidenceScore = parseFloat(storedMaxConfidenceScore);
  } else {
    maxConfidenceScore = 100; // Set default maximum value if not previously set
  }
  maxConfidenceInput.value = maxConfidenceScore;

  // Function to filter time ranges based on the specified range
  function filterTimeRanges(minConfidence, maxConfidence) {
    return UpdatedtimeRanges.filter(
      (item) => item.cs >= minConfidence && item.cs <= maxConfidence
    );
  }
  // Function to render the filtered time ranges
  function renderFilteredTimeRanges(filteredData) {
    // Get the existing table rows
    const rows = optionContainer.querySelectorAll("tr");

    // Iterate over the rows starting from index 1 (skipping the header row)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const category = row.cells[0].textContent;

      // Check if the category is present in the filtered data
      const categoryPresent = filteredData.some(
        (item) => item.category_text === category
      );

      // If the category is present, update the row with new scene count and total duration, otherwise hide it
      if (categoryPresent) {
        const scenes = filteredData.filter(
          (item) => item.category_text === category
        );
        const sceneCount = scenes.length;

        // Update scene count cell
        const sceneCountCell = row.cells[1];
        sceneCountCell.textContent = sceneCount;

        // Update total duration cell
        const totalDurationInSeconds = scenes.reduce(
          (acc, curr) => acc + timeToSeconds(curr.scenetime_text),
          0
        );
        const totalDurationReadable = secondsToReadableTime(
          totalDurationInSeconds
        );
        const totalDurationCell = row.cells[2];
        totalDurationCell.textContent = totalDurationReadable;

        row.style.display = ""; // Show the row
      } else {
        // Check if the row was previously hidden due to low confidence score
        const wasHidden = row.style.display === "none";

        // If the row was previously hidden, but it matches the filtered criteria now, show it
        if (wasHidden) {
          row.style.display = ""; // Show the row
        } else {
          row.style.display = "none"; // Hide the row
        }
      }
    }
  }

  // Event listener for changes in the confidence inputs
  function handleConfidenceInput() {
    // Get the entered min and max confidence scores
    minConfidenceScore = parseFloat(minConfidenceInput.value);
    maxConfidenceScore = parseFloat(maxConfidenceInput.value);

    // Check if the input values are empty or non-numeric
    if (isNaN(minConfidenceScore)) {
      minConfidenceScore = 0;
    }
    if (isNaN(maxConfidenceScore)) {
      maxConfidenceScore = 100; // Set default maximum value if empty or non-numeric
    }

    // Update the input values with the parsed confidence scores
    // minConfidenceInput.value = minConfidenceScore;
    // maxConfidenceInput.value = maxConfidenceScore;

    if (
      minConfidenceScore < 0 ||
      minConfidenceScore > 100 ||
      maxConfidenceScore < 0 ||
      maxConfidenceScore > 100 ||
      minConfidenceScore > maxConfidenceScore
    ) {
      createFloatingBox("❗Please Enter a valid Confidence Score");
      return;
    }

    // Store the current confidence scores in localStorage
    localStorage.setItem("minConfidenceScore", minConfidenceScore);
    localStorage.setItem("maxConfidenceScore", maxConfidenceScore);

    // Filter the time ranges based on the specified range
    filteredTimeRanges = filterTimeRanges(
      minConfidenceScore,
      maxConfidenceScore
    );

    console.log(
      "minConfidenceScore: ",
      minConfidenceScore,
      ", maxConfidenceScore: ",
      maxConfidenceScore
    );
    console.log("filteredTimeRanges", filteredTimeRanges);
    // Render the filtered time ranges
    renderFilteredTimeRanges(filteredTimeRanges);
  }

  // Add event listener to both input blocks
  minConfidenceInput.addEventListener("keyup", handleConfidenceInput);
  maxConfidenceInput.addEventListener("keyup", handleConfidenceInput);

  // function renderFilteredTimeRanges(filteredData) {
  //   // Remove all existing rows from the option container
  //   optionContainer.innerHTML = '';
  //   // Iterate over each category in the filtered data
  //   options.forEach((optionText) => {
  //       // Filter the data for the current category
  //       const scenes = filteredData.filter(item => item.category_text === optionText);
  //       // If there are scenes for the current category, create a row and add it to the option container
  //       if (scenes.length > 0) {
  //           const optionRow = document.createElement("tr");
  //           optionRow.dataset.category = optionText; // Set data attribute for category
  //           // Create and populate cells for the row
  //           const categoryTd = document.createElement("td");
  //           categoryTd.textContent = optionText;
  //           optionRow.appendChild(categoryTd);
  //           const sceneCountTd = document.createElement("td");
  //           sceneCountTd.textContent = scenes.length;
  //           sceneCountTd.className = "scene-count"; // Add class for scene count
  //           optionRow.appendChild(sceneCountTd);
  //           const totalDurationInSeconds = scenes.reduce((acc, curr) => acc + timeToSeconds(curr.scenetime_text), 0);
  //           const totalDurationReadable = secondsToReadableTime(totalDurationInSeconds);
  //           const totalDurationTd = document.createElement("td");
  //           totalDurationTd.textContent = totalDurationReadable;
  //           totalDurationTd.className = "total-duration"; // Add class for total duration
  //           optionRow.appendChild(totalDurationTd);
  //           optionContainer.appendChild(optionRow);
  //       }
  //   });
  // }

  floatingBox.appendChild(contentBox);

  let options = [];
  filteredTimeRanges = filterTimeRanges(minConfidenceScore, maxConfidenceScore);

  console.log("UpdatedtimeRanges", UpdatedtimeRanges);
  console.log("filteredTimeRanges", filteredTimeRanges);

  filteredTimeRanges.forEach((item) => {
    if (!options.includes(item.category_text)) {
      options.push(item.category_text);
    }
  });

  console.log("options: ", options);

  const optionContainer = document.createElement("table");
  optionContainer.id = "option-Container";
  optionContainer.style.cssText = `
  width: 458px;
  padding-top: 20px;
  padding-bottom: 15px;
  // border-collapse: collapse;  
  user-select:none;
`;

  // Headers
  const headers = ["Category", "No. of scenes", "Total Duration"];
  const headerRow = document.createElement("tr");
  headers.forEach((headerText) => {
    const header = document.createElement("th");
    header.textContent = headerText;

    // Apply the common styles
    header.style.cssText = `
        color: #B3B5BE;
        font-family: 'jioTypeVar';
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
        line-height: 20px; 
        margin: 5px; // No use
    `;

    // Conditionally align the header text
    if (headerText === "Category") {
      header.style.textAlign = "left";
      header.style.paddingLeft = "5px";
    } else {
      header.style.textAlign = "left";
      header.style.paddingLeft = "25px";
    }

    headerRow.appendChild(header);
  });

  optionContainer.appendChild(headerRow);

  options.forEach((optionText) => {
    const optionRow = document.createElement("tr");

    const categoryTd = document.createElement("td");
    const isCustomTag = UpdatedtimeRanges.some(
      (item) => item.category_text === optionText && item.type === "customtags"
    );

    categoryTd.style.cssText = `
      height: 24px;
      padding: 5px 20px 10px 20px;
      background: ${
        isCustomTag ? "rgb(0 210 255)" : "rgb(85, 87, 97)"
      }; /* change color if customtags */
    cursor: pointer;
    user-select: none;
    color: #FFF;
    font-family: 'jioTypeVar';
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 14px; /* 100% */
    border-radius: 3px;
    gap: 8px;
    display: flex;
    width: fit-content;
    margin: 5px
;
      
  `;
    categoryTd.textContent = optionText;
    optionRow.appendChild(categoryTd);

    const sceneCount = filteredTimeRanges.filter(
      (item) => item.category_text === optionText
    ).length;
    const sceneCountTd = document.createElement("td");
    sceneCountTd.textContent = sceneCount;
    sceneCountTd.style.textAlign = "center";
    sceneCountTd.style.cssText = `
    color: #72747E;
    text-align: center;
    font-family: 'jioTypeVar';
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px; /* 166.667% */
  `;
    optionRow.appendChild(sceneCountTd);

    const totalDurationInSeconds = filteredTimeRanges
      .filter((item) => item.category_text === optionText)
      .reduce((acc, curr) => acc + timeToSeconds(curr.scenetime_text), 0);

    const totalDurationReadable = secondsToReadableTime(totalDurationInSeconds);

    const totalDurationTd = document.createElement("td");
    totalDurationTd.textContent = totalDurationReadable;
    totalDurationTd.style.textAlign = "left";
    totalDurationTd.style.cssText = `
    color: #72747E;
    text-align: left;
    font-family: 'jioTypeVar';
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px; /* 166.667% */
    padding-left: 25px;
  `;
    optionRow.appendChild(totalDurationTd);

    let isSelected = false;

    const crossSymbol = document.createElement("img");
    crossSymbol.src =
      "https://api.iconify.design/carbon/close-outline.svg?color=white";
    crossSymbol.style.width = "12px";
    crossSymbol.style.height = "12px";
    crossSymbol.style.display = "none"; // Initially hide the cross symbol
    categoryTd.appendChild(crossSymbol); // Attach the cross symbol to the category column

    // Check if the option was previously selected
    if (selectedCategories.includes(optionText)) {
      categoryTd.style.background = "rgba(255, 103, 31, 0.26)";
      categoryTd.style.border = "1px solid #FF671F";
      isSelected = true; // Set the isSelected flag
      crossSymbol.style.display = "block"; // Show the cross symbol

      sceneCountTd.style.color = "#FFF";
      totalDurationTd.style.color = "#FFF";
    }
    //if the option is being clicked then this is logic
    categoryTd.addEventListener("click", () => {
      const existingTimeline = document.getElementById("timeline-Container");
      if (existingTimeline) {
        console.log("Existing timeline found!"); // Debugging line
        existingTimeline.remove();
      } else {
        console.log("No existing timeline found."); // Debugging line
      }

      if (isSelected) {
        const isCustomTag = UpdatedtimeRanges.some(
          (item) =>
            item.category_text === optionText && item.type === "customtags"
        );

        // Change color if customtags
        categoryTd.style.background = isCustomTag
          ? "rgb(0 210 255)"
          : "rgb(85, 87, 97)";
        
        categoryTd.style.border = "none";
        const index = selectedCategories.indexOf(optionText);
        crossSymbol.style.display = "none"; // Hide the cross symbol

        sceneCountTd.style.color = "#72747E";
        totalDurationTd.style.color = "#72747E";

        if (index > -1) {
          selectedCategories.splice(index, 1);
          console.log("selectedCategories splice:", selectedCategories);
        }
      } else {
        categoryTd.style.background = "rgba(255, 103, 31, 0.26)";
        categoryTd.style.border = "1px solid #FF671F";

        selectedCategories.push(optionText);
        crossSymbol.style.display = "block"; // Show the cross symbol
        console.log("selectedCategories:", selectedCategories);

        sceneCountTd.style.color = "#FFF";
        totalDurationTd.style.color = "#FFF";
      }
      isSelected = !isSelected;
    });

    optionContainer.appendChild(optionRow);
  });

  floatingBox.appendChild(optionContainer);

  // console.log("filteredTimeRanges 1", filteredTimeRanges);
  // handleConfidenceInput();
  // console.log("filteredTimeRanges 2", filteredTimeRanges);
  // renderFilteredTimeRanges(filteredTimeRanges);
  // console.log("filteredTimeRanges 3", filteredTimeRanges);

  const skipButton = createStyledButton(" ▶| Skip Tags");
  skipButton.id = "skip-button";
  skipButton.addEventListener("click", () => {
    if (selectedCategories.length > 0) {
      console.log("Skips tags button clicked! 🙈");
      timeRanges = []; // Clear any previous data
      selectedCategories.forEach((category) => {
        timeRanges.push(
          ...filteredTimeRanges.filter(
            (item) => item.category_text === category
          )
        );
      });
      timeRanges.sort(
        (a, b) => timeToSeconds(a.start_text) - timeToSeconds(b.start_text)
      );
      console.log("timeRanges for Skip Tags: ", timeRanges); // Check the populated timeRanges
      timeRanges = convertTimeRangesToSeconds(timeRanges);
      if (
        (window.location.href.includes("https://www.jiocinema.com/movies/") ||
          window.location.href.includes(
            "https://www.jiocinema.com/tv-shows/"
          )) &&
        !window.location.href.includes("/watch") &&
        !window.location.href.includes(
          "https://www.jiocinema.com/tv-shows/house-of-the-dragon/1/the-heirs-of-the-dragon/3741224"
        ) &&
        isPageLoaded()
      ) {
        document.querySelector(watchBtnClass).click();
      }
      // Hide the floating box
      floatingBox.style.display = "none";
      intervalId = setInterval(checkTimeRange, 1000); // Start time range checks
      createFloatingBox(
        `✔️Your selected categories will be Skipped! (${selectedCategories})`
      );
      // document.getElementById("my-custom-box").style.pointerEvents = "auto";
      document.getElementById("my-static-icon").style.pointerEvents = "auto";

      chrome.runtime.sendMessage(
        {
          action: "timestamps",
          data: timeRanges,
          opt: "Skip",
          url: window.location.href,
          categories: selectedCategories,
        },
        (response) => {
          console.log("Response from background script:", response);
        }
      ); // Send the time ranges to the background script
    } else {
      createFloatingBox("❗Please Select a Category");
    }
  });

  const watchButton = createStyledButton("▶ Watch tags");
  watchButton.id = "watch-button";
  watchButton.addEventListener("click", () => {
    if (selectedCategories.length > 0) {
      console.log("Watch tags button clicked! 👀");
      timeRanges = []; // Clear any previous data
      selectedCategories.forEach((category) => {
        timeRanges.push(
          ...filteredTimeRanges.filter(
            (item) => item.category_text === category
          )
        );
      });
      timeRanges.sort(
        (a, b) => timeToSeconds(a.start_text) - timeToSeconds(b.start_text)
      );
      console.log("timeRanges to Watch Tags: ", timeRanges); // Check the populated timeRanges
      timeRanges = convertTimeRangesToSeconds(timeRanges);
      if (
        (window.location.href.includes("https://www.jiocinema.com/movies/") ||
          window.location.href.includes(
            "https://www.jiocinema.com/tv-shows/"
          )) &&
        !window.location.href.includes("/watch") &&
        !window.location.href.includes(
          "https://www.jiocinema.com/tv-shows/house-of-the-dragon/1/the-heirs-of-the-dragon/3741224"
        ) &&
        isPageLoaded()
      ) {
        document.querySelector(watchBtnClass).click();
      }
      // Hide the floating box
      floatingBox.style.display = "none";
      intervalId = setInterval(watchTimeRange, 1000); // Start time range checks
      createFloatingBox(
        `✔️You are watching only selected categories! (${selectedCategories})`
      );
      // document.getElementById("my-custom-box").style.pointerEvents = "auto";
      document.getElementById("my-static-icon").style.pointerEvents = "auto";

      chrome.runtime.sendMessage(
        {
          action: "timestamps",
          data: timeRanges,
          opt: "Watch",
          url: window.location.href,
          categories: selectedCategories,
        },
        (response) => {
          console.log("Response from background script:", response);
        }
      ); // Send the time ranges to the background script
    } else {
      createFloatingBox("❗Please Select a Category");
    }
  });

  const customTagButton = createStyledButton("Custom Tags");
  customTagButton.id = "custom-tag-button";
  customTagButton.addEventListener("click", () => {
    console.log("Custom tags button clicked! 🎉");
    // Hide the floating box

    floatingBox.style.display = "none";
    // document.getElementById("my-custom-box").style.pointerEvents = "auto";
    document.getElementById("my-static-icon").style.pointerEvents = "auto";

    createCustomTagBox();
  });

  // Adjust the position of the buttons (optional)
  const buttonContainer = document.createElement("div");
  buttonContainer.id = "button-Container";
  buttonContainer.style.cssText = `
    display: flex;
    padding-bottom: 15px;
    justify-content: flex-start;
    
  `;

  buttonContainer.appendChild(skipButton);
  buttonContainer.appendChild(watchButton);
  if (window.location.href.includes("watch"))
    buttonContainer.appendChild(customTagButton);

  // start of timeline code
  // Create the "Check Timeline" button
  const checkTimelineButton = document.createElement("div");
  checkTimelineButton.id = "check-timeline-btn";
  checkTimelineButton.textContent = " > Check Timeline";
  checkTimelineButton.style.cssText = `
  color: white;
  font-size: 14px;
  font-family: 'jioTypeVar';
  font-weight: 500;
  line-height: 20px;
  cursor: pointer;
  padding: 8px 17px 8px 14px; 
  align-items: center;
  margin-left: 25px;
  word-wrap: break-word
`;

  checkTimelineButton.addEventListener("click", () => {
    // If a timeline already exists, remove it
    // const existingTimeline = document.getElementById("check-timeline");
    const existingTimeline = document.getElementById("timeline-Container");
    if (existingTimeline) {
      console.log("Existing timeline found!"); // Debugging line
      existingTimeline.remove();
    } else {
      console.log("No existing timeline found."); // Debugging line

      // Create a new table for the timeline
      const timelineTable = document.createElement("table");
      timelineTable.id = "check-timeline";
      timelineTable.style.cssText = `
            width: 95%;  // Ensure the table occupies the full width of the container

            max-height: 200px; // Limit height and make it scrollable
            border-collapse: collapse; // Fix for potential spacing issues

            //width: 458px;
            //padding-top: 20px;
            padding-bottom: 15px;
            //border-collapse: collapse; 
            // margin-top: 20px;
            user-select:none;
        `;

      // Headers
      const timelineHeaders = [
        "Category",
        "StartTime/EndTime",
        "Duration",
        "Conf. Score",
      ];
      const timelineHeaderRow = document.createElement("tr");
      timelineHeaders.forEach((headerText) => {
        const header = document.createElement("th");
        header.textContent = headerText;
        // Apply the common styles
        header.style.cssText = `
                color: #B3B5BE;
                font-family: 'jioTypeVar';
                font-size: 15px;
                font-style: normal;
                font-weight: 600;
                line-height: 20px; 
                margin: 5px; // No use
            `;

        if (headerText === "Category") {
          header.style.width = "35%"; // Adjust as needed
          header.style.textAlign = "left";
        } else if (headerText === "StartTime/EndTime") {
          header.style.width = "35%"; // Adjust as needed
          header.style.textAlign = "left";
        } else {
          header.style.width = "30%"; // Adjust as needed

          header.style.textAlign = "center"; // Align text to the right
          header.style.paddingRight = "5px"; // Add some right padding
        }

        timelineHeaderRow.appendChild(header);
      });
      timelineTable.appendChild(timelineHeaderRow);

      // Determine which time ranges to display
      const displayTimeRanges =
        selectedCategories.length > 0
          ? filteredTimeRanges.filter((item) =>
              selectedCategories.includes(item.category_text)
            )
          : filteredTimeRanges;

      // Sort by start time
      displayTimeRanges.sort(
        (a, b) => timeToSeconds(a.start_text) - timeToSeconds(b.start_text)
      );

      // Add rows to the timeline table
      displayTimeRanges.forEach((item) => {
        const row = document.createElement("tr");
        const categoryTd = document.createElement("td");
        categoryTd.textContent = item.category_text;
        categoryTd.style.cssText = `
              color: white;
              font-size: 14px;
              font-family: 'jioTypeVar';
              font-weight: 400;
              line-height: 20px;
              word-wrap: break-word
              width: 35%;
              padding-top: 10px; 
            `;
        row.appendChild(categoryTd);

        // // Helper function to format the time
        // function formatTime(time) {
        //   const [hours, minutes, seconds] = time.split(":");
        //   return hours === "00" ? `${minutes}:${seconds}` : time;
        // }
        // const formattedStart = formatTime(item.start_text);
        // const formattedEnd = formatTime(item.end_text);
        const timeTd = document.createElement("td");
        timeTd.textContent = `${item.start_text} - ${item.end_text}`;
        timeTd.style.cssText = `
              color: white;
              font-size: 14px;
              font-family: 'jioTypeVar';
              font-weight: 400;
              line-height: 20px;
              word-wrap: break-word;
              text-align: left
              width: 35%;
              padding-top: 10px;
            `;
        row.appendChild(timeTd);

        // Convert item.scenetime_text to seconds
        const durationInSeconds = timeToSeconds(item.scenetime_text);

        // Convert seconds to the desired format
        const formattedDuration = secondsToReadableTime(durationInSeconds);

        const durationTd = document.createElement("td");
        durationTd.textContent = formattedDuration; // Use the transformed value
        durationTd.style.cssText = `
              color: white;
              font-size: 14px;
              font-family: 'jioTypeVar';
              font-weight: 400;
              line-height: 20px;
              word-wrap: break-word;
              padding-top: 10px;
              text-align: center;
              width: 30%;          
            `;
        row.appendChild(durationTd);
        // Optional: Add a border between rows
        // row.style.borderBottom = "1px solid #d2d2d4";  // You can adjust the color and style as needed
        const confidenceTd = document.createElement("td");
        confidenceTd.textContent = item.cs.toFixed(3);
        confidenceTd.style.cssText = `
              color: white;
              font-size: 14px;
              font-family: 'jioTypeVar';
              font-weight: 400; 
              line-height: 20px;
              word-wrap: break-word;
              padding-top: 10px;
              text-align: center;
              width: 30%;
            `;
        row.appendChild(confidenceTd);

        const watchButton = document.createElement("button");
        watchButton.textContent = "▶";
        watchButton.style.cssText = `
              font-size: 14px;
              font-family: 'jioTypeVar';
              font-weight: 500;
              line-height: 20px;
              word-wrap: break-word;
              padding-top: 10px;
              text-align: center;
              background-color: transparent;
              margin-left: 16px;

            `;
        watchButton.addEventListener("click", () => {
          console.log("timeline played! 👀");
          timeRanges = []; // Clear any previous data
          timeRanges.push(item);
          console.log("timeRanges to Watch Tags: ", timeRanges); // Check the populated timeRanges
          timeRanges = convertTimeRangesToSeconds(timeRanges);
          document.querySelector(watchBtnClass).click();
          // Hide the floating box
          floatingBox.style.display = "none";
          intervalId = setInterval(watchTimeRange, 1000); // Start time range checks
        });
        const div_ = document.createElement("div");
        div_.style.cssText = `
              display: flex;
              justify-content: center;
              align-items: center;
            `;

        const errorButton = document.createElement("button");
        errorButton.textContent = "❌";
        errorButton.style.cssText = `
              font-size: 14px;
              font-family: 'jioTypeVar';
              font-weight: 500;
              line-height: 20px;
              word-wrap: break-word;
              padding-top: 10px;
              text-align: center;
              background-color: transparent;
              margin-left: 16px
            `;
        // // Create the flag indicator element
        // const flagIndicator = document.createElement("div");
        // flagIndicator.style.cssText = `
        //   display: none;
        //   position: absolute;
        //   background-color: #ffffff;
        //   border: 1px solid #000000;
        //   padding: 5px;
        // `;
        // // Append the flag indicator to the document body
        // document.body.appendChild(flagIndicator);
        // // Event listener for mouse enter
        // errorButton.addEventListener("mouseenter", () => {
        //     // Show the flag indicator at the position of the button
        //     flagIndicator.style.display = "block";
        //     flagIndicator.style.left = errorButton.offsetLeft + errorButton.offsetWidth + "px";
        //     flagIndicator.style.top = errorButton.offsetTop + "px";
        // });
        // // Event listener for mouse leave
        // errorButton.addEventListener("mouseleave", () => {
        //     // Hide the flag indicator when the mouse leaves the button
        //     flagIndicator.style.display = "none";
        // });
        errorButton.addEventListener("click", () => {
          const confirmation = confirm(
            `Flag an error?\n\nTitle: ${pageTitle}\nCategory: ${
              item.category_text
            }\nTime: ${item.start_text} - ${
              item.end_text
            }\nDuration: ${formattedDuration}\nConf. Score: ${item.cs.toFixed(
              3
            )}\nid: ${item.id}`
          );
          if (confirmation) {
            // console.log("Error flagged! 🚩")
            chrome.runtime.sendMessage(
              {
                action: "report_error",
                title: pageTitle,
                category: item.category_text,
                start: item.start_text,
                end: item.end_text,
                sceneTime: formattedDuration,
                currentURL: currentURL,
                category: item.category_text,
                _id: item.id,
              },
              (response) => {
                // console.log("Response from background script:", response);
                createFloatingBox("Error flagged! 🚩");
                // if (response && response.success) {
                //   createFloatingBox("Error flagged! 🚩");
                // }else if(response.success === false){
                //   createFloatingBox("Error flagging failed! 🚩");
                // }
              }
            );
          }
        });

        div_.appendChild(watchButton);
        div_.appendChild(errorButton);

        row.appendChild(div_);

        timelineTable.appendChild(row);
      });

      const timelineContainer = document.createElement("div");
      timelineContainer.id = "timeline-Container";
      timelineContainer.className = "scroll-2";
      timelineContainer.style.cssText = `
            max-height: 200px; 
            overflow-y: scroll; 
            width: 458px;
            margin-bottom: 20px;
        `;

      // Inject custom scrollbar styles
      const style = document.createElement("style");
      style.textContent = `
            .scroll-2::-webkit-scrollbar {
                width: 8px;
            }
            .scroll-2::-webkit-scrollbar-thumb:hover {
              width: 12px;  // Expand the thumb of the scrollbar on hover
            }
          
            .scroll-2::-webkit-scrollbar-track {
                background-color: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
            }
            .scroll-2::-webkit-scrollbar-thumb {
                background-color: #FF671F;
                border-radius: 8px;
                transition: width 0.3s;  
            }
            .scroll-2 {
                scrollbar-width: thin;
                scrollbar-color: rgb(255, 107, 0) rgba(255, 255, 255, 0.1);
            }
        `;

      document.head.appendChild(style); // Add the style to the document head

      timelineContainer.appendChild(timelineTable);
      floatingBox.appendChild(timelineContainer);
      // Append the timeline table to the floating box
      // floatingBox.appendChild(timelineTable);
      // Fix for alignment issue. Recalculate the position after adding new content
      floatingBox.style.top = "50%";
      floatingBox.style.left = "50%";
      floatingBox.style.transform = "translate(-50%, -50%)";
    }
  });

  buttonContainer.appendChild(checkTimelineButton);

  // End of timeline code
  floatingBox.appendChild(buttonContainer);

  document.body.style.fontFamily = "'Poppins', sans-serif";

  document.body.appendChild(floatingBox);
  // document.getElementById("my-custom-box").click = none;
}

//helper funtion for confidence score input

// Function to create input blocks
function createInputBlock(id, placeholder) {
  const input = document.createElement("input");
  input.type = "number";
  input.step = "any";
  input.placeholder = placeholder;
  input.id = id;
  input.style.cssText = `
    margin-right: 10px;
    width: 120px;
    padding: 5px;
    border-radius: 5px;
    border: 1px solid #ccc;
    color: white;
    background-color: #494949;
  `;
  return input;
}
