// import { log } from "console";
// const { log } = require("console");

// const { url } = require("inspector");

console.log("Extension started!");

const checkifpageloaded = setInterval(() => {
  let pageTitleStatus = false;
  // console.log(`pageTitleStatus = ${pageTitleStatus}`)
  const pageTitle = document.querySelector(
    "yt-formatted-string.style-scope.ytd-watch-metadata"
  );
  if (pageTitle) {
    if (pageTitleStatus == false) {
      pageTitleStatus = true;
      console.log("Page title loaded!");
      clearInterval(checkifpageloaded);
      chrome.runtime.sendMessage({ action: "check cookie" });
      // console.log("OKKK..........")
    }
  } else {
    console.log("Page title not loaded!");
  }
}, 1000);
// youtube-content.js

let intervalId_checkTimeRange; // Declare intervalId at the top level to keep it public
let intervalId_watchTimeRange;
let intervalIdCheckPageload; // Declare intervalId at the top level to keep it public
let timeRanges = []; // Define an empty array initially
let UpdatedtimeRanges = []; // Define an empty array initially
let selectedCategories = [];
let default_profile = [];
let existingProfile = [];
// Declare a global variable for uniqueId
var uniqueId = " initialising as a null";
// console.log("This is loggin for the start",uniqueId);

let popupWindow; // Declare popupWindow in a scope accessible to both functions

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  //MOvie requested floating box confirmation
  // console.log("Message received in content script:", request);
  if (request.action === "request_taken") {
    const pageTitle = request.title;
    //createFloatingBox(`Content "${pageTitle}" Requested! The tags will be available in 2 days.`);
    createFloatingBox(
      `Content Requested! You will be notified through mail once available.`
    );
    console.log("Movie Requested🟩");
    sendResponse({ status: "Message received" }); // optional
  }
});

// Function to initialize the extension
function initializeExtension() {
  console.log("Initializing extension...");

  // Check for elements and insert the box (or any other logic needed to set up the extension)
  checkForElementsIfPageLoaded();

  // // Set an interval to check for the element every second (or any other desired frequency)
  // intervalIdCheckPageload = setInterval(checkForElementsIfPageLoaded, 1000);

  // Function to check for the video element and start time range checks
  function startVideoChecks() {
    if (isPageLoaded) {
      var video = document.querySelector("video");
      if ((window.location.href.includes("/watch") && video) == false) {
        console.log("Could not find Video and clearing time range checks...");
        clearInterval(videoCheckInterval); // Stop checking for the video
        // clearInterval(intervalId); // Stop checking for the video
      }
    }
  }

  // Set an interval to check for the video element every 500 milliseconds

  // const videoCheckInterval = setInterval(startVideoChecks, 1000);
}

let currentVideoId = getVideoIdFromUrl(window.location.href);

function getVideoIdFromUrl(url) {
  const urlParams = new URLSearchParams(new URL(url).search);
  return urlParams.get("v");
}

function checkSlugChange() {
  console.log("Checking for Video ID change...");
  const newVideoId = getVideoIdFromUrl(window.location.href);

  if (currentVideoId !== newVideoId) {
    console.log(
      `Video ID changed from ${currentVideoId} to ${newVideoId}, reinitializing extension...`
    );
    currentVideoId = newVideoId;

    // Hide the floating box on video change
    const floatingBox = document.getElementById("floating-box");
    if (floatingBox) {
      floatingBox.style.display = "none";
      console.log("Floating Box Removed");
    }

    const floatingObj = document.getElementById("floating-obj");
    if (floatingObj) {
      console.log("Removing existing floatingObj...");
      floatingObj.parentNode.removeChild(floatingObj);
      console.log("removed :", floatingObj);
    }

    const myCustomBox = document.getElementById("my-custom-box");
    if (myCustomBox) {
      console.log("Removing existing myCustomBox...");
      myCustomBox.parentNode.removeChild(myCustomBox);
    }
    let existingBoxx = document.getElementById("CTbox");
    if (existingBoxx) {
      console.log("Removing existing custom tag box...");
      existingBoxx.parentNode.removeChild(existingBoxx);
    }
    UpdatedtimeRanges = [];

    clearInterval(intervalId_checkTimeRange);
    clearInterval(intervalId_watchTimeRange);

    chrome.runtime.sendMessage({ action: "check cookie" });

    // Reinitialize the extension
    // initializeExtension();
  }
}

// Listen for URL changes due to History API usage
window.addEventListener("popstate", checkSlugChange);

// Set an interval to check for slug changes every second
let currentSlug = window.location.pathname;
console.log("Setting interval to check for slug changes...");
const slugCheckIntervalId = setInterval(checkSlugChange, 2000);

// Initialize the extension when the page is first loaded or refreshed
//initializeExtension();

// Function to check for elements when the page is fully loaded
function checkForElementsIfPageLoaded() {
  console.log("Checking for PageLoad Status...");
  if (window.location.href.includes("https://www.youtube.com/watch?v=")) {
    //&& isPageLoaded()
    console.log("Page Loaded and now checkElement Running!");

    // Delay execution to ensure page elements are fully loaded
    setTimeout(() => {
      const buttonElement = document.querySelector(
        "yt-formatted-string.style-scope.ytd-watch-metadata"
      );
      // console.log(buttonElement);
      if (buttonElement) {
        const url = window.location.href;
        // Get the page title from the specific element
        const pageTitleElement = document.querySelector(
          "yt-formatted-string.style-scope.ytd-watch-metadata"
        );
        const pageTitle = pageTitleElement
          ? pageTitleElement.textContent
          : "Unknown Title";
        console.log("pageTitle = ", pageTitle);
        chrome.runtime.sendMessage({
          action: "checkTitleExists",
          uniqueId: uniqueId,
          pageTitle: pageTitle,
          url: url,
        });
        const mailID = getUsernameCookie();
        console.log(`our email before checking profiles is ${mailID}`);
        chrome.runtime.sendMessage({ action: "check profile", email: mailID });

        // Required elements are available, call insertBoxAfterButton to create and insert the box
      } else {
        // Required elements are not yet available, set up MutationObserver to watch for changes
        console.log("Button Not Found");
        const observer = new MutationObserver(checkForElements);
        observer.observe(document.body, { childList: true, subtree: true });
      }
    }, 2000); // Adjust the delay as needed (e.g., 3000 milliseconds)
  } else {
    console.log("Required Page not Loaded");
  }
}

function handleShowTitlePopup(request, sender, sendResponse) {
  // Handle the "showTitlePopup" action
  // You can add more nested listeners here if needed
  const pageTitle = request.pageTitle;
  console.log("Ensure this is running only once....⚠️");
  if (pageTitle) {
    // Create a floating box to display the pop-up notification
    createFloatingBox(`✔️ Found "${pageTitle}" in CHOICE Directory!`);
    // Log a message in the console
    console.log(`✅ Found "${pageTitle}" in database!`);

    insertBoxAfterButton("Choose Content");
  }
}

// // Event listener to handle the "mousedown" event
// document.addEventListener('mousedown', function(event) {
//   const draggableIds = ['floating-obj', 'option-Container', 'button-Container'];
//   console.log("mousedown event detected");
//   console.log("Event target:", event.target);
//   const targetId = event.target && event.target.id;
//   if (targetId && draggableIds.includes(targetId)) {
//       console.log(`mousedown event target is ${targetId}`);
//       makeElementDraggable(event.target);
//   }
// });

// Event listener to handle the "mousedown" event for making floating-obj draggable
document.addEventListener("mousedown", function (event) {
  // console.log('mousedown event triggered');
  const floatingObj = document.getElementById("floating-obj");
  if (floatingObj) {
    // console.log('floating-obj found');
    if (event.target.closest("#floating-obj")) {
      // console.log('Clicked inside floating-obj');
      makeElementDraggable(floatingObj);
    } else {
      // console.log('Clicked outside floating-obj');
    }
  } else {
    // console.log('floating-obj not found');
  }
});

function handleShowTitleNotFound(request, sender, sendResponse) {
  // Handle the "showTitleNotFound" action
  // You can add more nested listeners here if needed
  console.log("TitleNotFound function:", request);

  const pageTitle = request.pageTitle;

  const existingBox = document.getElementById("my-custom-box");
  if (existingBox) {
    console.log("Removing existing box...");
    existingBox.parentNode.removeChild(existingBox);
  }

  // Create a floating box to display the pop-up notification for title not found
  createFloatingBox(`❗️This video Content not found in Directory`);

  const currentURL = window.location.href;

  // console.log(`unique Id of user for requesting content: ${uniqueId}`)
  // chrome.runtime.sendMessage({action:"checkrequest", title: pageTitle, url: currentURL});
  chrome.runtime.sendMessage({
    action: "checkrequest",
    pageTitle: pageTitle,
    currentURL: currentURL,
    uniqueId: uniqueId,
  });

  // chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {//request.action === "checking"
  //   console.log("already_requested mssg recived")
  //   if (request.action === "already_requested") {
  //     insertBoxAfterButton("Requested");
  //     const requestMovie = document.getElementById("choose-content-btn");
  //     if(requestMovie){
  //       // Change properties of the box
  //       requestMovie.style.background = "rgb(255, 103, 31, 0.3)";  // Set background color to light orange
  //       requestMovie.style.border = "1px solid darkorange";  // Set border color to dark orange
  //       requestMovie.style.cursor = "default";  // Change cursor to default
  //       requestMovie.style.pointerEvents = "none" ;
  //     }

  //   }else if (request.action === "new_request"){
  //     console.log("new request mssg recived")
  //     //below complete logic will go in else for above new api
  //       const requestMovieBtn = insertBoxAfterButton("Request Content");
  //       const requestMovie = document.getElementById("choose-content-btn");
  //       // requestMovie.id = "request-movie";
  //       // Add event listener to the box
  //       if(requestMovie){
  //         requestMovie.addEventListener("click", function() {
  //           console.log("Request Button is cliked...")

  //           // Change properties of the box

  //           requestMovie.textContent = "Requested";
  //           requestMovie.style.background = "rgb(255, 103, 31, 0.3)";  // Set background color to light orange
  //           requestMovie.style.border = "1px solid darkorange";  // Set border color to dark orange
  //           requestMovie.style.cursor = "default";  // Change cursor to default
  //           requestMovie.style.pointerEvents = "none" ;

  //         // Get the page title from the specific element
  //         const pageTitleElement = document.querySelector('yt-formatted-string.style-scope.ytd-watch-metadata');
  //         const pageTitle = pageTitleElement ? pageTitleElement.textContent : 'Unknown Title';
  //         console.log(pageTitle)

  //         const currentURL = window.location.href; // e.g., "https://www.jiocinema.com/tv-shows/taali/3813489"
  //         const segments = currentURL.split("/");  // Split the URL by '/'
  //         const content_type = segments[3];      // The segment you want is at index 3
  //         console.log("content_type =",content_type)

  //         // console.log(content_type);  // This should log "tv-shows" / "movies"

  //         // chrome.runtime.sendMessage({ action: "checkTitleExists", pageTitle

  //         // Extract the platform from the URL
  //         const url = new URL(currentURL);
  //         const platform = url.hostname.split('.')[1]; // Split and take the second part of the hostname
  //         console.log("platform =", platform)

  //         chrome.runtime.sendMessage({ action: "createRequest", title: pageTitle, url: currentURL, type: content_type, platform: platform });
  //         console.log("We are currently viewing: ",pageTitle," and current URL is: ", currentURL, ", pltaform is ", platform );

  //         // // Remove the event listener to make the box unclickable
  //         // requestMovie.removeEventListener("click", handleClick);

  //         });
  //       }

  //   }
  // });

  // Log a message in the console

  console.log(`Title "${pageTitle}" not found in database❗️`);
}

