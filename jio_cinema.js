// const { url } = require("inspector");
console.log("Extension started!");

console.log("This is an info message");

// Call the function defined in youtube.js

// import { showFloatingObject } from './floatingBox.js';

// // Variable to store the confidence score
// let confidenceScore = null;
// // Check if there is a value in local storage and assign it to confidenceScore
// const storedValue = localStorage.getItem('confidenceScore');
// if (storedValue !== null) {
//     confidenceScore = parseInt(storedValue); // Convert stored value to integer
// }
// // Listen for messages from popup script
// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//     if (message.confidenceScore !== undefined) {
//         confidenceScore = message.confidenceScore;
//         console.log('Confidence score received in jio cinema content script:', confidenceScore);
//         localStorage.setItem("confidenceScore",confidenceScore)
//         location.reload();
//         // console.log(localStorage.getItem("confidenceScore"))
//     }
// });

let intervalId; // Declare intervalId at the top level to keep it public
let timeRanges = []; // Define an empty array initially
let UpdatedtimeRanges = []; // Define an empty array initially
let filteredTimeRanges = [];
let selectedCategories = [];
let pageTitleElement;

let uniqueId;
let popupWindow;

let watchBtnClass = ".mui-style-13owvbu-btn";
let watchBtn;
let pageTitle;

let currentURL = window.location.href;

let url = window.location.href;

// if(url.includes('https://www.jiocinema.com/tv-shows/house-of-the-dragon/2/a-son-for-a-son/3985636')){
//   console.log("We are House of dragons page")
//   customeHouseofDragons();
// }

const checkifpageloaded = setInterval(() => {
  const pageTitle = document.querySelector(".mui-style-1i6phtd-title");
  const PageLoad = document.readyState === "complete";
  if (PageLoad) {
    clearInterval(checkifpageloaded);
    createFloatingBox("CHOICE is fetching Details...");
    // checkForElementsIfPageLoaded();
    chrome.runtime.sendMessage({ action: "check cookie" });
  } else {
    console.log("Page title not loaded!");
  }
}, 1000);

// chrome.runtime.sendMessage({ action: "check cookie"});

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

function handleShowTitlePopup(request, sender, sendResponse) {
  const pageTitle = request.pageTitle;
  console.log("Ensure this is running only once....⚠️");
  if (pageTitle) {
    // Create a floating box to display the pop-up notification
    createFloatingBox(`✔️ Found "${pageTitle}" in CHOICE Directory!`);
    // Log a message in the console
    console.log(`✅ Found "${pageTitle}" in database!`);

    //   const chooseContent = insertBoxAfterButton("Choose Content");
    //   // Add event listener to the box
    //   chooseContent.addEventListener("click", function() {
    //     showFloatingObject();
    //     chooseContent.style.pointerEvents = "none" ;
    //     // document.getElementById("my-custom-box").addEventListener("click", preventDefaultClick , true);

    // });
  }
}

