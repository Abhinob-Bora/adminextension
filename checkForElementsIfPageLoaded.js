// Function to check for elements when the page is fully loaded
function checkForElementsIfPageLoaded() {
  // console.log("Checking for PageLoad Status...");
  // console.log("!window.location.href.includes('/watch') = ", !window.location.href.includes('/watch'));
  let pageLoadInterval = setInterval(function () {
    if (document.readyState === "complete") {
      console.log("Page is fully loaded");
      clearInterval(pageLoadInterval);
      // Check for elements
      if (
        (window.location.href.includes("https://www.jiocinema.com/movies/") ||
          window.location.href.includes(
            "https://www.jiocinema.com/tv-shows/"
          )) &&
        !window.location.href.includes("/watch")
      ) {
        // console.log("Page Loaded and now checkElement Running!");
        let flag_load = false;
        // Clear the interval only if it is already defined
        if (typeof watchBtn !== "undefined") {
          clearInterval(watchBtn);
        }
        watchBtn = setInterval(() => {
          // console.log(`watchBtnClass 💀 = ${watchBtnClass}`);
          const buttonElement = document.querySelector(watchBtnClass);

          if (buttonElement && buttonElement.textContent && !flag_load) {
            // console.log(`Flag before true = ${flag_load}`);
            flag_load = true;
            // console.log(`Flag after true = ${flag_load}`);

            clearInterval(watchBtn);
            // console.log('Interval cleared');

            // pageTitleElement = document.querySelector('.mui-style-1i6phtd-title');
            pageTitleElement = document.querySelector(title_class);
            pageTitle = pageTitleElement
              ? pageTitleElement.textContent
              : "Unknown Title";
            // console.log("pageTitle: ", pageTitle);
            // console.log("Watch Btn visible (watch): ", buttonElement.textContent);

            currentURL = window.location.href;
            // Display the URL
            // console.log(currentURL);

            // chrome.runtime.sendMessage({ action: "checkTitleExists", pageTitle: pageTitle, platform: "Jio Cinema", url: currentURL });
            chrome.runtime.sendMessage({
              action: "checkTitleExists",
              pageTitle: pageTitle,
              platform: "Jio Cinema",
              url: currentURL,
              uniqueId: uniqueId,
            });
            // console.log("Message sent to background script");
          } else {
            console.log(`watchBtnClass not found💀 = ${watchBtnClass}`);
          }
        }, 1000);

        /*
        const buttonElement = document.querySelector(watchBtnClass);
        // console.log(buttonElement);
        if (buttonElement) {
          // Get the page title from the specific element
          // const pageTitleElement = document.querySelector('.MuiTypography-root.MuiTypography-heading1Black.mui-style-4d5b02-title');
          pageTitleElement = document.querySelector('.mui-style-1i6phtd-title');
          const pageTitle = pageTitleElement ? pageTitleElement.textContent : 'Unknown Title';
          console.log(pageTitle);
          chrome.runtime.sendMessage({ action: "checkTitleExists", pageTitle:pageTitle, platform: "Jio Cinema" });
     
          // chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { // request.action === "showTitlePopup
          //   if (request.action === "showTitlePopup") {
          //     const pageTitle = request.pageTitle;
          //     console.log("Ensure this is running only once....⚠️")
          //     if(pageTitle){
          //       // Create a floating box to display the pop-up notification
          //       createFloatingBox(`✔️ Found "${pageTitle}" in database!`);
          //       // Log a message in the console
          //       console.log(`✅ Found "${pageTitle}" in database!`);
                
          //       const chooseContent = insertBoxAfterButton("Choose Content");
          //       // Add event listener to the box
          //       chooseContent.addEventListener("click", function() {
          //         showFloatingObject();
          //         chooseContent.style.pointerEvents = "none" ;
          //         // document.getElementById("my-custom-box").addEventListener("click", preventDefaultClick , true);
     
          //     });
     
          //     }
          //   }
          //   if (request.action === "showTitleNotFound") {
          //     const pageTitle = request.pageTitle;
              
          //     const existingBox = document.getElementById("my-custom-box");
          //     if (existingBox) {
          //       console.log("Removing existing box...");
          //       existingBox.parentNode.removeChild(existingBox);
          //     }
          //     // Check if a table already exists and remove it to avoid duplicate tables.
          //     const existingTable = document.getElementById("my-custom-table");
          //     if (existingTable) {
          //       console.log("Removing existing Table")
          //       existingTable.remove();
          //     }
     
          //     // Create a floating box to display the pop-up notification for title not found
          //     createFloatingBox(`❗️Content "${pageTitle}" not found in database`);
          //     const requestMovie = insertBoxAfterButton("Request Movie");
          //     // requestMovie.id = "request-movie";
          //     // Add event listener to the box
          //     requestMovie.addEventListener("click", function() {
          //       // createFloatingBox(`Content "${pageTitle}" Requested! The tags will be available in 2 days.`);
     
          //     // Get the page title from the specific element
          //     const pageTitleElement = document.querySelector('.MuiTypography-root.MuiTypography-heading1Black.mui-style-4d5b02-title');
          //     const pageTitle = pageTitleElement ? pageTitleElement.textContent : 'Unknown Title';
              
          //     const currentURL = window.location.href; // e.g., "https://www.jiocinema.com/tv-shows/taali/3813489"
          //     const segments = currentURL.split("/");  // Split the URL by '/'
          //     const content_type = segments[3];      // The segment you want is at index 3
     
          //     console.log(content_type);  // This should log "tv-shows" / "movies"
     
     
          //     console.log("We are currently viewing: ",pageTitle," and current URL is: ", currentURL );
     
          //     // chrome.runtime.sendMessage({ action: "checkTitleExists", pageTitle });
     
              
          //     chrome.runtime.sendMessage({ action: "createRequest", title: pageTitle, url: currentURL, type: content_type });
     
              
     
          //     });
          
          //     // Log a message in the console
          //     console.log(`Title "${pageTitle}" not found in database❗️`);
          //   }
          
          // });
          
          // Required elements are available, call insertBoxAfterButton to create and insert the box
         
          // Clear the interval
          // clearInterval(intervalId);
          
        } else {
            // Required elements are not yet available, set up MutationObserver to watch for changes
            console.log("Button Not Found");
            const observer = new MutationObserver(checkForElements);
            observer.observe(document.body, { childList: true, subtree: true });
        }
        */
      } else if (window.location.href.includes("/watch")) {
        console.log("We are on the Watch Page");
        // const custom = insertBoxAfterButton("Choose Tags");
        // custom.style.marginTop = "0px";
        // custom.addEventListener("click", function() {
        //   showFloatingObject();
        //   custom.style.pointerEvents = "none" ;
        //   // document.getElementById("my-custom-box").addEventListener("click", preventDefaultClick , true);

        // });
        chrome.runtime.sendMessage({
          action: "checkTitleExists",
          pageTitle: pageTitle,
          platform: "Jio Cinema",
          url: currentURL,
          uniqueId: uniqueId,
        });
      } else {
        console.log("Required Movie Page not Loaded");
      }
    }
  }, 1000);
}

/*

title: .MuiGrid-root.mui-style-rfnosa



*/