function handleMessageFromBackground(request, sender, sendResponse) {
  //console.log("We are inside handleMessageFromBackground", request)
  if (request.action === "customTagsFound") {
    title = request.pageTitle;
    createFloatingBox(`✔️ Custom Tags found!`);
    // Log a message in the console
    console.log(`✅ Custom Tags found!`);
  } else if (request.action === "showTitlePopup") {
    handleShowTitlePopup(request, sender, sendResponse);
  } else if (request.action === "showTitleNotFound") {
    handleShowTitleNotFound(request, sender, sendResponse);
  } else if (request.action === "already_requested") {
    console.log("request.action === already_requested", request);

    insertBoxAfterButton("Requested", function () {
      const requestMovie = document.getElementById("choose-content-btn");
      if (requestMovie) {
        // Change properties of the box
        requestMovie.style.background = "rgb(255, 103, 31, 0.3)"; // Set background color to light orange
        requestMovie.style.border = "1px solid darkorange"; // Set border color to dark orange
        requestMovie.style.cursor = "default"; // Change cursor to default
        requestMovie.style.pointerEvents = "none";
      }
    });
  } else if (request.action === "new_request") {
    console.log("request.action === new_request", request);
    // console.log("new request mssg recived")
    //below complete logic will go in else for above new api
    insertBoxAfterButton("Request Content", function () {
      console.log("We are till here....✅✅✅✅✅");
      // requestMovie.id = "request-movie";
      // Add event listener to the box
      console.log(`unique Id of user for requesting content: ${uniqueId}`);
      const requestMovie = document.getElementById("choose-content-btn");
      if (requestMovie) {
        requestMovie.addEventListener("click", function () {
          console.log("Request Button is cliked...");
          // Change properties of the box
          requestMovie.textContent = "Requested";
          requestMovie.style.background = "rgb(255, 103, 31, 0.3)"; // Set background color to light orange
          requestMovie.style.border = "1px solid darkorange"; // Set border color to dark orange
          requestMovie.style.cursor = "default"; // Change cursor to default
          requestMovie.style.pointerEvents = "none";
          // Get the page title from the specific element
          const pageTitleElement = document.querySelector(
            "yt-formatted-string.style-scope.ytd-watch-metadata"
          );
          const pageTitle = pageTitleElement
            ? pageTitleElement.textContent
            : "Unknown Title";
          console.log(pageTitle);
          const currentURL = window.location.href; // e.g., "https://www.jiocinema.com/tv-shows/taali/3813489"
          const segments = currentURL.split("/"); // Split the URL by '/'
          const content_type = segments[3]; // The segment you want is at index 3
          console.log("content_type =", content_type);
          // console.log(content_type);  // This should log "tv-shows" / "movies"
          // chrome.runtime.sendMessage({ action: "checkTitleExists", pageTitle
          // Extract the platform from the URL
          const url = new URL(currentURL);
          const platform = url.hostname.split(".")[1]; // Split and take the second part of the hostname
          console.log("platform =", platform);
          console.log(`unique Id of user for requesting content: ${uniqueId}`); // but we arent sending the unique ID from here in request we are fetching it from backend
          chrome.runtime.sendMessage({
            action: "createRequest",
            title: pageTitle,
            url: currentURL,
            type: content_type,
            platform: "Youtube",
            uniqueId: uniqueId,
          });
          console.log(
            "We are currently viewing: ",
            pageTitle,
            " and current URL is: ",
            currentURL,
            ", pltaform is ",
            platform
          );
          // // Remove the event listener to make the box unclickable
          // requestMovie.removeEventListener("click", handleClick);
        });
      }
    });
  } else if (request.action === "loggedOut") {
    // setTimeout(() => {
    console.log("inside sign in process now......🚦");
    insertBoxAfterButton("Sign In");
    const findwatching = setInterval(() => {
      const elem = document.getElementById("watching-container");
      if (elem) {
        elem.style.display = "none";
        clearInterval(findwatching);
        console.log("We are till here....✅✅✅✅✅");

        var loginmssg = document.createElement("div");
        loginmssg.textContent = "Please SignIn to continue";
        document.getElementById("box-title").appendChild(loginmssg);

        const chooseContentbutton =
          document.getElementById("choose-content-btn");
        chooseContentbutton.textContent = "SignUp";

        chooseContentbutton.addEventListener("click", function () {
          // Open a pop-up window for sign-in

          console.log("signup btn clicked");
          chooseContentbutton.pointerEvents = "none";

          popupWindow = window.open(
            "https://waitlist.choiceai.in/login_signup",
            "_blank",
            "width=" + screen.width + ",height=" + screen.height
          );
          popupWindow.moveTo(0, 0);
          popupWindow.resizeTo(screen.width, screen.height);

          function checkCookie() {
            chrome.runtime.sendMessage({ action: "check signup" });

            checkCookieInterval = setTimeout(checkCookie, 1000);
            console.log("checkCookie is active still........🔫");
          }

          // Start checking the cookie
          checkCookie();

          // // Poll for the status of the pop-up window
          // const checkPopupStatus = setInterval(function() {
          //     if (popupWindow.closed) {
          //         // Pop-up window closed, refresh the current page
          //         clearInterval(checkPopupStatus);
          //         initializeExtension();
          //     }
          // }, 1000);
        });
      }
    }, 1000);

    //   console.log("inside cookies");
    //   insertBoxAfterButton("Sign Up");
    //   const chooseContentbutton = document.getElementById("choose-content-btn");
    //   chooseContentbutton.textContent = "SignUp";

    //   // Add event listener to the box
    //   // Add event listener to the "Sign Up" button
    // chooseContentbutton.addEventListener("click", function () {
    //   // Store the current page URL in a message to the background script
    //   chrome.runtime.sendMessage({
    //     action: "store redirect URL",
    //     redirectURL: window.location.href,
    //   });

    //   // Redirect the user to the sign-in page
    //   window.location.href = "https://waitlist.choiceai.in/login_signup";
    // });

    // }, 5000);
  } else if (request.action === "loggedIn") {
    uniqueId = request.value;

    if (popupWindow) closePopupWindow();

    function closePopupWindow() {
      if (popupWindow) {
        popupWindow.close();
        clearInterval(checkCookieInterval);
        console.log("Pop-up window closed manually🔔🔔🔔");
        // Additional logic if needed
      } else {
        console.log("Pop-up window is not open. Continuing with the script.");
        // Additional logic to continue the script
      }
    }

    console.log(`We have a logged a user with uniqueId = ${uniqueId}`);
    initializeExtension();

    //call for default  profile option
    default_profile = "Profile 1";

    // Set the cookie with expiration set to a far future date (e.g., 31 Dec 9999)
    var expirationDate = new Date("9999-12-31");
    var expires = "expires=" + expirationDate.toUTCString();

    document.cookie = "choice_user=" + uniqueId + "; " + expires + "; path=/";
  } else if (request.action === "loadProfiles") {
    // existingProfile = request.profile;
    // console.log(`existing profiles: ${existingProfile}`)
  }
}

console.log(`existing profiles from outside: ${existingProfile}`);
// Now you can access myGlobals.uniqueId publicly within your content script
console.log(`Outside the listener, uniqueId = ${uniqueId}`);

chrome.runtime.onMessage.addListener(handleMessageFromBackground);

function checkTimeRange() {
  var video = document.querySelector("video");
  console.log("Checking is Video.play == true");

  if (intervalId_watchTimeRange) clearInterval(intervalId_watchTimeRange);

  if (window.location.href.includes("/watch") && video && !video.paused) {
    console.log("Running checkTimeRange");

    var currentTime = video.currentTime;

    console.log("Current Time:", currentTime);

    for (let i = 0; i < timeRanges.length; i++) {
      const startTime = timeRanges[i].start_text;
      const endTime = timeRanges[i].end_text;

      console.log(
        "Checking Time Range:",
        startTime,
        endTime,
        "Current Time:",
        currentTime
      );

      if (currentTime >= startTime && currentTime <= endTime) {
        console.log("Auto-Skipping to End Time:", endTime);
        // video.currentTime = endTime;
        video.currentTime = endTime + 0.1; // Add a small offset to prevent re-triggering
        console.log("Auto-Skipping Successful");
        break; // Exit the loop after the first match
      } else {
        console.log("Not within Time Range");
      }
    }
  } else {
    console.log("Video not playing or video element not found");
  }
  // Clear the interval if the page is not on /watch
  if (!window.location.href.includes("/watch")) {
    clearInterval(intervalId_checkTimeRange);
    console.log(
      "clearInterval(intervalId_checkTimeRange) in watchTimeRange function"
    );
    return;
  }
}

// watch timeRanges function starts

let waitingForVideoToPlay = false;

function watchTimeRange() {
  if (waitingForVideoToPlay) {
    return;
  }

  var video = document.querySelector("video");
  if (!video || video.paused) {
    console.log("Video not playing or video element not found");
    return;
  }
  if (intervalId_checkTimeRange) clearInterval(intervalId_checkTimeRange);
  var currentTime = video.currentTime;
  console.log("Current Time:", currentTime);

  for (let i = 0; i < timeRanges.length; i++) {
    const startTime = timeRanges[i].start_text;
    const endTime = timeRanges[i].end_text;
    console.log(
      "Checking Time Range:",
      startTime,
      endTime,
      "Current Time:",
      currentTime
    );

    if (currentTime < startTime) {
      video.currentTime = startTime + 0.1;
      setTimeout(() => {
        waitingForVideoToPlay = true;
      }, 50);
      break;
    } else if (currentTime > endTime && i === timeRanges.length - 1) {
      video.pause();
      // Create a floating box to display the pop-up notification
      createFloatingBox(
        `✔️You have watched all the selected categories! (${selectedCategories})`
      );
      console.log("End of the last time range. Pausing video.");
      break;
    } else if (currentTime > endTime) {
      continue;
    } else if (currentTime >= startTime && currentTime <= endTime) {
      console.log("We're within a valid time range, so no action needed");
      break;
    }
  }
  if (!window.location.href.includes("/watch") && isPageLoaded()) {
    clearInterval(intervalId_watchTimeRange);
    console.log(
      "clearInterval(intervalId_watchTimeRange) in watchTimeRange function"
    );
    return;
  }
}

// Dynamic approach to attach the event listener
function setupVideoListener() {
  const video = document.querySelector("video");
  if (video) {
    video.addEventListener("timeupdate", function () {
      waitingForVideoToPlay = false;
    });
  } else {
    setTimeout(setupVideoListener, 1000); // Try again after 1 second
  }
}

setupVideoListener();

// watch timeRanges fucntion ends

//helper funtions ---------------------------------------------------------