function handleShowTitleNotFound(request, sender, sendResponse) {
  const pageTitle = request.pageTitle;

  const existingBox = document.getElementById("my-custom-box");
  if (existingBox) {
    console.log("Removing existing box...");
    existingBox.parentNode.removeChild(existingBox);
  }
  // // Check if a table already exists and remove it to avoid duplicate tables.
  // const existingTable = document.getElementById("my-custom-table");
  // if (existingTable) {
  //   console.log("Removing existing Table")
  //   existingTable.remove();
  // }

  // Create a floating box to display the pop-up notification for title not found
  createFloatingBox(`❗️Content "${pageTitle}" not found in directory`);

  // const requestMovie = insertBoxAfterButton("Request Movie"); // commented coz based upon request status further box will be added

  currentURL = window.location.href;
  console.log(
    "We are currently viewing: ",
    pageTitle,
    " and current URL is: ",
    currentURL
  );
  // chrome.runtime.sendMessage({action:"checkrequest", title: pageTitle, url: currentURL});
  // chrome.runtime.sendMessage({
  //   action: "checkrequest",
  //   pageTitle: pageTitle,
  //   currentURL: currentURL,
  //   uniqueId: uniqueId,
  // });

  let watchpageChooseContent;
  if (window.location.href.includes("/watch")) {
    watchpageChooseContent = insertStaticIcon("Choose Content", "watch");
    watchpageChooseContent.addEventListener("click", function () {
      showFloatingObject();
      watchpageChooseContent.style.pointerEvents = "none";
    });
  } else {
    chrome.runtime.sendMessage({
      action: "checkrequest",
      pageTitle: pageTitle,
      currentURL: currentURL,
      uniqueId: uniqueId,
    });
  }

  // requestMovie.addEventListener("click", function() {
  //   // createFloatingBox(`Content "${pageTitle}" Requested! The tags will be available in 2 days.`);

  // // Get the page title from the specific element
  // const pageTitleElement = document.querySelector('.MuiTypography-root.MuiTypography-heading1Black.mui-style-4d5b02-title');
  // const pageTitle = pageTitleElement ? pageTitleElement.textContent : 'Unknown Title';

  // const currentURL = window.location.href; // e.g., "https://www.jiocinema.com/tv-shows/taali/3813489"
  // const segments = currentURL.split("/");  // Split the URL by '/'
  // const content_type = segments[3];      // The segment you want is at index 3

  // console.log(content_type);  // This should log "tv-shows" / "movies"

  // console.log("We are currently viewing: ",pageTitle," and current URL is: ", currentURL );

  // // chrome.runtime.sendMessage({ action: "checkTitleExists", pageTitle });

  // chrome.runtime.sendMessage({ action: "createRequest", title: pageTitle, url: currentURL, type: content_type });

  // });

  // Log a message in the console
  console.log(`Title "${pageTitle}" not found in database❗️`);
}

function handleMessageFromBackground(request, sender, sendResponse) {
  // console.log("We are inside handleMessageFromBackground", request)

  // if (request.action === "showTitlePopup") {
  //   handleShowTitlePopup(request, sender, sendResponse);
  // }else if (request.action === "showTitleNotFound") {
  //   handleShowTitleNotFound(request, sender, sendResponse);
  // }else if (request.action === "already_requested"){
  //   console.log("request.action === already_requested", request)
  //   insertBoxAfterButton("Requested");
  //   const requestMovie = document.getElementById("my-custom-box");
  //   if(requestMovie){
  //     // Change properties of the box
  //     requestMovie.style.background = "rgb(255, 103, 31, 0.3)";  // Set background color to light orange
  //     requestMovie.style.border = "1px solid darkorange";  // Set border color to dark orange
  //     requestMovie.style.cursor = "default";  // Change cursor to default
  //     requestMovie.style.pointerEvents = "none" ;
  //   }

  // }else if (request.action === "new_request"){
  //   console.log("request.action === new_request", request)
  //   // console.log("new request mssg recived")
  //                   //below complete logic will go in else for above new api
  //                     const requestMovie = insertBoxAfterButton("Request Content");
  //                     if(requestMovie){

  //                       requestMovie.addEventListener("click", function() {
  //                         console.log("Request Button is cliked...")

  //                         // Change properties of the box

  //                         requestMovie.textContent = "Requested";
  //                         requestMovie.style.background = "rgb(255, 103, 31, 0.3)";  // Set background color to light orange
  //                         requestMovie.style.border = "1px solid darkorange";  // Set border color to dark orange
  //                         requestMovie.style.cursor = "default";  // Change cursor to default
  //                         requestMovie.style.pointerEvents = "none" ;
  //                         // createFloatingBox(`Content "${pageTitle}" Requested! The tags will be available in 2 days.`);

  //                       // Get the page title from the specific element
  //                       // const pageTitleElement = document.querySelector('.MuiTypography-root.MuiTypography-heading1Black.mui-style-4d5b02-title');
  //                       const pageTitle = pageTitleElement ? pageTitleElement.textContent : 'Unknown Title';

  //                       const currentURL = window.location.href; // e.g., "https://www.jiocinema.com/tv-shows/taali/3813489"
  //                       const segments = currentURL.split("/");  // Split the URL by '/'
  //                       const content_type = segments[3];      // The segment you want is at index 3

  //                       console.log(content_type);  // This should log "tv-shows" / "movies"

  //                       console.log("We are currently viewing: ",pageTitle," and current URL is: ", currentURL );

  //                       // chrome.runtime.sendMessage({ action: "checkTitleExists", pageTitle });

  //                       chrome.runtime.sendMessage({ action: "createRequest", title: pageTitle, url: currentURL, type: content_type, uniqueId: uniqueId });
  //                       });

  //                       // requestMovie.addEventListener("click", function() {
  //                       //   console.log("Request Button is cliked...")

  //                       //   // Change properties of the box

  //                       //   requestMovie.textContent = "Requested";
  //                       //   requestMovie.style.background = "rgb(255, 103, 31, 0.3)";  // Set background color to light orange
  //                       //   requestMovie.style.border = "1px solid darkorange";  // Set border color to dark orange
  //                       //   requestMovie.style.cursor = "default";  // Change cursor to default
  //                       //   requestMovie.style.pointerEvents = "none" ;

  //                       // // Get the page title from the specific element
  //                       // const pageTitleElement = document.querySelector('yt-formatted-string.style-scope.ytd-watch-metadata');
  //                       // const pageTitle = pageTitleElement ? pageTitleElement.textContent : 'Unknown Title';
  //                       // console.log(pageTitle)

  //                       // const currentURL = window.location.href; // e.g., "https://www.jiocinema.com/tv-shows/taali/3813489"
  //                       // const segments = currentURL.split("/");  // Split the URL by '/'
  //                       // const content_type = segments[3];      // The segment you want is at index 3
  //                       // console.log("content_type =",content_type)

  //                       // // console.log(content_type);  // This should log "tv-shows" / "movies"

  //                       // // chrome.runtime.sendMessage({ action: "checkTitleExists", pageTitle

  //                       // // Extract the platform from the URL
  //                       // const url = new URL(currentURL);
  //                       // const platform = url.hostname.split('.')[1]; // Split and take the second part of the hostname
  //                       // console.log("platform =", platform)

  //                       // chrome.runtime.sendMessage({ action: "createRequest", title: pageTitle, url: currentURL, type: content_type, platform: platform });
  //                       // console.log("We are currently viewing: ",pageTitle," and current URL is: ", currentURL, ", pltaform is ", platform );

  //                       // // // Remove the event listener to make the box unclickable
  //                       // // requestMovie.removeEventListener("click", handleClick);

  //                       // });
  //                     }

  // }else if (request.action === "loggedOut"){
  //                     // setTimeout(() => {
  //                       console.log("inside sign in process now......🚦")
  //                       insertBoxAfterButton("Sign In");

  //                       // const elem = document.getElementById("watching-container");
  //                       // elem.style.display = "none";

  //                       // var loginmssg = document.createElement("div");
  //                       // loginmssg.textContent = "Please SignIn to continue";
  //                       // document.getElementById("box-title").appendChild(loginmssg);

  //                       const chooseContentbutton = document.getElementById("my-custom-box");
  //                       chooseContentbutton.textContent = "SignUp";

  //                       console.log("We are till here....✅✅✅✅✅")

  //                       // // Add event listener to the box
  //                       // chooseContentbutton.addEventListener("click", function() {
  //                       //   window.location.href = "https://waitlist.choiceai.in/login_signup";
  //                       // });
  //                       // Add event listener to the sign-up button
  //                       chooseContentbutton.addEventListener("click", function() {
  //                         // Open a pop-up window for sign-in
  //                         popupWindow = window.open("https://waitlist.choiceai.in/version-test/login_signup", "_blank", "width=500,height=500");

  //                         function checkCookie(){

  //                           chrome.runtime.sendMessage({ action: "check cookie"});

  //                           // chrome.cookies.get(
  //                           //   {
  //                           //     // url: "https://waitlist.choiceai.in/movie_list",
  //                           //     url: "https://waitlist.choiceai.in/version-test/movie_list",
  //                           //     name: "username"
  //                           //   },
  //                           //   function (cookie) {

  //                           //     if (cookie) {
  //                           //       // i want to close the popupWindow and then set that cookie value to youtubes cookie with same name usename
  //                           //       // Close the popup window
  //                           //       popupWindow.close();

  //                           //       // Set the cookie value to YouTube's cookie with the same name "username"
  //                           //       chrome.cookies.set({
  //                           //         url: "https://www.youtube.com",
  //                           //         name: "username",
  //                           //         value: cookie.value
  //                           //       });

  //                           //       // Initialize the extension
  //                           //       initializeExtension();

  //                           //     } else {
  //                           //       // keep checking that particular cookie is set or no
  //                           //       // Continue checking the cookie
  //                           //       setTimeout(checkCookie, 1000);
  //                           //     }
  //                           //   }
  //                           // );
  //                           checkCookieInterval = setTimeout(checkCookie, 1000);
  //                           console.log("checkCookie is active still........🔫")
  //                         }

  //                         // Start checking the cookie
  //                         checkCookie();

  //                         // // Poll for the status of the pop-up window
  //                         // const checkPopupStatus = setInterval(function() {
  //                         //     if (popupWindow.closed) {
  //                         //         // Pop-up window closed, refresh the current page
  //                         //         clearInterval(checkPopupStatus);
  //                         //         initializeExtension();
  //                         //     }
  //                         // }, 1000);
  //                     });

  //                     //   console.log("inside cookies");
  //                     //   insertBoxAfterButton("Sign Up");
  //                     //   const chooseContentbutton = document.getElementById("choose-content-btn");
  //                     //   chooseContentbutton.textContent = "SignUp";

  //                     //   // Add event listener to the box
  //                     //   // Add event listener to the "Sign Up" button
  //                     // chooseContentbutton.addEventListener("click", function () {
  //                     //   // Store the current page URL in a message to the background script
  //                     //   chrome.runtime.sendMessage({
  //                     //     action: "store redirect URL",
  //                     //     redirectURL: window.location.href,
  //                     //   });

  //                     //   // Redirect the user to the sign-in page
  //                     //   window.location.href = "https://waitlist.choiceai.in/login_signup";
  //                     // });

  //                     // }, 5000);

  // }else if (request.action === "loggedIn"){
  //                     uniqueId = request.value;

  //                     closePopupWindow();

  //                     function closePopupWindow() {
  //                       if (popupWindow) {
  //                         popupWindow.close();
  //                         clearInterval(checkCookieInterval);
  //                         console.log("Pop-up window closed manually🔔🔔🔔");
  //                         // Additional logic if needed
  //                       }else {
  //                         console.log("Pop-up window is not open. Continuing with the script.");
  //                         // Additional logic to continue the script
  //                       }
  //                     }

  //                     console.log(`We have a logged a user with uniqueId = ${uniqueId}`);
  //                     initializeExtension();
  //                     // Set the cookie with expiration set to a far future date (e.g., 31 Dec 9999)
  //                     var expirationDate = new Date('9999-12-31');
  //                     var expires = "expires=" + expirationDate.toUTCString();

  //                     document.cookie = "choice_user=" + uniqueId + "; " + expires + "; path=/";
  // }else if (request.action === "request_taken") {
  //   const pageTitle = request.title;
  //   createFloatingBox(`Content "${pageTitle}" Requested! The tags will be available in 2 days.`);
  //   console.log("Movie Requested🟩");
  //   sendResponse({status: "Message received"}); // optional
  // }

  switch (request.action) {
    case "showTitlePopup":
      console.log("request.action === showTitlePopup =>", request);
      handleShowTitlePopup(request, sender, sendResponse);
      break;

    case "showTitleNotFound":
      handleShowTitleNotFound(request, sender, sendResponse);
      break;

    case "already_requested":
      console.log("request.action === already_requested", request);
      const requestMovie = insertBoxAfterButton("Requested");

      // const requestMovie = document.getElementById("my-custom-box");
      if (requestMovie) {
        // Change properties of the box
        requestMovie.style.background = "rgb(255, 103, 31, 0.3)"; // Set background color to light orange
        requestMovie.style.border = "1px solid darkorange"; // Set border color to dark orange
        requestMovie.style.cursor = "default"; // Change cursor to default
        requestMovie.style.pointerEvents = "none";
      }
      break;

    case "new_request":
      console.log("request.action === new_request", request);
      // console.log("new request mssg recived")
      //below complete logic will go in else for above new api
      const reqMovie_btn = insertBoxAfterButton("Request Content");
      if (reqMovie_btn) {
        reqMovie_btn.addEventListener("click", function () {
          console.log("Request Button is cliked...");

          // Change properties of the box

          reqMovie_btn.textContent = "Requested";
          reqMovie_btn.style.background = "rgb(255, 103, 31, 0.3)"; // Set background color to light orange
          reqMovie_btn.style.border = "1px solid darkorange"; // Set border color to dark orange
          reqMovie_btn.style.cursor = "default"; // Change cursor to default
          reqMovie_btn.style.pointerEvents = "none";
          // createFloatingBox(`Content "${pageTitle}" Requested! The tags will be available in 2 days.`);

          // Get the page title from the specific element
          // const pageTitleElement = document.querySelector('.MuiTypography-root.MuiTypography-heading1Black.mui-style-4d5b02-title');
          // const pageTitle = pageTitleElement ? pageTitleElement.textContent : 'Unknown Title';

          const pageTitle = request.pageTitle;

          currentURL = window.location.href; // e.g., "https://www.jiocinema.com/tv-shows/taali/3813489"
          const segments = currentURL.split("/"); // Split the URL by '/'
          const content_type = segments[3]; // The segment you want is at index 3

          console.log(content_type); // This should log "tv-shows" / "movies"

          // chrome.runtime.sendMessage({ action: "checkTitleExists", pageTitle });

          chrome.runtime.sendMessage({
            action: "createRequest",
            title: pageTitle,
            url: currentURL,
            type: content_type,
            uniqueId: uniqueId,
            platform: "Jio Cinema",
          });
          console.log(
            "We have requested content name: ",
            pageTitle,
            " and current URL is: ",
            currentURL,
            " type: ",
            content_type,
            " and uniqueId: ",
            uniqueId
          );
        });
      }

      break;

    case "loggedOut":
      // setTimeout(() => {
      console.log("inside sign in process now......🚦");

      if (
        window.location.href.includes("https://www.jiocinema.com/movies/") ||
        (window.location.href.includes("https://www.jiocinema.com/tv-shows/") &&
          isPageLoaded())
      ) {
        insertBoxAfterButton("Sign In");

        const findSignupBtn = setInterval(() => {
          const chooseContentbutton = document.getElementById("my-custom-box");
          if (chooseContentbutton) {
            clearInterval(findSignupBtn);
            chooseContentbutton.textContent = "SignUp";

            console.log(`chooseContentbutton = ${chooseContentbutton}`);
            console.log("We are till here....✅✅✅✅✅ ");

            chooseContentbutton.addEventListener("click", function () {
              // Open a pop-up window for sign-in
              // popupWindow = window.open("https://waitlist.choiceai.in/version-test/login_signup", "_blank", "width=1000,height=1200");
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
                console.log("check signup Cookie is active still........🔫");
              }
              // Start checking the cookie
              checkCookie();
            }); // click funtion ends
          }
        }, 1000);
      } else {
        console.log("Not on movies or tv-shows page");
      }

      // const chooseContentbutton = document.getElementById("my-custom-box");
      // chooseContentbutton.textContent = "SignUp";

      // console.log(`chooseContentbutton = ${chooseContentbutton}`)
      // console.log("We are till here....✅✅✅✅✅ ")

      // chooseContentbutton.addEventListener("click", function() {
      //   // Open a pop-up window for sign-in
      //   popupWindow = window.open("https://waitlist.choiceai.in/version-test/login_signup", "_blank", "width=500,height=500");

      //   function checkCookie(){

      //     chrome.runtime.sendMessage({ action: "check cookie"});

      //     checkCookieInterval = setTimeout(checkCookie, 1000);
      //     console.log("checkCookie is active still........🔫")
      //   }

      //   // Start checking the cookie
      //   checkCookie();
      // }); // click funtion ends

      break;

    case "loggedIn":
      uniqueId = request.value;
      // user_name = request.user_name;
      console.log("We are loggedIn = ", uniqueId);
      // chrome.runtime.sendMessage({ action: "initialize", email: uniqueId });

      closePopupWindow();

      function closePopupWindow() {
        if (popupWindow) {
          popupWindow.close();
          clearInterval(checkCookieInterval);

          createFloatingBox(`You have been LoggedIn!`);
          console.log("Pop-up window closed manually🔔🔔🔔");

          const SignupBtn = document.getElementById("my-custom-box");
          if (SignupBtn.textContent == "SignUp") {
            console.log("Removing existing box...");
            SignupBtn.parentNode.removeChild(SignupBtn);
          }

          // Additional logic if needed
        } else {
          console.log("Pop-up window is not open. Continuing with the script.");
          // Additional logic to continue the script
        }
      }

      // console.log(`We have a logged a user with uniqueId = ${uniqueId} and user name${user_name}`);

      initializeExtension();

      // Set the cookie with expiration set to a far future date (e.g., 31 Dec 9999)
      var expirationDate = new Date("9999-12-31");
      var expires = "expires=" + expirationDate.toUTCString();

      document.cookie = "choice_user=" + uniqueId + "; " + expires + "; path=/";
      break;

    case "request_taken":
      const pageTitle = request.title;
      createFloatingBox(
        `🚀 Content "${pageTitle}" Requested! You will be notified by mail once the tags are available.`
      );
      console.log("Movie Requested🟩");
      sendResponse({ status: "Message received" }); // optional
      break;

    case "sendTimeRanges":
      UpdatedtimeRanges = request.timeRanges; // Update the timeRanges array

      UpdatedtimeRanges.sort(
        (a, b) => timeToSeconds(a.start_text) - timeToSeconds(b.start_text)
      );

      console.log("UpdatedtimeRanges", UpdatedtimeRanges);
      // timeRanges = convertTimeRangesToSeconds(UpdatedtimeRanges);
      console.log("timeRanges (should be empty)", timeRanges);

    case "sendTimeRanges_seconds":
      let timeRanges_s = JSON.parse(request.timeRanges_DB); // Parse the stringified timeRanges
      // console.log(`request.timeRanges: ${JSON.stringify(timeRanges_s)}`);

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
            id: entry._id,
          };
        });

      UpdatedtimeRanges.sort(
        (a, b) => timeToSeconds(a.start_text) - timeToSeconds(b.start_text)
      );

      console.log("UpdatedtimeRanges", UpdatedtimeRanges);
      // timeRanges = convertTimeRangesToSeconds(UpdatedtimeRanges);
      console.log("timeRanges (should be empty)", timeRanges);
      // Insert the table after fetching and processing the time ranges.
      // insertTable();
      // const chooseContent = insertBoxAfterButton("Choose Content");
      // // Add event listener to the box
      // chooseContent.addEventListener("click", function () {
      //   showFloatingObject();
      //   chooseContent.style.pointerEvents = "none";
      //   // document.getElementById("my-custom-box").addEventListener("click", preventDefaultClick , true);
      // });
      let watchpageChooseContent;
      if (window.location.href.includes("/watch")) {
        watchpageChooseContent = insertStaticIcon("Choose Content", "watch");
      } else {
        watchpageChooseContent = insertStaticIcon("Choose Content", "content");
      }
      watchpageChooseContent.addEventListener("click", function () {
        showFloatingObject();
        watchpageChooseContent.style.pointerEvents = "none";
      });

    case "customTagsFound":
      title = request.pageTitle;
      createFloatingBox(`✔️ Custom Tags found!`);
      // Log a message in the console
      console.log(`✅ Custom Tags found!`);
  }
}