//Create a floating box-like DOM element to display messages, Function to create a floating box that automatically disappears after a specified duration
function createFloatingBox(message) {
  // Create a div element for the floating box
  const floatingBox = document.createElement("div");
  floatingBox.className = "floating-box";
  floatingBox.textContent = message;
  // Style the floating box
  floatingBox.style.position = "fixed";
  floatingBox.style.top = "90px"; // Adjust top margin
  floatingBox.style.right = "20px"; // Adjust right margin
  floatingBox.style.backgroundColor = "#009c43"; // Set background color
  floatingBox.style.padding = "12px"; // Set padding
  floatingBox.style.color = "white"; // Set font color
  floatingBox.style.borderRadius = "8px"; // Set border radius
  floatingBox.style.zIndex = "9999"; // Set a high z-index to ensure it's above other content
  floatingBox.style.fontSize = "16px";

  // Append the floating box to the body
  document.body.appendChild(floatingBox);

  // Remove the floating box after 2 seconds
  setTimeout(() => {
    floatingBox.style.opacity = 0;
    setTimeout(() => {
      document.body.removeChild(floatingBox);
    }, 1000); // Fade out animation duration
  }, 2000); // Auto close duration
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //request.action === "checking"
  if (request.action === "checking") {
    mssg = request.mssg;
    console.log("Check mssg:", mssg);
  }
});

function isPageLoaded() {
  // const loadingIndicator = document.querySelector('.loading-indicator'); // Replace with the actual loading indicator element
  // return loadingIndicator === null; // If loading indicator is not found, page is loaded
  return document.readyState == "complete";
}

function insertBoxAfterButton(text, callback) {
  const existingBox = document.getElementById("my-custom-box");
  if (existingBox) {
    console.log("Removing existing box...");
    existingBox.parentNode.removeChild(existingBox);
  }

  // Create a div element for the box
  var box = document.createElement("div");
  box.id = "my-custom-box"; // Give the box a unique ID to style it if needed
  box.style.cssText = `
    position: relative;
    border-radius: 15px;
    min-height: 100px;
    display: inline-block;
    width: 100%;
    background-color: #000000e6;
    border: 2px solid #ccc;
    padding-bottom : 10px;
    margin-bottom: 5px;
  `;

  const findButtonELem = setInterval(() => {
    const buttonElement = document.querySelector(
      ".style-scope.ytd-watch-next-secondary-results-renderer"
    );

    // console.log(`buttonElement 💀💀: ${buttonElement}`)
    // Check if the button element is found
    if (buttonElement) {
      clearInterval(findButtonELem);
      // Insert the box element after the button element
      buttonElement.insertAdjacentElement("beforebegin", box);
      console.log("box Element Added😉 with text: ", text);

      var headerBox = document.createElement("div");
      headerBox.id = "headerBox";
      headerBox.style.cssText = `
      display: flex;
      alignItems: center;
      justify-content: space-between;
      margin-right: 10px 
      `;

      var header = document.createElement("h2");
      header.textContent = "CHOICE";
      header.style.cssText = `
      margin-top: 5px;
      margin-left: 10px;
      color: #FF671F;
      font-size: 20px;
      font-style: normal;
      font-weight: 700;
      user-select: none;
      `;
      // box.appendChild(header);

      // Create the image element
      var icon = document.createElement("img");
      // icon.src = "path_to_your_icon_image.png"; // Set the path to your image
      icon.src = chrome.runtime.getURL("assets/profile.png");
      icon.style.cssText = `
      margin-top: 5px; 
      margin-left: 10px; 
      width: 24px; 
      height: 24px;
      float: right;
      pointer-events: auto;
      cursor: pointer;
      `;

      icon.style.display = "none";
      // Add click event listener to the icon
      icon.addEventListener("click", () => {
        // Display profile options overlay
        // showProfileOptions();
        showProfileOptions(existingProfiles);
      });

      // Append both elements to the headerBox container
      headerBox.appendChild(header);
      headerBox.appendChild(icon);

      // Append the headerBox container to the main box
      box.appendChild(headerBox);

      var title = document.createElement("div");
      title.id = "box-title";

      // Get the page title from the specific element
      const pageTitleElement = document.querySelector(
        "yt-formatted-string.style-scope.ytd-watch-metadata"
      );
      const pageTitle = pageTitleElement
        ? pageTitleElement.textContent
        : "Unknown Title";

      // Create a container for the text
      var textContainer = document.createElement("div");
      textContainer.id = "watching-container";
      textContainer.style.cssText = `
        display: flex;
        flex-direction: row;
      `;

      // Create a span for the "Watching" text
      var watchingText = document.createElement("span");
      watchingText.textContent = "Watching:";
      watchingText.style.cssText = `
        color: #FFF;
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
      `;

      // Create a span for the "pageTitle" text
      var pageTitleText = document.createElement("span");
      pageTitleText.textContent = pageTitle;
      pageTitleText.style.cssText = `
        margin-left: 5px; /* Add some space between "Watching" and "pageTitle" */
        color: #a1a1a1; /* Set the color to gray */
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
      `;

      // Append the "Watching" and "pageTitle" spans to the text container
      textContainer.appendChild(watchingText);
      textContainer.appendChild(pageTitleText);

      // Append the text container to the "title" div
      title.appendChild(textContainer);

      // Apply styles to the "title" div
      title.style.cssText = `
        margin-top: 5px;
        margin-left: 10px;
        margin-right: 7px;
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        color: #FFF; /* Set the overall color to white */
      `;

      // Append the "title" div to the "box" element
      box.appendChild(title);

      // Create a container div for the buttons
      var buttonsContainer = document.createElement("div");
      buttonsContainer.style.cssText = `
        display: flex;
        gap: 10px;
        margin-left: 10px;
        margin-top: 10px;
      `;

      // Create a div element for the Choose Content button
      var chooseContentButton = document.createElement("div");
      chooseContentButton.id = "choose-content-btn";
      chooseContentButton.textContent = text;
      chooseContentButton.style.cssText = `
            padding: 7px;
            background: #FF671F;
            color: #FFF;
            border-radius: 7px;
            text-align: center;
            font-family: Inter;
            font-size: 16px;
            font-style: normal;
            font-weight: 700;
            user-select: none;
            cursor: pointer;
          `;

      // Add event listener to the Choose Content button
      chooseContentButton.addEventListener("click", function () {
        console.log(`Text = ${text}`);
        if (text === "Choose Content") {
          console.log("Choose content is clicked...");
          showFloatingObject();

          chooseContentButton.style.pointerEvents = "none";
        }
      });

      // Append the Choose Content button to the buttons container
      buttonsContainer.appendChild(chooseContentButton);

      // Check if the text is not "Sign In"
      if (text !== "Sign In") {
        // Create a div element for the Custom Tags button
        var customTagsButton = document.createElement("div");
        customTagsButton.id = "custom-tags-btn";
        customTagsButton.textContent = "Custom Tags";
        customTagsButton.style.cssText = `
              padding: 7px;
              background: #FF671F;
              color: #FFF;
              border-radius: 7px;
              text-align: center;
              font-family: Inter;
              font-size: 16px;
              font-style: normal;
              font-weight: 700;
              user-select: none;
              cursor: pointer;
            `;

        // Add event listener to the Custom Tags button
        customTagsButton.addEventListener("click", function () {
          console.log("Custom Tags button clicked");
          if (text === "Choose Content") {
            createCustomTagBox();
            floatingBox.style.display = "none";
          } else {
            showFloatingObject();
          }
          // Implement your logic for the Custom Tags button here
        });

        //admin button
        if (text === "Request Content") {
          const AddTagButton = createStyledButton("Add Tags");
          AddTagButton.id = "add-tag-button";
          AddTagButton.addEventListener("click", () => {
            console.log("Add tags button clicked! 🎉");
            // Hide the floating box

            createAddTagBox();
            floatingBox.style.display = "none"; // Hide the floating box
            // restoreButton.style.display = "block"; // Show the restore button
          });

          buttonsContainer.appendChild(AddTagButton);
        } else if (text === "Choose Content") {
          const AddMoreTagButton = createStyledButton("Tags More");
          AddMoreTagButton.id = "add-more-tag-button";
          AddMoreTagButton.addEventListener("click", () => {
            console.log("Add tags button clicked! 🎉");
            // Hide the floating box

            createAddMoreTagBox();
            // floatingBox.style.display = "none"; // Hide the floating box
            // restoreButton.style.display = "block"; // Show the restore button

          });
          buttonsContainer.appendChild(AddMoreTagButton);

          
        }

        // Append the Custom Tags button to the buttons container
        buttonsContainer.appendChild(customTagsButton);
      }

      // Append the buttons container to the box
      box.appendChild(buttonsContainer);

      // Invoke the callback if provided
      if (typeof callback === "function") {
        callback();
      }
    } else {
      // If the button element is not found, insert the box at the end of the document body
      console.log("Button not found to insert⚠️");
      document.body.appendChild(box);
    }
  }, 1000);

  return box;
}

// function makeElementDraggable(element) {
//   let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

//   // Function to handle mouse down event for dragging
//   function dragMouseDown(e) {
//       e = e || window.event;
//       e.preventDefault();
//       // get the mouse cursor position at startup:
//       pos3 = e.clientX;
//       pos4 = e.clientY;
//       document.onmouseup = closeDragElement;
//       // call a function whenever the cursor moves:
//       document.onmousemove = elementDrag;
//   }

//   // Function to handle mouse move event for dragging
//   function elementDrag(e) {
//       e = e || window.event;
//       e.preventDefault();
//       // calculate the new cursor position:
//       pos1 = pos3 - e.clientX;
//       pos2 = pos4 - e.clientY;
//       pos3 = e.clientX;
//       pos4 = e.clientY;
//       // set the element's new position:
//       element.style.top = (element.offsetTop - pos2) + "px";
//       element.style.left = (element.offsetLeft - pos1) + "px";
//   }

//   // Function to handle mouse up event to stop dragging
//   function closeDragElement() {
//       // stop moving when mouse button is released:
//       document.onmouseup = null;
//       document.onmousemove = null;
//   }

//   // Add event listener for mouse down to start dragging
//   element.onmousedown = dragMouseDown;
// }

// Listen for the message to update timeRanges ( try with maintaining a different array)