chrome.runtime.onMessage.addListener(handleMessageFromBackground);

// Function to initialize the extension
function initializeExtension() {
  console.log("Initializing extension...");

  // Check for elements and insert the box (or any other logic needed to set up the extension)
  checkForElementsIfPageLoaded();

  // Function to check for the video element and start time range checks (done)
  function startVideoChecks() {
    // console.log("startVideoChecks running...")
    if (isPageLoaded()) {
      var video = document.querySelector("video");
      // console.log("startVideoChecks running and PageLoaded...", video)
      if ((window.location.href.includes("/watch") && video) == false) {
        // If either of them is false, the condition evaluates to true
        console.log("Could not find Video and clearing time range checks...");
        clearInterval(videoCheckInterval); // Stop checking for the video
        clearInterval(intervalId); // Stop checking for the video
      }
    }
  }

  // Set an interval to check for the video element every 500 milliseconds
  const videoCheckInterval = setInterval(startVideoChecks, 1000);
}

// const interval = setTimeout(() => {
//   const name = document.getElementsByClassName(".player-timedtext-text-container")

//   if(name){
//     clearTimeout(interval);
//     print(name)
//   }
// }, 5000);
// Function to check for slug changes
// function checkSlugChange() {
//   console.log("Checking for Slug change...");
//   // console.log(`conf score: ${confidenceScore}`)
//   const newSlug = window.location.pathname;
//   if (currentSlug !== newSlug) {
//     console.log(`Slug changed from ${currentSlug} to ${newSlug}, reinitializing extension...`);
//     currentSlug = newSlug;

//     popupWindow = null;
//     clearInterval(watchBtn);
//     clearInterval(intervalId);

//     const existingBox = document.getElementById("my-custom-box");
//     if (existingBox) {
//       console.log("Removing existing box...");
//       existingBox.parentNode.removeChild(existingBox);
//     }
//     // Function to check for the video element and start time range checks
//     function startVideoChecks() {
//       if(isPageLoaded()){
//         var video = document.querySelector('video');
//         if ((window.location.href.includes('/watch') || video)== false) { // changed condition from a && to ||
//           console.log("Could not find Video and clearing time range checks...");
//           clearInterval(videoCheckInterval); // Stop checking for the video
//           clearInterval(intervalId); // Stop checking for the video
//         }
//       }
//     }
//     const videoCheckInterval = setInterval(startVideoChecks, 1000);
//     // hide the floating box on slug change

//     const floatingBox = document.getElementById("floating-box");
//     if (floatingBox) {
//       floatingBox.style.display = 'none';
//       console.log("Floating Box Removed");
//     }
//     const remove = document.getElementById("floating-obj");
//     if (remove) remove.style.display = "none";

//     console.log("about to begin intialise extension")
//     // Reinitialize the extension
//     initializeExtension();
//     console.log("about to begin intialise extension by checking cookie");