function makeElementDraggable(element) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  console.log("Draggable...🚀🚀🚀");
  // if present, the header is where you move the DIV from:
  const header = document.getElementById("floating-obj");
  if (header) {
    header.onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    element.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    element.style.top = element.offsetTop - pos2 + "px";
    element.style.left = element.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Helper function to convert HH:MM:SS to total seconds
function timeToSeconds(time) {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

function secondsToReadableTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let timeString = "";
  if (hrs > 0) {
    timeString += `${hrs} hr `;
  }
  if (mins > 0) {
    timeString += `${mins} min `;
  }
  if (secs > 0 || (hrs === 0 && mins === 0)) {
    // Show seconds if it's the only non-zero value
    timeString += `${secs} s`;
  }

  return timeString.trim(); // Remove any trailing space
}

function showFloatingObject() {
  // let floatingBox_exists = document.getElementById("floating-obj");
  // if (floatingBox_exists) {
  //   // If it exists, remove it before creating a new one
  //   floatingBox.parentElement.removeChild(floatingBox);
  // }
  console.log("Choose Content is Clicked!!!!");
  floatingBox = document.createElement("div");
  floatingBox.id = "floating-obj";
  floatingBox.style.cssText = `
    position: fixed;
    top: 46%;
    left: 84.5%;
    transform: translate(-50%, -50%);
    background-color: #181A23;
    
    border-radius: 14px;
    color: white;
    z-index: 9999;
    width: 580px;
    
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    align-content: center;
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
`;

  // const floatingBox_exists = document.getElementById('floating-obj');
  // makeElementDraggable(floatingBox_exists);

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
    font-family: Inter;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 20px;
    margin-bottom: 0;
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
    margin-left: auto;
      
  `;
  closeSymbol.addEventListener("click", () => {
    document.body.removeChild(floatingBox);
    document.getElementById("my-custom-box").style.pointerEvents = "auto";
  });

  contentBox.appendChild(header);
  // contentBox.appendChild(backgroundLayout);
  contentBox.appendChild(closeSymbol);

  floatingBox.appendChild(contentBox);

  let options = [];

  UpdatedtimeRanges.forEach((item) => {
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
        font-family: Inter;
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
    font-family: Inter;
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

    const sceneCount = UpdatedtimeRanges.filter(
      (item) => item.category_text === optionText
    ).length;
    const sceneCountTd = document.createElement("td");
    sceneCountTd.textContent = sceneCount;
    sceneCountTd.style.textAlign = "center";
    sceneCountTd.style.cssText = `
    color: #72747E;
    text-align: center;
    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px; /* 166.667% */
  `;
    optionRow.appendChild(sceneCountTd);

    const totalDurationInSeconds = UpdatedtimeRanges.filter(
      (item) => item.category_text === optionText
    ).reduce((acc, curr) => acc + timeToSeconds(curr.scenetime_text), 0);

    const totalDurationReadable = secondsToReadableTime(totalDurationInSeconds);

    const totalDurationTd = document.createElement("td");
    totalDurationTd.textContent = totalDurationReadable;
    totalDurationTd.style.textAlign = "left";
    totalDurationTd.style.cssText = `
    color: #72747E;
    text-align: left;
    font-family: Inter;
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

  const skipButton = createStyledButton(" ▶| Skip Tags");
  skipButton.addEventListener("click", () => {
    if (selectedCategories.length > 0) {
      console.log("Skips tags button clicked! 🙈");
      timeRanges = []; // Clear any previous data
      selectedCategories.forEach((category) => {
        timeRanges.push(
          ...UpdatedtimeRanges.filter((item) => item.category_text === category)
        );
      });
      timeRanges.sort(
        (a, b) => timeToSeconds(a.start_text) - timeToSeconds(b.start_text)
      );
      console.log("timeRanges for Skip Tags: ", timeRanges); // Check the populated timeRanges
      timeRanges = convertTimeRangesToSeconds(timeRanges);
      // Hide the floating box
      floatingBox.style.display = "none";
      document.getElementById("my-custom-box").style.pointerEvents = "auto";
      // document.body.removeChild(floatingBox);
      intervalId_checkTimeRange = setInterval(checkTimeRange, 1000); // Start time range checks
      console.log("checkTimeRange initiated...............");
      createFloatingBox(
        `✔️Your selected categories will be Skipped! (${selectedCategories})`
      );
      // const floatingBox = document.getElementById('floating-obj');
      // makeElementDraggable(floatingBox);

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
  watchButton.addEventListener("click", () => {
    if (selectedCategories.length > 0) {
      console.log("Watch tags button clicked! 👀");
      timeRanges = []; // Clear any previous data
      selectedCategories.forEach((category) => {
        timeRanges.push(
          ...UpdatedtimeRanges.filter((item) => item.category_text === category)
        );
      });
      timeRanges.sort(
        (a, b) => timeToSeconds(a.start_text) - timeToSeconds(b.start_text)
      );
      console.log("timeRanges to Watch Tags: ", timeRanges); // Check the populated timeRanges
      timeRanges = convertTimeRangesToSeconds(timeRanges);

      //document.querySelector('.mui-style-6bux4n-btn').click();
      // Hide the floating box
      floatingBox.style.display = "none";
      document.getElementById("my-custom-box").style.pointerEvents = "auto";

      intervalId_watchTimeRange = setInterval(watchTimeRange, 1000); // Start time range checks
      console.log("watchTimeRange initiated...............");
      createFloatingBox(
        `✔️You are watching only selected categories! (${selectedCategories})`
      );
      // const floatingBox = document.getElementById('floating-obj');
      // makeElementDraggable(floatingBox);

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

    createCustomTagBox();
    floatingBox.style.display = "none"; // Hide the floating box
    // restoreButton.style.display = "block"; // Show the restore button
  });

  const AddTagButton = createStyledButton("Add Tags");
  AddTagButton.id = "add-tag-button";
  AddTagButton.addEventListener("click", () => {
    console.log("Add tags button clicked! 🎉");
    // Hide the floating box

    createAddTagBox();
    floatingBox.style.display = "none"; // Hide the floating box
    // restoreButton.style.display = "block"; // Show the restore button
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
  buttonContainer.appendChild(customTagButton);

  // start of timeline code

  // Create the "Check Timeline" button

  const checkTimelineButton = document.createElement("div");
  checkTimelineButton.id = "check-timeline-btn";
  checkTimelineButton.textContent = " > Timeline";
  checkTimelineButton.style.cssText = `
  color: white;
  font-size: 14px;
  font-family: Inter;
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
            width: 100%;  // Ensure the table occupies the full width of the container

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
      const timelineHeaders = ["Category", "StartTime/EndTime", "Duration"];
      const timelineHeaderRow = document.createElement("tr");
      timelineHeaders.forEach((headerText) => {
        const header = document.createElement("th");
        header.textContent = headerText;
        // Apply the common styles
        header.style.cssText = `
                color: #B3B5BE;
                font-family: Inter;
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
          ? UpdatedtimeRanges.filter((item) =>
              selectedCategories.includes(item.category_text)
            )
          : UpdatedtimeRanges;

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
              font-family: Inter;
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
              font-family: Inter;
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
              font-family: Inter;
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

        timelineTable.appendChild(row);
      });

      const timelineContainer = document.createElement("div");
      timelineContainer.id = "timeline-Container";
      timelineContainer.className = "scroll-2"; // Add this line to assign the CSS class
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
                border-radius: 10px;
            }
            .scroll-2::-webkit-scrollbar-thumb {
                background-color: #FF671F;
                border-radius: 10px;
                transition: width 0.3s;  
            }
            .scroll-2 {
                scrollbar-width: thin;
                scrollbar-color: rgba(0, 0, 0, 0.8) rgba(255, 255, 255, 0.1);
            }
        `;

      document.head.appendChild(style); // Add the style to the document head

      timelineContainer.appendChild(timelineTable);
      floatingBox.appendChild(timelineContainer);
      // Append the timeline table to the floating box
      // floatingBox.appendChild(timelineTable);

      // Fix for alignment issue. Recalculate the position after adding new content
      // floatingBox.style.top = "50%";
      // floatingBox.style.left = "50%";
      // floatingBox.style.transform = "translate(-50%, -50%)";
    }
  });

  buttonContainer.appendChild(checkTimelineButton);

  // End of timeline code

  floatingBox.appendChild(buttonContainer);

  document.body.style.fontFamily = "'Poppins', sans-serif";

  document.body.appendChild(floatingBox);
  // document.getElementById("my-custom-box").click = none;
}

// Function to convert "HH:MM:SS" time to seconds ( *DONE*   )
function convertTimeRangesToSeconds(timeRanges) {
  function timeToSeconds(time) {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }

  return timeRanges.map((range) => {
    return {
      ...range,
      start_text: timeToSeconds(range.start_text),
      end_text: timeToSeconds(range.end_text),
      scenetime_text: timeToSeconds(range.scenetime_text),
    };
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Check if the action is to receive timeRanges_DB
  if (request.action === "sendTimeRanges_seconds") {
    let timeRanges_s = JSON.parse(request.timeRanges_DB); // Parse the stringified timeRanges
    // console.log(`request.timeRanges: ${JSON.stringify(timeRanges_s)}`);
    console.log(`request.timeRanges: ${timeRanges_s}`);

    UpdatedtimeRanges = timeRanges_s
      // .filter(entry => entry.cs >= confidenceScore)
      .map((entry) => {
        return {
          start_text: secondsToHMS(entry.start_text),
          end_text: secondsToHMS(entry.end_text),
          scenetime_text: secondsToHMS(entry.scenetime_text),
          category_text: entry.category_text,
          cs: entry.cs !== undefined ? entry.cs : 100,
          type: entry.type,
        };
      });

    UpdatedtimeRanges.sort(
      (a, b) => timeToSeconds(a.start_text) - timeToSeconds(b.start_text)
    );
    // Log or use UpdatedtimeRanges as needed
    console.log("UpdatedtimeRanges:", UpdatedtimeRanges);
  }

  // UpdatedtimeRanges = request.timeRanges; // Update the timeRanges array

  UpdatedtimeRanges.sort(
    (a, b) => timeToSeconds(a.start_text) - timeToSeconds(b.start_text)
  );

  console.log("UpdatedtimeRanges", UpdatedtimeRanges);
  // timeRanges = convertTimeRangesToSeconds(UpdatedtimeRanges);
  console.log("timeRanges (should be empty)", timeRanges);
  // Insert the table after fetching and processing the time ranges.
  insertTable();
});

// Define the secondsToHMS function first
function secondsToHMS(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function pad(num) {
  return num < 10 ? "0" + num : num;
}

// // Function to create and insert the box element after the .mui-style-6bux4n-btn selector
// function createDom() {

//   const existingBox = document.getElementById("my-dom-box");
//   if (existingBox) {
//     console.log("Removing existing DOM box...");
//     existingBox.parentNode.removeChild(existingBox);
//   }

//   // Create a div element for the box
//   var box = document.createElement("div");
//   box.id = "my-dom-box"; // Give the box a unique ID to style it if needed
//   box.style.cssText=`
//   border-radius: 15px;
//   min-height: 100px;
//   min-width: 50px;
//   background-color:  rgba(255, 255, 255, 0.1);
//   border: 2px solid #ccc;

//   `
//   // Find the element with class ".mui-style-6bux4n-btn"
//   const buttonElement = document.querySelector(".style-scope.ytd-watch-next-secondary-results-renderer");

//   // Check if the button element is found
//   if (buttonElement) {
//       // Insert the box element after the button element
//       buttonElement.insertAdjacentElement('beforebegin', box);
//       console.log("Manage tags box Element Added😉")

//   } else {
//       // If the button element is not found, insert the box at the end of the document body
//       console.log("Button not found to insert⚠️")
//       document.body.appendChild(box);
//   }

//  return box;
// }

// function showProfileOptions() {
//   const profileOverlay = document.createElement("div");
//   profileOverlay.id = "profile-overlay";
//   profileOverlay.style.cssText = `
//       position: fixed;
//       top: 0;
//       left: 0;
//       width: 100%;
//       height: 100%;
//       background-color: rgba(24, 26, 35, 0.4); /* Semi-transparent background */
//       z-index: 9999;
//       display: flex;
//       justify-content: center;
//       align-items: center;
//   `;

//   const profileOptionsContainer = document.createElement("div");
//   profileOptionsContainer.id = "profile-options-container"; // Add an ID for easy access
//   profileOptionsContainer.style.cssText = `
//       background-color: rgb(24, 26, 35);
//       border: 1px solid #000;
//       padding: 20px;
//       border-radius: 10px; /* Rounded corners */
//       width: 300px; /* Fixed width */
//       box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Box shadow */
//       font-family: 'Poppins', sans-serif; /* Poppins font */
//   `;

//   // Create a div for the header
//   const headerDiv = document.createElement("div");
//   headerDiv.style.cssText = `
//       display: flex;
//       justify-content: space-between; /* Place items at each end of the container */
//       align-items: center; /* Center items vertically */
//       margin-bottom: 20px; /* Spacing below header */
//   `;

//   // Create the header element
//   const profileHeading = document.createElement("h2");
//   profileHeading.textContent = "Profiles"; /* Updated heading */
//   profileHeading.style.cssText = `
//       color: #FFF; /* Text color */
//       font-size: 20px; /* Font size */
//       font-family: 'Poppins', sans-serif; /* Poppins font */
//   `;
//   headerDiv.appendChild(profileHeading);

//   // Create the close symbol
//   const closeSymbol = document.createElement("img");
//   closeSymbol.src = "https://api.iconify.design/ep/close-bold.svg?color=%23595959";   // Make sure this path is correct
//   closeSymbol.alt = "Close";
//   closeSymbol.style.cssText = `
//       width: 20px;
//       height: 20px;
//       cursor: pointer;
//   `;
//   closeSymbol.addEventListener("click", () => {
//       document.body.removeChild(profileOverlay);
//   });

//   // Append the close symbol to the header div
//   headerDiv.appendChild(closeSymbol);

//   // Append the header div to the options container
//   profileOptionsContainer.appendChild(headerDiv);

//   const addProfile = document.createElement("div");
//   addProfile.textContent = "Add Profile";
//   addProfile.style.cssText = `
//       font-size: 16px;
//       color: #FF671F; /* Text color */
//       cursor: pointer; /* Cursor on hover */
//       margin-top: 20px; /* Spacing between options */
//       font-family: 'Poppins', sans-serif; /* Poppins font */
//   `;
//   addProfile.addEventListener("click", handleAddProfileClick);

//   profileOptionsContainer.appendChild(addProfile);

//   profileOverlay.appendChild(profileOptionsContainer);
//   document.body.appendChild(profileOverlay);
// }

// function handleAddProfileClick() {
//   // Create a new div for the profile categories overlay
//   const categoriesOverlay = document.createElement("div");
//   categoriesOverlay.id = "categories-overlay";
//   categoriesOverlay.style.cssText = `
//       position: fixed;
//       top: 0;
//       left: 0;
//       width: 100%;
//       height: 100%;
//       background-color: rgba(24, 26, 35, 0.4); /* Semi-transparent background */
//       z-index: 10000;
//       display: flex;
//       flex-direction: column;
//       justify-content: center;
//       align-items: center;
//   `;

//   const container = document.createElement("div");
//   container.style.cssText = `
//       background-color: rgb(24, 26, 35);
//       border: 1px solid #000;
//       padding: 20px;
//       border-radius: 10px; /* Rounded corners */
//       width: 400px; /* Fixed width */
//       box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Box shadow */
//       font-family: 'Poppins', sans-serif; /* Poppins font */
//       position: relative;
//       display: flex;
//       flex-wrap: wrap;
//       justify-content: flex-start;
//   `;

//   // Create a div to contain the "New Profile" text and the close symbol
//   const headerContainer = document.createElement("div");
//   headerContainer.style.cssText = `
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       width: 100%;
//       padding: 0 20px;
//       box-sizing: border-box;
//       margin-bottom: 20px;
//   `;

//   // Create an input field for the profile name
//   const profileNameInput = document.createElement("input");
//   profileNameInput.type = "text";
//   profileNameInput.placeholder = "Enter Profile Name";
//   profileNameInput.style.cssText = `
//       width: 70%;
//       padding: 10px;
//       // margin-bottom: 20px;
//       box-sizing: border-box;
//       border: 1px solid rgb(204 204 204 / 32%);
//       border-radius: 5px;
//       font-size: 16px;
//       color: white;
//       background-color: rgb(15 17 25);
//   `;
//   headerContainer.appendChild(profileNameInput);

//   // Create the close symbol
//   const closeSymbol = document.createElement("img");
//   closeSymbol.src = "https://api.iconify.design/ep/close-bold.svg?color=%23595959";   // Make sure this path is correct
//   closeSymbol.alt = "Close";
//   closeSymbol.style.cssText = `
//       width: 20px;
//       height: 20px;
//       cursor: pointer;
//   `;
//   closeSymbol.addEventListener("click", () => {
//       document.body.removeChild(categoriesOverlay);
//   });
//   headerContainer.appendChild(closeSymbol);

//   // Append the header container to the categories overlay
//   container.appendChild(headerContainer);

//   // Create the container for categories
//   const categoriesContainer = document.createElement("div");
//   categoriesContainer.style.cssText = `
//       // background-color: rgb(24, 26, 35);
//       // border: 1px solid #000;
//       // padding: 20px;
//       // border-radius: 10px; /* Rounded corners */
//       width: 400px; /* Fixed width */
//       // box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Box shadow */
//       font-family: 'Poppins', sans-serif; /* Poppins font */
//       position: relative;
//       display: flex;
//       flex-wrap: wrap;
//       justify-content: flex-start;
//   `;

//   // Create the categories
//   const categories = ["Alcohol", "Smoking", "Drugs", "Visually Disturbing", "Violence", "Blood", "Partial Nudity", "Nudity", "Intimacy"];
//   categories.forEach(category => {
//       const categoryBox = document.createElement("div");
//       categoryBox.textContent = category;
//       categoryBox.style.cssText = `
//           background-color: rgba(128, 128, 128, 0.5);
//           color: white;
//           padding: 9px;
//           margin-right: 10px;
//           margin-bottom: 10px;
//           cursor: pointer;
//           border-radius: 5px;
//           font-size: 15px;
//           line-height: 20px;
//           width: fit-content;
//           text-align: center;
//           border: 1px solid rgb(255 255 255 / 47%);
//           transition: border-color 0.2s, background-color 0.2s;
//       `;
//       categoryBox.addEventListener("click", () => {
//           // Toggle active class on click
//           categoryBox.classList.toggle("active");
//       });
//       categoryBox.addEventListener("mouseenter", () => {
//           // Change border color and background color on hover
//           categoryBox.style.borderColor = "#FF671F";
//           categoryBox.style.backgroundColor = "rgba(255, 103, 31, 0.2)";
//       });
//       categoryBox.addEventListener("mouseleave", () => {
//           // Reset border color and background color on hover out
//           categoryBox.style.borderColor = "rgba(255, 255, 255, 0.8)";
//           categoryBox.style.backgroundColor = "rgba(128, 128, 128, 0.5)";
//           if (categoryBox.classList.contains("active")) {
//               // If the box is active, keep the light orange background
//               categoryBox.style.backgroundColor = "rgba(255, 103, 31, 0.2)";
//               categoryBox.style.borderColor = "#FF671F";
//           }
//       });
//       categoriesContainer.appendChild(categoryBox);
//   });

//   // Append the categories container to the categories overlay
//   container.appendChild(categoriesContainer);

//   const buttonContainer = document.createElement("div");
//   buttonContainer.style.cssText = `
//       display: flex;
//       justify-content: flex-end;
//       width: 100%;
//       margin-top: 20px;
//   `;
//   // Create the save button
//   const saveButton = document.createElement("button");
//   saveButton.textContent = "Save";
//   saveButton.style.cssText = `
//       background-color: #4CAF50;
//       color: white;
//       padding: 10px 20px;
//       border: none;
//       border-radius: 5px;
//       cursor: pointer;
//       position: absolute;
//       bottom: 10px;
//       right: 10px;
//       font-family: 'Poppins', sans-serif; /* Poppins font */
//   `;

//   saveButton.addEventListener("click", () => {
//     // Get the profile name from the input field
//     const profileName = profileNameInput.value.trim();
//     if (profileName !== "") {
//         // Get all selected categories
//         const selectedCategories = Array.from(categoriesContainer.querySelectorAll('.active')).map(category => category.textContent);

//         // Combine selected categories into a single string separated by commas
//         const cat = selectedCategories.join(', ');

//         // If there are selected categories, proceed
//         if (cat !== "") {
//             // If the profile name is not empty, create a new profile element
//             const profileElement = document.createElement("div");
//             profileElement.textContent = profileName;
//             profileElement.style.cssText = `
//                 padding: 10px;
//                 border: 1px solid #ccc;
//                 border-radius: 5px;
//                 margin-top: 10px;
//                 cursor: pointer;
//                 font-family: 'Poppins', sans-serif; /* Poppins font */
//                 color: white;
//             `;
//             profileElement.addEventListener("click", () => {
//                 // Implement functionality to view profile details/options
//                 console.log("Viewing profile:", profileName, " Categories:", cat);
//             });
//             console.log("Save button clicked!")
//             // const mail = "unique Id yet to set"

//             // Get the value of the cookie named "username"
//             // const getUsernameCookie = () => {
//             //   const cookies = document.cookie.split(';');
//             //   for (let i = 0; i < cookies.length; i++) {
//             //       const cookie = cookies[i].trim();
//             //       // Check if this is the "username" cookie
//             //       if (cookie.startsWith('choice_user=')) {
//             //           // Extract the value of the cookie
//             //           return cookie.substring('choice_user='.length);
//             //       }
//             //   }
//             //   // Return null if the "username" cookie is not found
//             //   return null;
//             // };

//             // Store the value of the "username" cookie in the variable "mail"
//             const mail = getUsernameCookie();

//             // If the "username" cookie exists, its value will be stored in the "mail" variable
//             console.log(mail);

//             console.log(`mail = ${mail}, p_name = ${profileName}, cat = ${cat}`)
//             // Send the message with the profile information
//             chrome.runtime.sendMessage({ action: "new profile", email : mail, p_name : profileName, cat: cat });

//             // Append the profile element to the profile options container
//             const profileOptionsContainer = document.getElementById("profile-options-container");
//             profileOptionsContainer.appendChild(profileElement);

//             // Close the overlay
//             document.body.removeChild(categoriesOverlay);
//         } else {
//             // If no categories are selected, show an alert
//             alert("Please select at least one category.");
//         }
//     } else {
//         // If the profile name is empty, show an alert
//         alert("Please enter a profile name.");
//     }
// });

//   buttonContainer.appendChild(saveButton);
//   container.appendChild(buttonContainer);

//   categoriesOverlay.appendChild(container)
//   // Append the categories overlay to the document body
//   document.body.appendChild(categoriesOverlay);
// }

function getUsernameCookie() {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith("choice_user=")) {
      return cookie.substring("choice_user=".length);
    }
  }
  return null;
}

function handleAddProfileClick(profileName, selectedCategories) {
  // Create a new div for the profile categories overlay
  const categoriesOverlay = document.createElement("div");
  categoriesOverlay.id = "categories-overlay";
  categoriesOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(24, 26, 35, 0.4); /* Semi-transparent background */
      z-index: 10000;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
  `;

  const container = document.createElement("div");
  container.style.cssText = `
      background-color: rgb(24, 26, 35);
      border: 1px solid #000;
      padding: 20px;
      border-radius: 10px; /* Rounded corners */
      width: 400px; /* Fixed width */
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Box shadow */
      font-family: 'Poppins', sans-serif; /* Poppins font */
      position: relative;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
  `;

  // Create a div to contain the "New Profile" text and the close symbol
  const headerContainer = document.createElement("div");
  headerContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;
      margin-bottom: 20px;
  `;

  // Create an input field for the profile name
  const profileNameInput = document.createElement("input");
  profileNameInput.type = "text";
  profileNameInput.value = profileName; // Set the value to the provided profile name
  profileNameInput.style.cssText = `
      width: 70%;
      padding: 10px;
      box-sizing: border-box;
      border: 1px solid rgb(204 204 204 / 32%);
      border-radius: 5px;
      font-size: 16px;
      color: white;
      background-color: rgb(15 17 25);
  `;
  headerContainer.appendChild(profileNameInput);

  // Create the close symbol
  const closeSymbol = document.createElement("img");
  closeSymbol.src =
    "https://api.iconify.design/ep/close-bold.svg?color=%23595959"; // Make sure this path is correct
  closeSymbol.alt = "Close";
  closeSymbol.style.cssText = `
      width: 20px;
      height: 20px;
      cursor: pointer;
  `;
  closeSymbol.addEventListener("click", () => {
    document.body.removeChild(categoriesOverlay);
  });
  headerContainer.appendChild(closeSymbol);

  // Append the header container to the categories overlay
  container.appendChild(headerContainer);

  // Create the container for categories
  const categoriesContainer = document.createElement("div");
  categoriesContainer.style.cssText = `
      width: 400px; /* Fixed width */
      font-family: 'Poppins', sans-serif; /* Poppins font */
      position: relative;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
  `;

  // Create the categories
  const categories = [
    "Alcohol",
    "Smoking",
    "Drugs",
    "Visually Disturbing",
    "Violence",
    "Blood",
    "Partial Nudity",
    "Nudity",
    "Intimacy",
  ];
  // Inside the forEach loop where categories are created, add the condition to check if the category is included in the selectedCategories array
  // Inside the forEach loop where categories are created
  categories.forEach((category) => {
    const categoryBox = document.createElement("div");
    categoryBox.textContent = category;
    categoryBox.style.cssText = `
        background-color: rgba(128, 128, 128, 0.5);
        color: white;
        padding: 9px;
        margin-right: 10px;
        margin-bottom: 10px;
        cursor: pointer;
        border-radius: 5px;
        font-size: 15px;
        line-height: 20px;
        width: fit-content;
        text-align: center;
        border: 1px solid rgb(255 255 255 / 47%);
        transition: border-color 0.2s, background-color 0.2s;
    `;
    // Check if the category is included in selectedCategories
    if (selectedCategories.includes(category)) {
      categoryBox.classList.add("active"); // Add the 'active' class
      categoryBox.style.backgroundColor = "rgba(255, 103, 31, 0.2)"; // Apply active background color
      categoryBox.style.borderColor = "#FF671F"; // Apply active border color
    }
    categoryBox.addEventListener("click", () => {
      // Toggle active class on click
      categoryBox.classList.toggle("active");
      // Toggle active style on click
      if (categoryBox.classList.contains("active")) {
        categoryBox.style.backgroundColor = "rgba(255, 103, 31, 0.2)";
        categoryBox.style.borderColor = "#FF671F";
        console.log(`Category '${category}' added.`);
      } else {
        categoryBox.style.backgroundColor = "rgba(128, 128, 128, 0.5)";
        categoryBox.style.borderColor = "rgba(255, 255, 255, 0.8)";
        console.log(`Category '${category}' removed.`);
      }
    });
    categoryBox.addEventListener("mouseenter", () => {
      // Change border color and background color on hover
      categoryBox.style.borderColor = "#FF671F";
      categoryBox.style.backgroundColor = "rgba(255, 103, 31, 0.2)";
      // console.log(`Mouse entered category '${category}'.`);
    });
    categoryBox.addEventListener("mouseleave", () => {
      // Reset border color and background color on hover out
      if (!categoryBox.classList.contains("active")) {
        categoryBox.style.borderColor = "rgba(255, 255, 255, 0.8)";
        categoryBox.style.backgroundColor = "rgba(128, 128, 128, 0.5)";
        // console.log(`Mouse left category '${category}'.`);
      }
    });
    categoriesContainer.appendChild(categoryBox);
  });
  // Append the categories container to the categories overlay
  container.appendChild(categoriesContainer);

  const buttonContainer = document.createElement("div");
  buttonContainer.style.cssText = `
      display: flex;
      justify-content: flex-end;
      width: 100%;
      margin-top: 20px;
  `;

  // Create the save button
  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.style.cssText = `
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      position: absolute;
      bottom: 10px;
      right: 10px;
      font-family: 'Poppins', sans-serif; /* Poppins font */
  `;

  // saveButton.addEventListener("click", () => {
  //     const profileName = profileNameInput.value.trim();
  //     if (profileName !== "") {
  //         const selectedCategories = Array.from(categoriesContainer.querySelectorAll('.active')).map(category => category.textContent);
  //         const cat = selectedCategories.join(', ');
  //         if (cat !== "") {
  //             const profileElement = document.createElement("div");
  //             profileElement.textContent = profileName;
  //             profileElement.style.cssText = `
  //                 padding: 10px;
  //                 border: 1px solid #ccc;
  //                 border-radius: 5px;
  //                 margin-top: 10px;
  //                 cursor: pointer;
  //                 font-family: 'Poppins', sans-serif; /* Poppins font */
  //                 color: white;
  //             `;
  //             profileElement.addEventListener("click", () => {
  //                 console.log("Viewing profile:", profileName, " Categories:", cat);
  //             });
  //             console.log("Save button clicked!");

  //             const mail = getUsernameCookie();
  //             console.log(mail);

  //             console.log(`mail = ${mail}, p_name = ${profileName}, cat = ${cat}`)
  //             chrome.runtime.sendMessage({ action: "new profile", email : mail, p_name : profileName, cat: cat });

  //             const profileOptionsContainer = document.getElementById("profile-options-container");
  //             profileOptionsContainer.appendChild(profileElement);

  //             document.body.removeChild(categoriesOverlay);
  //         } else {
  //             alert("Please select at least one category.");
  //         }
  //     } else {
  //         alert("Please enter a profile name.");
  //     }
  // });

  saveButton.addEventListener("click", () => {
    const profileName = profileNameInput.value.trim();
    console.log(`Save button clicked for profile: ${profileName}`);
    if (profileName !== "") {
      const selectedCategories = Array.from(
        categoriesContainer.querySelectorAll(".active")
      ).map((category) => category.textContent);
      const cat = selectedCategories.join(", ");
      if (cat !== "") {
        const existingProfileIndex = existingProfiles.findIndex(
          (profile) => profile.profileName === profileName
        );
        if (existingProfileIndex !== -1) {
          // Update existing profile categories
          existingProfiles[existingProfileIndex].categories =
            selectedCategories;
          // Update profile element in the DOM
          const profileOptionsContainer = document.getElementById(
            "profile-options-container"
          );
          const existingProfileElement =
            profileOptionsContainer.children[existingProfileIndex];
          existingProfileElement.textContent = profileName;
          console.log(
            `Profile '${profileName}' updated with categories: ${selectedCategories}`
          );
        } else {
          // Create a new profile object
          const newProfile = {
            profileName: profileName,
            categories: selectedCategories,
          };
          // Add the new profile to the existing profiles array
          existingProfiles.push(newProfile);
          // Create a new profile element and append it to the profile options container
          const profileElement = createNewProfileElement(
            profileName,
            selectedCategories
          );
          const profileOptionsContainer = document.getElementById(
            "existing-profiles-div"
          );
          profileOptionsContainer.appendChild(profileElement);
        }
        console.log(existingProfiles);
        showProfileOptions(existingProfiles);
        // Close the overlay
        document.body.removeChild(categoriesOverlay);
      } else {
        alert("Please select at least one category.");
      }
    } else {
      alert("Please enter a profile name.");
    }
  });

  buttonContainer.appendChild(saveButton);
  container.appendChild(buttonContainer);

  categoriesOverlay.appendChild(container);
  document.body.appendChild(categoriesOverlay);
}

function showProfileOptions(existingProfiles) {
  const existingProfileOverlay = document.getElementById("profile-overlay");
  if (existingProfileOverlay) {
    existingProfileOverlay.remove();
  }

  const profileOverlay = document.createElement("div");
  profileOverlay.id = "profile-overlay";
  profileOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(24, 26, 35, 0.4); /* Semi-transparent background */
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
  `;
  const existingProfileContainer = document.getElementById(
    "profile-options-container"
  );
  if (existingProfileContainer) {
    existingProfileContainer.remove();
  }
  const profileOptionsContainer = document.createElement("div");
  profileOptionsContainer.id = "profile-options-container"; // Add an ID for easy access
  profileOptionsContainer.style.cssText = `
      background-color: rgb(24, 26, 35);
      border: 1px solid #000;
      padding: 20px;
      border-radius: 10px; /* Rounded corners */
      width: 300px; /* Fixed width */
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Box shadow */
      font-family: 'Poppins', sans-serif; /* Poppins font */
  `;

  // Create a div for the header
  const headerDiv = document.createElement("div");
  headerDiv.id = "profile header";
  headerDiv.style.cssText = `
      display: flex;
      justify-content: space-between; /* Place items at each end of the container */
      align-items: center; /* Center items vertically */
      margin-bottom: 20px; /* Spacing below header */
  `;

  // Create the header element
  const profileHeading = document.createElement("h2");
  profileHeading.textContent = "Profiles"; /* Updated heading */
  profileHeading.style.cssText = `
      color: #FFF; /* Text color */
      font-size: 20px; /* Font size */
      font-family: 'Poppins', sans-serif; /* Poppins font */
  `;
  headerDiv.appendChild(profileHeading);

  // Create the close symbol
  const closeSymbol = document.createElement("img");
  closeSymbol.src =
    "https://api.iconify.design/ep/close-bold.svg?color=%23595959";
  closeSymbol.style.cssText = `
      width: 20px;
      height: 20px;
      cursor: pointer;
  `;
  closeSymbol.addEventListener("click", () => {
    document.body.removeChild(profileOverlay);
  });

  // Append the close symbol to the header div
  headerDiv.appendChild(closeSymbol);

  // Append the header div to the options container
  profileOptionsContainer.appendChild(headerDiv);

  // Create a div to display existing profiles
  const existingProfilesDiv = document.createElement("div");
  existingProfilesDiv.id = "existing-profiles-div";
  existingProfiles.forEach((profile) => {
    const profileElement = document.createElement("div");
    profileElement.textContent = `${
      profile.profileName
    }: ${profile.categories.join(", ")}`;
    profileElement.style.cssText = `
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          margin-top: 10px;
          cursor: pointer;
          font-family: 'Poppins', sans-serif; /* Poppins font */
          color: white;
      `;
    profileElement.addEventListener("click", () => {
      // Mimic the "Add Profile" interface when clicking on an existing profile
      handleAddProfileClick(profile.profileName, profile.categories);
      console.log(
        ` profile: ${profile.profileName}, and Categories: ${profile.categories}`
      );
    });
    // Append profile element to the profile options container
    // profileOptionsContainer.appendChild(profileElement);
    existingProfilesDiv.appendChild(profileElement);
  });
  profileOptionsContainer.appendChild(existingProfilesDiv);

  // Create the "Add Profile" button
  const addProfileButton = document.createElement("div");
  addProfileButton.id = "new profile id";
  addProfileButton.textContent = "Add Profile";
  addProfileButton.style.cssText = `
      font-size: 16px;
      color: #FF671F; /* Text color */
      cursor: pointer; /* Cursor on hover */
      margin-top: 20px; /* Spacing between options */
      font-family: 'Poppins', sans-serif; /* Poppins font */
  `;
  addProfileButton.addEventListener("click", () => {
    handleAddProfileClick("", []); // Pass empty name and categories array
  });

  // Append the "Add Profile" button to the options container
  profileOptionsContainer.appendChild(addProfileButton);

  // Append the profile options container to the profile overlay
  profileOverlay.appendChild(profileOptionsContainer);

  // Append the profile overlay to the document body
  document.body.appendChild(profileOverlay);
}

// Example usage:
const existingProfiles = [
  { profileName: "p1", categories: ["Alcohol", "Violence", "Intimacy"] },
  { profileName: "p2", categories: ["Partial Nudity", "Nudity", "Intimacy"] },
  { profileName: "p3", categories: ["Alcohol", "Intimacy"] },
  { profileName: "p4", categories: ["Alcohol", "Violence"] },
  {
    profileName: "p5",
    categories: ["Alcohol", "Smoking", "Partial Nudity", "Nudity", "Intimacy"],
  },
  { profileName: "p6", categories: ["Alcohol", "Smoking", "Blood"] },
];

console.log(`At last, uniqueId = ${uniqueId}`);

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
    position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    background-color: #1f2230;
    border-top-left-radius: 14px;
    border-bottom-left-radius: 14px;
    color: white;
    z-index: 9999;
    width: 400px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    font-family: 'Inter', sans-serif;
  `;

  // Function to create a styled button
  function createStyledButton(label) {
    let button = document.createElement("button");
    button.textContent = label;
    button.style.cssText = `
      padding: 10px;
      margin-right: 10px;
      background-color: #ff671f;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s;
    `;
    button.addEventListener("mouseover", () => {
      button.style.backgroundColor = "#e65c1b";
    });
    button.addEventListener("mouseout", () => {
      button.style.backgroundColor = "#ff671f";
    });
    return button;
  }

  // Creating a container div for the header and close symbol
  const headerContainer = document.createElement("div");
  headerContainer.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  CTbox.appendChild(headerContainer);

  // Create the header
  const header = document.createElement("h3");
  header.textContent = "Custom Tag";
  header.style.cssText = `
    text-align: left;
    color: #ff671f;
    font-weight: bold;
    font-size: 18px;
  `;
  headerContainer.appendChild(header);

  // Create the close button
  const closeSymbol = document.createElement("img");
  closeSymbol.src =
    "https://api.iconify.design/ep/close-bold.svg?color=%23595959";
  closeSymbol.style.cssText = `
    width: 20px;
    height: 20px;
    cursor: pointer;
  `;
  closeSymbol.addEventListener("click", () => {
    document.body.removeChild(CTbox);
  });
  headerContainer.appendChild(closeSymbol);

  // Creating inputs
  const inputRow = document.createElement("div");
  inputRow.style.cssText = `
    display: flex;
    justify-content: space-between;
  `;

  const inputStyle = `
    width: 100px;
    height: 30px;
    background-color: rgba(0, 0, 0, 0.5);
    border: 1px solid white;
    color: white;
    padding: 5px;
    margin: 5px;
    border-radius: 5px;
  `;

  const startInput = document.createElement("input");
  startInput.placeholder = "Start";
  startInput.style.cssText = inputStyle;
  inputRow.appendChild(startInput);

  const parentContainer = document.querySelector(".html5-video-container");
  const videoElement = parentContainer.querySelector("video");
  startInput.addEventListener("click", () => {
    const currentTime = Math.round(videoElement.currentTime);
    startInput.value = secondsToHMS(currentTime.toString());
  });

  const endInput = document.createElement("input");
  endInput.placeholder = "End";
  endInput.style.cssText = inputStyle;
  inputRow.appendChild(endInput);

  endInput.addEventListener("click", () => {
    const currentTime = Math.round(videoElement.currentTime);
    endInput.value = secondsToHMS(currentTime.toString());
  });

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Category";
  categoryInput.style.cssText = `
    ${inputStyle}
    width: 150px;
  `;
  inputRow.appendChild(categoryInput);

  CTbox.appendChild(inputRow);

  // Creating a scrollable container for previously added custom tags
  const previousTagsHeader = document.createElement("h4");
  previousTagsHeader.textContent = "Previously Added Custom Tags";
  previousTagsHeader.style.cssText = `
    color: #ff671f;
    margin-bottom: 10px;
  `;
  CTbox.appendChild(previousTagsHeader);

  const scrollableContainer = document.createElement("div");
  scrollableContainer.id = "scrollable-container";
  scrollableContainer.className = "scroll-2";
  scrollableContainer.style.cssText = `
    max-height: 150px;
    overflow-y: scroll;
    overflow-x: hidden;
    width: 100%;
    margin-bottom: 20px;
    padding: 10px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    background-color: #1a1c29;
  `;

  // Loop through existing tags and append them to the scrollable container
  UpdatedtimeRanges.forEach((range) => {
    if (range.type === "customtags") {
      const tagItem = document.createElement("div");
      tagItem.textContent = `${range.category_text} (${range.start_text} - ${range.end_text})`;
      tagItem.style.cssText = `
        padding: 5px;
        color: #ff671f;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      `;
      scrollableContainer.appendChild(tagItem);
    }
  });

  CTbox.appendChild(scrollableContainer);

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
        scenetime_number: sceneTime,
        category_text: categoryValue,
        cs: 100,
      };
      const custom_range_HMS = {
        start_text: secondsToHMS(startText),
        end_text: secondsToHMS(endText),
        scenetime_text: secondsToHMS(sceneTime),
        category_text: categoryValue,
        cs: 100,
        type: "customtags",
      };
      UpdatedtimeRanges.push(custom_range_HMS);

      console.log(`email from custom tag send to backend: ${uniqueId}`);
      chrome.runtime.sendMessage({
        action: "addCustomTag",
        data: custom_range,
        url: window.location.href,
        uniqueId: uniqueId,
      });
      console.log(
        "New time range added to UpdatedtimeRanges:",
        UpdatedtimeRanges
      );
      CTbox.style.display = "none";
      createFloatingBox(
        `Custom tag added: ${categoryValue} (${startText} - ${endText})`
      );
      document.body.removeChild(CTbox);
      showFloatingObject();
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
function createAddTagBox() {
  console.log("Creating Add tag box...");
  let existingBox = document.getElementById("CTbox");
  if (existingBox) {
    console.log("Removing existing custom tag box...");
    existingBox.parentNode.removeChild(existingBox);
  }

  // Create the main container
  const CTbox = document.createElement("div");
  CTbox.id = "CTbox";
  CTbox.style.cssText = `
    position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    background-color: #1f2230;
    border-top-left-radius: 14px;
    border-bottom-left-radius: 14px;
    color: white;
    z-index: 9999;
    width: 400px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    font-family: 'Inter', sans-serif;
  `;

  // Function to create a styled button
  function createStyledButton(label) {
    let button = document.createElement("button");
    button.textContent = label;
    button.style.cssText = `
      padding: 10px;
      margin-right: 10px;
      background-color: #ff671f;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s;
    `;
    button.addEventListener("mouseover", () => {
      button.style.backgroundColor = "#e65c1b";
    });
    button.addEventListener("mouseout", () => {
      button.style.backgroundColor = "#ff671f";
    });
    return button;
  }

  // Creating a container div for the header and close symbol
  const headerContainer = document.createElement("div");
  headerContainer.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  CTbox.appendChild(headerContainer);

  // Create the header
  const header = document.createElement("h3");
  header.textContent = "Custom Tag";
  header.style.cssText = `
    text-align: left;
    color: #ff671f;
    font-weight: bold;
    font-size: 18px;
  `;
  headerContainer.appendChild(header);

  // Create the close button
  const closeSymbol = document.createElement("img");
  closeSymbol.src =
    "https://api.iconify.design/ep/close-bold.svg?color=%23595959";
  closeSymbol.style.cssText = `
    width: 20px;
    height: 20px;
    cursor: pointer;
  `;
  closeSymbol.addEventListener("click", () => {
    document.body.removeChild(CTbox);
  });
  headerContainer.appendChild(closeSymbol);

  // Creating inputs
  const inputRow = document.createElement("div");
  inputRow.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  `;

  const inputStyle = `
    height: 30px;
    background-color: rgba(0, 0, 0, 0.5);
    border: 1px solid white;
    color: white;
    padding: 5px;
    border-radius: 5px;
  `;

  const startInput = document.createElement("input");
  startInput.placeholder = "Start *";
  startInput.style.cssText = inputStyle;
  inputRow.appendChild(startInput);

  const parentContainer = document.querySelector(".html5-video-container");
  const videoElement = parentContainer.querySelector("video");
  startInput.addEventListener("click", () => {
    const currentTime = Math.round(videoElement.currentTime);
    startInput.value = secondsToHMS(currentTime.toString());
  });

  const endInput = document.createElement("input");
  endInput.placeholder = "End *";
  endInput.style.cssText = inputStyle;
  inputRow.appendChild(endInput);

  endInput.addEventListener("click", () => {
    const currentTime = Math.round(videoElement.currentTime);
    endInput.value = secondsToHMS(currentTime.toString());
  });

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Category *";
  categoryInput.style.cssText = `
    ${inputStyle}
    width: 150px;
  `;
  inputRow.appendChild(categoryInput);

  const urlInput = document.createElement("input");
  urlInput.type = "text";
  urlInput.placeholder = "URL *";
  urlInput.style.cssText = `
    ${inputStyle}
    width: 150px;
  `;
  inputRow.appendChild(urlInput);

  const platformSelect = document.createElement("select");
  platformSelect.style.cssText = `
    ${inputStyle}
    width: 150px;
  `;
  const platforms = [
    "Select Platform",
    "Amazon Prime",
    "Jio-Cinema",
    "YouTube",
  ];
  platforms.forEach((platform) => {
    const option = document.createElement("option");
    option.value = platform;
    option.textContent = platform;
    platformSelect.appendChild(option);
  });
  inputRow.appendChild(platformSelect);

  // Additional fields
  const fields = [
    { placeholder: "Title", id: "titleInput" },
    { placeholder: "Type", id: "typeInput" },
    { placeholder: "Genres", id: "genresInput" },
    { placeholder: "Total Time", id: "totalTimeInput" },
    { placeholder: "Info Status", id: "infoStatusInput" },
    { placeholder: "Poster URL", id: "posterUrlInput" },
    { placeholder: "IMDB Rating", id: "imdbRatingInput" },
  ];

  fields.forEach((field) => {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = field.placeholder;
    input.style.cssText = `
      ${inputStyle}
      width: 150px;
    `;
    input.id = field.id;
    inputRow.appendChild(input);
  });

  CTbox.appendChild(inputRow);

  // Creating a scrollable container for previously added custom tags
  const previousTagsHeader = document.createElement("h4");
  previousTagsHeader.textContent = "Previously Added Custom Tags";
  previousTagsHeader.style.cssText = `
    color: #ff671f;
    margin-bottom: 10px;
  `;
  CTbox.appendChild(previousTagsHeader);

  const scrollableContainer = document.createElement("div");
  scrollableContainer.id = "scrollable-container";
  scrollableContainer.className = "scroll-2";
  scrollableContainer.style.cssText = `
    max-height: 150px;
    overflow-y: scroll;
    overflow-x: hidden;
    width: 100%;
    margin-bottom: 20px;
    padding: 10px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    background-color: #1a1c29;
  `;

  // Loop through existing tags and append them to the scrollable container
  UpdatedtimeRanges.forEach((range) => {
    if (range.type === "customtags") {
      const tagItem = document.createElement("div");
      tagItem.textContent = `${range.category_text} (${range.start_text} - ${range.end_text})`;
      tagItem.style.cssText = `
        padding: 5px;
        color: #ff671f;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      `;
      scrollableContainer.appendChild(tagItem);
    }
  });

  CTbox.appendChild(scrollableContainer);

  // Creating the tag button at the bottom right
  const tagButton = createStyledButton("Tag");
  tagButton.style.alignSelf = "flex-end";
  tagButton.addEventListener("click", () => {
    const startValue = timeToSeconds(startInput.value);
    const endValue = timeToSeconds(endInput.value);
    const categoryValue = categoryInput.value;
    const urlValue = urlInput.value;
    const platformValue = platformSelect.value;
    const titleValue = document.getElementById("titleInput").value;
    const typeValue = document.getElementById("typeInput").value;
    const genresValue = document.getElementById("genresInput").value;
    const totalTimeValue = document.getElementById("totalTimeInput").value;
    const infoStatusValue = document.getElementById("infoStatusInput").value;
    const posterUrlValue = document.getElementById("posterUrlInput").value;
    const imdbRatingValue = document.getElementById("imdbRatingInput").value;

    if (
      startValue === "" ||
      endValue === "" ||
      categoryValue === "" ||
      urlValue === "" ||
      platformValue === "Select Platform"
    ) {
      alert(
        "❗Please enter valid values for start, end, category, URL, and platform."
      );
    } else {
      const startText = startValue;
      const endText = endValue;
      const sceneTime = endValue - startValue;
      console.log("Scene Time !!!:", sceneTime);
      const custom_range = {
        start_number: startText,
        end_number: endText,
        scenetime_number: sceneTime,
        category_text: categoryValue,
        url: urlValue,
        platform: platformValue,
        title: titleValue,
        type: typeValue,
        genres: genresValue,
        total_time: totalTimeValue,
        info_status: infoStatusValue,
        poster_url: posterUrlValue,
        imdb_rating: imdbRatingValue,
        cs: 100,
      };
      const custom_range_HMS = {
        start_text: secondsToHMS(startText),
        end_text: secondsToHMS(endText),
        scenetime_text: secondsToHMS(sceneTime),
        category_text: categoryValue,
        cs: 100,
      };

      UpdatedtimeRanges.push(custom_range_HMS);

      console.log(`email from custom tag send to backend: ${uniqueId}`);
      chrome.runtime.sendMessage({
        action: "addNewTag",
        data: {
          start_number: custom_range.start_number,
          end_number: custom_range.end_number,
          scenetime_number: custom_range.scenetime_number,
          url: custom_range.url,
          category_text: custom_range.category_text,
          title: custom_range.title || "", // Optional field
          type: custom_range.type || "", // Optional field
          genres: custom_range.genres || "", // Optional field
          total_time: custom_range.total_time || "", // Optional field
          info_status: custom_range.info_status || "", // Optional field
          poster_url: custom_range.poster_url || "", // Optional field
          imdb_rating: custom_range.imdb_rating || "", // Optional field
          cs: custom_range.cs,
        },
        uniqueId: uniqueId,
      });

      console.log(
        "New time range added to UpdatedtimeRanges:",
        UpdatedtimeRanges
      );
      CTbox.style.display = "none";
      createFloatingBox(
        `Custom tag added: ${categoryValue} (${startText} - ${endText})`
      );
      document.body.removeChild(CTbox);
      showFloatingObject();
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

//for addiing more 
function createAddMoreTagBox() {
  console.log("Creating Add tag box...");
  let existingBox = document.getElementById("CTbox");
  if (existingBox) {
    console.log("Removing existing custom tag box...");
    existingBox.parentNode.removeChild(existingBox);
  }

  // Create the main container
  const CTbox = document.createElement("div");
  CTbox.id = "CTbox";
  CTbox.style.cssText = `
    position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    background-color: #1f2230;
    border-top-left-radius: 14px;
    border-bottom-left-radius: 14px;
    color: white;
    z-index: 9999;
    width: 400px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    font-family: 'Inter', sans-serif;
  `;

  // Function to create a styled button
  function createStyledButton(label, style, onClick) {
    let button = document.createElement("button");
    button.textContent = label;
    button.style.cssText = `
      ${style}
      cursor: pointer;
      transition: background-color 0.3s;
    `;
    button.addEventListener("mouseover", () => {
      button.style.backgroundColor = "#e65c1b";
    });
    button.addEventListener("mouseout", () => {
      button.style.backgroundColor = "#ff671f";
    });
    button.addEventListener("click", onClick);
    return button;
  }

  // Creating a container div for the header and close symbol
  const headerContainer = document.createElement("div");
  headerContainer.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  CTbox.appendChild(headerContainer);

  // Create the header
  const header = document.createElement("h3");
  header.textContent = "Custom Tag";
  header.style.cssText = `
    text-align: left;
    color: #ff671f;
    font-weight: bold;
    font-size: 18px;
  `;
  headerContainer.appendChild(header);

  // Create the close button
  const closeSymbol = document.createElement("img");
  closeSymbol.src =
    "https://api.iconify.design/ep/close-bold.svg?color=%23595959";
  closeSymbol.style.cssText = `
    width: 20px;
    height: 20px;
    cursor: pointer;
  `;
  closeSymbol.addEventListener("click", () => {
    document.body.removeChild(CTbox);
  });
  headerContainer.appendChild(closeSymbol);

  // Creating inputs
  const inputRow = document.createElement("div");
  inputRow.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  `;

  const inputStyle = `
    height: 30px;
    background-color: rgba(0, 0, 0, 0.5);
    border: 1px solid white;
    color: white;
    padding: 5px;
    border-radius: 5px;
  `;

  const startInput = document.createElement("input");
  startInput.placeholder = "Start *";
  startInput.style.cssText = inputStyle;
  inputRow.appendChild(startInput);

  const parentContainer = document.querySelector(".html5-video-container");
  const videoElement = parentContainer.querySelector("video");
  startInput.addEventListener("click", () => {
    const currentTime = Math.round(videoElement.currentTime);
    startInput.value = secondsToHMS(currentTime.toString());
  });

  const endInput = document.createElement("input");
  endInput.placeholder = "End *";
  endInput.style.cssText = inputStyle;
  inputRow.appendChild(endInput);

  endInput.addEventListener("click", () => {
    const currentTime = Math.round(videoElement.currentTime);
    endInput.value = secondsToHMS(currentTime.toString());
  });

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Category *";
  categoryInput.style.cssText = `
    ${inputStyle}
    width: 150px;
  `;
  inputRow.appendChild(categoryInput);

  CTbox.appendChild(inputRow);

  // Creating a separate input field for URL
  const urlInputContainer = document.createElement("div");
  urlInputContainer.style.cssText = `
    margin-top: 10px;
  `;
  const urlInput = document.createElement("input");
  urlInput.type = "text";
  urlInput.placeholder = "URL *";
  urlInput.style.cssText = `
    ${inputStyle}
    width: 100%;
  `;
  urlInputContainer.appendChild(urlInput);
  CTbox.appendChild(urlInputContainer);

  // Creating a container for previously added custom tags
  const tagsContainer = document.createElement("div");
  tagsContainer.id = "tagsContainer";
  tagsContainer.style.cssText = `
    max-height: 150px;
    overflow-y: auto;
    width: 100%;
    margin-bottom: 20px;
    padding: 10px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    background-color: #1a1c29;
  `;
  CTbox.appendChild(tagsContainer);

  // Array to store tags
  let tagsArray = [];

  // Function to create a tag item
  function createTagItem(tag) {
    const tagItem = document.createElement("div");
    tagItem.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px;
      color: #ff671f;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    `;
    tagItem.textContent = `${tag.category_text} (${tag.start_number} - ${tag.end_number})`;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.style.cssText = `
      background-color: #ff4d4d;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      padding: 5px;
      font-size: 12px;
    `;
    deleteButton.addEventListener("click", () => {
      tagsContainer.removeChild(tagItem);
      // Remove the tag from the array
      tagsArray = tagsArray.filter(t => t !== tag);
      console.log(`Updated tags array: ${JSON.stringify(tagsArray)}`);
    });

    tagItem.appendChild(deleteButton);
    tagsContainer.appendChild(tagItem);
  }

  // Function to add a tag
  function addTag() {
    const startValue = timeToSeconds(startInput.value);
    const endValue = timeToSeconds(endInput.value);
    const categoryValue = categoryInput.value;
    const urlValue = urlInput.value;

    if (startValue === "" || endValue === "" || categoryValue === "") {
      alert("❗Please enter valid values for start, end, and category.");
    } else {
      const sceneTime = endValue - startValue;
      const customTag = {
        start_number: startValue,
        end_number: endValue,
        scenetime_number: sceneTime,
        category_text: categoryValue
      };

      tagsArray.push(customTag);
      createTagItem(customTag);

      console.log(`Tags array: ${JSON.stringify(tagsArray)}`);
      // Clear input fields
      startInput.value = "";
      endInput.value = "";
      categoryInput.value = "";
    }
  }

  // Create the "+" button for adding more tags
  const addMoreButton = createStyledButton("+ Add More", `
    padding: 10px;
    background-color: #1f2230;
    // color: #ff671f;
    border: 1px solid #ff671f;
    border-radius: 5px;
  `, addTag);

  CTbox.appendChild(addMoreButton);

  // Create the "Submit" button
  const submitButton = createStyledButton("Submit", `
    padding: 10px;
    background-color: #ff671f;
    color: white;
    border: 1px solid #ff671f;
    border-radius: 5px;
    margin-top: 10px;
  `, () => {
    if (tagsArray.length === 0) {
      alert("❗No tags to submit.");
      return;
    }
    // Send the tags array and URL to backend
    chrome.runtime.sendMessage({
      action: "AddInExisting",
      data: { tags: tagsArray, url: urlInput.value },
      uniqueId: uniqueId, // Ensure uniqueId is defined
    });
    
    alert("Tags submitted successfully!");
    // Optionally close the box after submission
    document.body.removeChild(CTbox);
  });

  CTbox.appendChild(submitButton);

  // Prevent keyboard shortcuts from affecting the input fields
  CTbox.addEventListener("keydown", (event) => {
    event.stopPropagation();
  });

  document.body.appendChild(CTbox);
}






// Function to convert time in seconds to HH:MM:SS format
function secondsToHMS(seconds) {
  let sec = parseInt(seconds, 10); // Convert value to integer
  let hours = Math.floor(sec / 3600); // Get hours
  let minutes = Math.floor((sec - hours * 3600) / 60); // Get minutes
  let secondsLeft = sec - hours * 3600 - minutes * 60; // Get remaining seconds
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secondsLeft.toString().padStart(2, "0")}`;
}

// Function to convert HH:MM:SS format to time in seconds
function timeToSeconds(time) {
  const parts = time.split(":");
  return (
    parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
  );
}

// Inject custom scrollbar styles
const style = document.createElement("style");
style.textContent = `
  .scroll-2::-webkit-scrollbar {
    width: 8px;
  }
  .scroll-2::-webkit-scrollbar-thumb:hover {
    width: 12px;
  }
  .scroll-2::-webkit-scrollbar-track {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  .scroll-2::-webkit-scrollbar-thumb {
    background-color: #FF671F;
    border-radius: 10px;
    transition: width 0.3s;
  }
  .scroll-2 {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.8) rgba(255, 255, 255, 0.1);
  }
`;
document.head.appendChild(style);