//     chrome.runtime.sendMessage({ action: "check cookie" });
//   }
// }

// // Set an interval to check for slug changes every second
// let currentSlug = window.location.pathname;
// console.log("Setting interval to check for slug changes...");
// const slugCheckIntervalId = setInterval(checkSlugChange, 1000);

let choiceUserCookie;
function getCookie(name) {
  let cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    // Check if this cookie's name matches the desired name
    if (cookie.startsWith(name + "=")) {
      return cookie.substring(name.length + 1);
    }
  }
  return null; // Return null if the cookie is not found
}

window.navigation.addEventListener("navigate", (event) => {
  console.log(`Navigated from ${url} to ${event.destination.url}`);
  url = event.destination.url;

  if (!url.includes("/watch")) {
    timeRanges = []; // Define an empty array initially
    UpdatedtimeRanges = []; // Define an empty array initially
    filteredTimeRanges = [];
    selectedCategories = [];
    option = [];
    createFloatingBox("CHOICE is fetching Details...");
  }
  // console.log(`Navigated to ${event.destination.url}`);
  popupWindow = null;
  if (watchBtn) clearInterval(watchBtn);
  // clearInterval(intervalId);
  let existingBoxx = document.getElementById("CTbox");
  if (existingBoxx) {
    console.log("Removing existing custom tag box...");
    existingBoxx.parentNode.removeChild(existingBoxx);
  }

  const existingBox = document.getElementById("my-custom-box");
  if (existingBox) {
    console.log("Removing existing box...");
    existingBox.parentNode.removeChild(existingBox);
  }
  const existingIcon = document.getElementById("my-static-icon");
  if (existingIcon) {
    console.log(
      "Removing existing icon with text...: ",
      existingIcon.textContent
    );
    existingIcon.parentNode.removeChild(existingIcon);
  }
  // Function to check for the video element and start time range checks
  function startVideoChecks() {
    if (isPageLoaded()) {
      var video = document.querySelector("video");
      if ((window.location.href.includes("/watch") || video) == false) {
        // changed condition from a && to ||
        console.log("Could not find Video and clearing time range checks...");
        clearInterval(videoCheckInterval); // Stop checking for the video
        clearInterval(intervalId); // Stop checking for the video
      }
    }
  }
  const videoCheckInterval = setInterval(startVideoChecks, 1000);
  // hide the floating box on slug change

  const floatingBox = document.getElementById("floating-box");

  if (floatingBox) {
    floatingBox.style.display = "none";
    console.log("Floating Box Removed");
  }
  const remove = document.getElementById("floating-obj");
  if (remove) {
    console.log("remove", remove);
    remove.style.display = "none";
    console.log("Floating Object Removed");
  } else {
    console.log("Floating Object not found ⚠️⚠️⚠️⚠️ !!!");
  }
  // Reinitialize the extension
  // initializeExtension();
  choiceUserCookie = getCookie("choice_user");
  uniqueId = choiceUserCookie;
  if (choiceUserCookie) {
    console.log("uniqueId", uniqueId);
    initializeExtension();
  } else {
    console.log("about to begin intialise extension by checking cookie");

    chrome.runtime.sendMessage({ action: "check cookie" });
  }
});

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {// request.action === "sendTimeRanges
//   if (request.action === "sendTimeRanges") {
//     UpdatedtimeRanges = request.timeRanges; // Update the timeRanges array

//     UpdatedtimeRanges.sort((a, b) => timeToSeconds(a.start_text) - timeToSeconds(b.start_text));

//     console.log("UpdatedtimeRanges",UpdatedtimeRanges);
//     // timeRanges = convertTimeRangesToSeconds(UpdatedtimeRanges);
//     console.log("timeRanges (should be empty)", timeRanges);
//     // Insert the table after fetching and processing the time ranges.
//     // insertTable();
//   }else if (request.action === "sendTimeRanges_seconds") {
//     let timeRanges_s = JSON.parse(request.timeRanges_DB); // Parse the stringified timeRanges
//     console.log(`request.timeRanges: ${JSON.stringify(timeRanges_s)}`);

//     UpdatedtimeRanges = timeRanges_s
//     // .filter(entry => entry.cs >= confidenceScore)
//     .map(entry => {
//         return {
//             start_text: secondsToHMS(entry.start_text),
//             end_text: secondsToHMS(entry.end_text),
//             scenetime_text: secondsToHMS(entry.scenetime_text),
//             category_text: entry.category_text,
//             cs: entry.cs !== undefined ? entry.cs : 100
//         };
//     });

//     UpdatedtimeRanges.sort((a, b) => timeToSeconds(a.start_text) - timeToSeconds(b.start_text));

//     console.log("UpdatedtimeRanges", UpdatedtimeRanges);
//     // timeRanges = convertTimeRangesToSeconds(UpdatedtimeRanges);
//     console.log("timeRanges (should be empty)", timeRanges);
//     // Insert the table after fetching and processing the time ranges.
//     // insertTable();
//     const chooseContent = insertBoxAfterButton("Choose Content");
//     // Add event listener to the box
//     chooseContent.addEventListener("click", function() {
//       showFloatingObject();
//       chooseContent.style.pointerEvents = "none" ;
//       // document.getElementById("my-custom-box").addEventListener("click", preventDefaultClick , true);

//     });

//   }
// });
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //request.action === "checking"
  if (request.action === "checking") {
    mssg = request.mssg;
    console.log("Check mssg:", mssg);
  }
});

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

function toggleVideo() {
  var video = document.querySelector("video");
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

// Listen for the message to update timeRanges ( try with maintaining a different array)
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

function isPageLoaded() {
  // const loadingIndicator = document.querySelector('.loading-indicator'); // Replace with the actual loading indicator element
  // return loadingIndicator === null; // If loading indicator is not found, page is loaded

  return document.readyState === "complete";
}
