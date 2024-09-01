// const { ClientGrantsManager } = require("auth0");

// let clientId = "coZ2YWEL8XgydmNgGBJmOLaEUxGOPhP0";
// let clientSecret =
//   "xVnCTrySZkWydsHT3yBGRQVv1G0WrtiKFV6BfVRHc4emCumpz4DP43KF_nyTLtdl";
// let domain = "dev-24w10ir1yq8c7mpk.us.auth0.com";
// let audience = "http://127.0.0.1:5000";
let platform;

const req_api = "https://waitlist.choiceai.in/api/1.1/obj/requests";
const ct_api = "https://waitlist.choiceai.in/api/1.1/obj/custom_tags";
const ck_req_api = `https://waitlist.choiceai.in/api/1.1/obj/requests`;
const error_api = "https://waitlist.choiceai.in/api/1.1/obj/error_reports";
const timestamps_url = `https://waitlist.choiceai.in/api/1.1/obj/timestamps`;
const fb_api = "https://waitlist.choiceai.in/api/1.1/obj/feedbacks";
const customtags_url = `https://waitlist.choiceai.in/api/1.1/obj/custom_tags`;
import "./module2.js";

// checked with dotenv:
// const req_api = process.env.REQ_API;
// const ct_api = process.env.CT_API;
// const ck_req_api = process.env.CK_REQ_API;
// const error_api = process.env.ERROR_API;
// const timestamps_url = process.env.TIMESTAMPS_URL;
// const fb_api = process.env.FB_API;
// const customtags_url = process.env.CUSTOMTAGS_URL;

// const apiUrl_mongo = process.env.APIURL_MONGO;
// const apiUrl_second = process.env.APIURL_SECOND;

// const req_api = "https://waitlist.choiceai.in/api/1.1/obj/requests";
// const ct_api = "https://waitlist.choiceai.in/api/1.1/obj/custom_tags";
// const ck_req_api = `https://waitlist.choiceai.in/api/1.1/obj/requests`;
// const error_api = "https://waitlist.choiceai.in/api/1.1/obj/error_reports";
// const timestamps_url = `https://waitlist.choiceai.in/api/1.1/obj/timestamps`;
// const fb_api = "https://waitlist.choiceai.in/api/1.1/obj/feedbacks";
// const customtags_url = `https://waitlist.choiceai.in/api/1.1/obj/custom_tags`;

// const apiUrl_mongo = `https://choice-mgva.onrender.com/api/listOfMovies/getListOfMovies`;
// const apiUrl_second = `https://choice-mgva.onrender.com/api/contentData/getContentData`;

// async function getToken(clientId, clientSecret, audience) {
//   // domain = "dev-24w10ir1yq8c7mpk.us.auth0.com";
//   try {
//     const response = await fetch(`https://${domain}/oauth/token`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         grant_type: "client_credentials",
//         client_id: clientId,
//         client_secret: clientSecret,
//         audience: audience,
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(
//         `Failed to obtain access token: ${
//           errorData.error_description || response.statusText
//         }`
//       );
//     }

//     const data = await response.json();
//     return data.access_token;
//   } catch (error) {
//     throw new Error("Failed to obtain access token.");
//   }
// }

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: "https://waitlist.choiceai.in/" });
  }
});
let unique_id;
let token;
let tokenExpiry;

async function initialize(unique_id) {
  console.log("Initializing token for user:", unique_id);
  // Retrieve token and expiry time from cookies
  chrome.cookies.get(
    { url: "https://www.jiocinema.com/", name: "accessToken" },
    async function (cookie) {
      token = cookie ? cookie.value : null;

      chrome.cookies.get(
        { url: "https://www.jiocinema.com/", name: "tokenExpiry" },
        // if(tokenExpiry){console.log("Token Expiry:", tokenExpiry)}
        function (expiryCookie) {
          tokenExpiry = expiryCookie ? parseInt(expiryCookie.value) : null;

          if (token && tokenExpiry && isTokenExpiringSoon(tokenExpiry)) {
            refreshToken(unique_id);
          } else if (!token) {
            console.log("Token not found in cookies. Generating new token...");
            generateAndStoreToken(unique_id);
          } else {
            console.log("Token found in cookies:", token);
          }
        }
      );
    }
  );
}

function isTokenExpiringSoon(expiry) {
  const fiveMinutesFromNow = Date.now() / 1000 + 5 * 60;
  return expiry <= fiveMinutesFromNow;
}

async function refreshToken(unique_id) {
  try {
    token = await getToken(unique_id);
    console.log("Token refreshed:", token);

    // Store refreshed token and new expiry time in cookies
    chrome.cookies.set({
      url: "https://www.jiocinema.com/",
      name: "accessToken",
      value: token,
      expirationDate: Date.now() / 1000 + 60 * 60 * 23 * 1, // 7 days expiry
    });

    chrome.cookies.set({
      url: "https://www.jiocinema.com/",
      name: "tokenExpiry",
      value: (Date.now() / 1000 + 60 * 60 * 23 * 1).toString(), // 7 days expiry
    });
  } catch (error) {
    console.error("Failed to refresh token:", error.message);
  }
}

async function generateAndStoreToken(unique_id) {
  try {
    token = await getToken(unique_id);
    console.log("New token generated:", token);

    // Store token and expiry time in cookies
    chrome.cookies.set({
      url: "https://www.jiocinema.com/",
      name: "accessToken",
      value: token,
      expirationDate: Date.now() / 1000 + 60 * 60 * 24 * 1, // 7 days expiry
    });

    chrome.cookies.set({
      url: "https://www.jiocinema.com/",
      name: "tokenExpiry",
      value: (Date.now() / 1000 + 60 * 60 * 24 * 1).toString(), // 7 days expiry
    });
  } catch (error) {
    console.error("Failed to generate or save token:", error.message);
  }
}

// Example getToken function (replace with your actual implementation)
async function getToken(email) {
  // const backendUrl = "https://choice-mgva.onrender.com" ; // Replace with your backend URL
  const backendUrl = "http://localhost:5000"; // Replace with your backend URL
  try {
    const response = await fetch(`${backendUrl}/get-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to obtain access token: ${
          errorData.error || response.statusText
        }`
      );
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Token generation error:", error.message);
    throw error;
  }
}

// Example usage
// initialize(unique_id);

let email;
// let timeRanges = [];

// Inject content scripts when action is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js", "youtube.js"], // Inject both scripts
  });
});

// Execute script on JioCinema page load
chrome.runtime.onInstalled.addListener(() => {
  const onDOMContentLoaded = chrome.webNavigation?.onDOMContentLoaded;
  if (!onDOMContentLoaded) {
    // Optional chaining for null safety
    console.error("chrome.webNavigation.onDOMContentLoaded is not available");
    return;
  }
  chrome.webNavigation.onDOMContentLoaded.addListener(async (details) => {
    if (
      details &&
      details.url &&
      details.tabId &&
      details.url.startsWith("https://www.jiocinema.com/")
    ) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: details.tabId },
          func: () => console.log("jiocinema.js is executing"),
        });
      } catch (error) {
        console.error("Error executing script:", error);
      }
    }
  });
});

chrome.runtime.onInstalled.addListener(() => {
  if (chrome.webNavigation && chrome.webNavigation.onDOMContentLoaded) {
    chrome.webNavigation.onDOMContentLoaded.addListener((details) => {
      if (details.url.startsWith("https://www.jiocinema.com/")) {
        console.log("JioCinema page loaded");

        // Define the function to execute on the page
        const functionToExecute = () => {
          console.log("jiocinema.js is executing");
        };

        // Execute the function on the page
        chrome.scripting.executeScript(
          {
            target: { tabId: details.tabId },
            func: functionToExecute,
          },
          () => {
            console.log("Script executed");
          }
        );
      }
    });
  } else {
    console.error("chrome.webNavigation.onDOMContentLoaded is not available");
  }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  // const tabId  = sender.tab.id;
  // console.log("tabId", tabId);
  let tabId;
  switch (request.action) {
    case "check cookie":
      await handleCheckCookie(request, sender, tabId);
      break;
    case "check signup":
      await handleCheckSignup(request, sender, tabId);
      break;
    case "checkTitleExists":
      await handleCheckTitleExists(request, tabId, sender);
      break;
    case "createRequest":
      await createRequest(request, sender, tabId);
      break;
    case "addCustomTag":
      await addCustomTag(request, sender, sendResponse);
      break;
    case "addNewTag":
        await addNewTag(request, sender, sendResponse);
        break;
    case "AddInExisting":
      await AddInExisting(request, sender, sendResponse);
      break;
    case "checkrequest":
      await checkrequest(request, sender, sendResponse);
      break;
    case "report_error":
      await report_error(request, sender, sendResponse);
      break;
    case "timestamps":
      await timestamps(request, sender, sendResponse);
      break;
    case "sendFeedback":
      await sendFeedback(request, sender, sendResponse);
      break;
    case "initialize":
      unique_id = request.email;
      initialize(unique_id);
    // default:
    //   console.error(`Unknown action: ${request.action}`);
  }
});
async function clearCookies() {
  await new Promise((resolve) => {
    chrome.cookies.remove(
      { url: "https://www.jiocinema.com", name: "accessToken" },
      function (details) {
        console.log("accessToken cookie removed", details);
        resolve();
      }
    );
  });

  await new Promise((resolve) => {
    chrome.cookies.remove(
      { url: "https://www.jiocinema.com", name: "tokenExpiry" },
      function (details) {
        console.log("tokenExpiry cookie removed", details);
        resolve();
      }
    );
  });
}

async function handleCheckCookie(request, sender, tabId) {
  chrome.tabs.sendMessage(sender.tab.id, {
    action: "checking",
    mssg: "cheking cookies.........",
  });
  let loggedInFlag = false;

  // Use chrome.cookies.get with a callback function
  chrome.cookies.get(
    {
      // url: "https://waitlist.choiceai.in/movie_list",
      url: "https://waitlist.choiceai.in/movie_list",
      name: "username",
    },
    function (cookie) {
      if (loggedInFlag == false) {
        if (cookie) {
          // chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: "cookie found by checking cookie........." });
          loggedInFlag = true;
          console.log(`loggedInFlag = ${loggedInFlag}`);
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "loggedIn",
            value: cookie.value,
          });
          unique_id = cookie.value;
          console.log("unique_id", unique_id);
          initialize(unique_id);
        } else {
          chrome.tabs.sendMessage(sender.tab.id, { action: "loggedOut" });
        }
      }
    }
  );
}

async function handleCheckSignup(request, sender, tabId) {
  let loggedInFlag = false;
  // Use chrome.cookies.get with a callback function
  chrome.cookies.get(
    {
      // url: "https://waitlist.choiceai.in/movie_list",
      url: "https://waitlist.choiceai.in/movie_list",

      name: "username",
    },
    function (cookie) {
      if (loggedInFlag == false) {
        if (cookie) {
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "checking",
            mssg: "cookie found by check signup loop.........",
          });
          loggedInFlag = true;
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "loggedIn",
            value: cookie.value,
          });
          unique_id = cookie.value;
          console.log("unique_id", unique_id);
          initialize(unique_id);
        } else {
          // Call this function when the user logs out
          async function logout() {
            await clearCookies();
            // Implement your logout logic, e.g., redirect to the login page
            console.log("User logged out and cookies cleared.");
          }
          logout();
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "checking",
            mssg: "signup cookie not found 💀💀💀.....",
          });
        }
      }
    }
  );
}

async function createRequest(request, sender, tabId, sendResponse) {
  const inputString = request.title;
  const currentURL = request.url;
  const type = request.type;
  const platform = request.platform;
  const user = request.uniqueId;

  const movieId = ((match) =>
    match ? match[1] : "Movie ID not found in the URL.")(
    currentURL.match(/\/(\d+)$/)
  );
  console.log(movieId);

  function replaceSpecialCharacters(inputString) {
    // Define a regular expression to match special characters
    var specialCharactersRegex = /[!@#$%^&*()_+{}\[\]:;<>,.|?~\\/-]/g;

    // Replace special characters with underscores
    var resultString = inputString.replace(specialCharactersRegex, "_");

    return resultString;
  }

  // var inputString = "Hello! This is a @sample string with special characters.";
  var pageTitle = replaceSpecialCharacters(inputString);

  const requestData = {
    content_name_text: pageTitle,
    platform_text: platform,
    url_text: currentURL,
    type_text: type,
    requested_by_text: user,
    vcode2_text: movieId,
    // "requested_by_text": uniqueId
  };

  // const apiUrl = "https://choice-94121.bubbleapps.io/version-test/api/1.1/obj/requests";
  // const apiUrl = "https://waitlist.choiceai.in/api/1.1/obj/requests";
  // const req_api = "https://waitlist.choiceai.in/version-test/api/1.1/obj/requests";

  fetch(req_api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add authorization header if required
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Data added successfully:", data);
      // You might want to send a response back to the content script or show a notification
      // chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: data });
      chrome.tabs.sendMessage(sender.tab.id, {
        action: "request_taken",
        title: pageTitle,
        url: currentURL,
        type: type,
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

let customUrl;

let cursor = 0;
const pageSize = 100;

async function addCustomTag(request, sender, sendResponse) {
  console.log("Request received to add custom tag:", request.data);

  unique_id = request.uniqueId;
  console.log("email rcved in backend from custom tag fetch req:", unique_id);

  const requestData = {
    start_number: request.data.start_number,
    end_number: request.data.end_number,
    scenetime_number: request.data.scenetime_number,
    email_text: unique_id,
    url_text: request.url,
    category_text: request.data.category_text,
    conf_number: request.data.cs,
  };
  console.log("Request Data to be sent:", requestData);
  // const ct_api = "https://waitlist.choiceai.in/version-test/api/1.1/obj/custom_tags"
  fetch(ct_api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Data added successfully:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  sendResponse({ success: true });
}
async function addNewTag(request, sender, sendResponse) {
  console.log("token in add new tags", token);
  console.log("Request received to add custom tag:", request.data);

  const unique_id = request.uniqueId;
  console.log("Email received in backend from custom tag fetch request:", unique_id);

  // Prepare the request data with all the fields
  const requestData = {
    start_number: request.data.start_number,
    end_number: request.data.end_number,
    scenetime_number: request.data.scenetime_number,
    email_text: unique_id,
    url_text: request.data.url,
    category_text: request.data.category_text,
    title: request.data.title || "", // Optional field
    type: request.data.type || "", // Optional field
    genres: request.data.genres || [], // Changed to empty array if no genres
    total_time: request.data.total_time || 0, // Changed to 0 if no total_time
    info_status: request.data.info_status || "", // Optional field
    poster_url: request.data.poster_url || "", // Optional field
    imdb_rating: request.data.imdb_rating || 0, // Changed to 0 if no imdb_rating
    conf_number: request.data.cs,
  };

  console.log("Request Data to be sent:", requestData);

  try {
    const response = await fetch("http://localhost:5000/api/addingnewtags/untagged", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Data added successfully:", data);
    sendResponse({ success: true });
  } catch (error) {
    console.error("Error:", error);
    sendResponse({ success: false, error: error.message });
  }
}
async function AddInExisting(request, sender, sendResponse) {
  const uniqueId = request.uniqueId;
  const url = request.data.url;
  const tagsArray = request.data.tags; // Array of tags from the UI
  console.log("Email received in backend from custom tag fetch request:", uniqueId);
  console.log("Token in add new tags:", token);

  // Validation
  if (!url || !Array.isArray(tagsArray) || tagsArray.length === 0) {
    console.error("Please enter a URL and add at least one tag.");
    sendResponse({ success: false, error: "Please enter a URL and add at least one tag." });
    return;
  }

  // Transform tags into the required format
  const newlyAddedTsArray = tagsArray.map(tag => ({
    start: tag.start_number,
    end: tag.end_number,
    scenetime: tag.scenetime_number,
    category: tag.category_text,
    confidence: 100
  }));

  try {
    const response = await fetch("http://localhost:5000/api/addingnewtags/tagged", {
      method: "POST", // POST is used for creating new entries
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Authorization header should be part of headers
      },
      body: JSON.stringify({
        url,
        newlyAddedTsArray
      })
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(`HTTP error! Status: ${response.status}, Details: ${JSON.stringify(errorDetails)}`);
    }

    const data = await response.json();
    console.log("Tags submitted successfully:", data);
    // Communicate success to the content script or UI
    sendResponse({ success: true, message: 'Tags submitted successfully!' });
  } catch (error) {
    console.error("Error:", error);
    // Communicate error to the content script or UI
    sendResponse({ success: false, error: error.message });
  }
}




async function checkrequest(request, sender, sendResponse) {
  const pageTitle = request.pageTitle;
  const currentURL = request.currentURL;
  const uniqueId = request.uniqueId;
  let cursor = 0;
  const pageSize = 100;
  chrome.tabs.sendMessage(sender.tab.id, {
    action: "checking",
    mssg: `API CHECK REQUEST about to Start.........🔥🔥🔥🔥🔥`,
  });

  let titleFound = false;
  const codeStartTime = new Date().getTime();
  // Function to fetch data for a specific cursor
  const fetchData = () => {
    chrome.tabs.sendMessage(sender.tab.id, {
      action: "checking",
      mssg: "CHECk REQUEST API 1 is running....✅",
    });
    const constraints = [
      // { key: "content_name_text", constraint_type: "number contains", value: pageTitle },
      { key: "url_text", constraint_type: "text contains", value: currentURL },
      {
        key: "requested_by_text",
        constraint_type: "text contains",
        value: uniqueId,
      },
      //{ key: "platform_text", constraint_type: "equals", value: "Jio Cinema" }
    ];
    // const apiUrl = `https://choice-94121.bubbleapps.io/version-test/api/1.1/obj/listofmovies?constraints=${encodeURIComponent(JSON.stringify(constraints))}&cursor=${cursor}`;
    // const apiUrl = `https://waitlist.choiceai.in/api/1.1/obj/requests?constraints=${encodeURIComponent(JSON.stringify(constraints))}&cursor=${cursor}`;
    // const ck_req_api = `https://waitlist.choiceai.in/version-test/api/1.1/obj/requests`;

    const finalUrl = `${ck_req_api}?constraints=${encodeURIComponent(
      JSON.stringify(constraints)
    )}&cursor=${cursor}`;
    chrome.tabs.sendMessage(sender.tab.id, {
      action: "checking",
      mssg: `🔗api 1 url =  ${finalUrl} `,
    });
    fetch(finalUrl)
      .then((response) => response.json())
      .then((data) => {
        const contentItems = data.response.results;
        chrome.tabs.sendMessage(sender.tab.id, {
          action: "checking",
          mssg: `contentItems ie. response = ${contentItems}`,
        });
        if (!titleFound && contentItems.length > 0) {
          titleFound = true; // Set the flag to true
          //console.log("Title Exists...");
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "checking",
            mssg: `REQUEST Found from API 1 ${pageTitle} 🚀`,
          });
          // Send messages to content script
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "already_requested",
            pageTitle: pageTitle,
          });

          const CodeEndTime = new Date().getTime();
          const elapsedTime = CodeEndTime - codeStartTime;
          // chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: `Time taken to check REQUEST: ${elapsedTime} ms` });
        }
        // Fetch the next page if there is more data
        if (data.response.remaining > 0) {
          cursor += pageSize;
          fetchData();
        } else if (!titleFound) {
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "checking",
            mssg: `REQUEST FOR ⚠️: ${pageTitle} not found`,
          });
          // Send a message to content script indicating that the title was not found
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "new_request",
            pageTitle: pageTitle,
          });
          // console.log(`Title "${pageTitle}" not found in the database.`);
        }
      })
      .catch((error) => {
        console.error("API request error:", error);
      });
  };
  // Start fetching data
  fetchData();
}

async function report_error(request, sender, sendResponse) {
  console.log("Request received to report error:", request);
  const pageTitle = request.title;
  const currentURL = request.currentURL;
  const start_text = request.start;
  const end_text = request.end;
  const scene_time = request.sceneTime;
  const categories_text = request.category;
  const _id = request._id;

  const requestData = {
    title_text: pageTitle,
    url_text: currentURL,
    start_text: start_text,
    end_text: end_text,
    scene_time_text: scene_time,
    category_text: categories_text,
    _id: _id,
  };

  // const error_api = "https://waitlist.choiceai.in/version-test/api/1.1/obj/error_reports";
  const error_api = "https://waitlist.choiceai.in/api/1.1/obj/error_reports";
  // const delete_api = `https://waitlist.choiceai.in/version-test/api/1.1/obj/error_reports/${_id}`;
  const delete_api = `https://waitlist.choiceai.in/api/1.1/obj/custom_tags/${_id}`;

  // Log that the error reporting process has started
  console.log("Starting error reporting process...");

  try {
    if (_id) {
      // If _id is defined, send a DELETE request
      const deleteResponse = await fetch(delete_api, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if required
        },
      });

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete the record");
      }

      console.log("Record deleted successfully:", await deleteResponse.json());
    }

    // Proceed with the POST request for reporting errors
    const postResponse = await fetch(error_api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add authorization header if required
      },
      body: JSON.stringify(requestData),
    });

    if (!postResponse.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await postResponse.json();
    console.log("Data added successfully:", data);
    sendResponse({ success: true });

  } catch (error) {
    console.error("Error:", error);
    sendResponse({ success: false });
  }
}


async function timestamps(request, sender, sendResponse) {
  const timestamps = request.data;
  const opt = request.opt;
  const url = request.url;
  if (url.includes("jiocinema")) {
    platform = "Jio Cinema";
  } else if (url.includes("youtube")) {
    platform = "Youtube";
  }
  const categories = request.categories;
  email = email;
  console.log(
    "Request received to add timestamps:",
    timestamps,
    "opt:",
    opt,
    "url:",
    url,
    "categories:",
    categories,
    "email:",
    email
  );

  // Function to calculate total scene time for each category
  const calculateTotalSceneTime = (timestamps) => {
    return timestamps.reduce((acc, { scenetime_text, category_text }) => {
      if (!acc[category_text]) {
        acc[category_text] = 0;
      }
      acc[category_text] += scenetime_text;
      return acc;
    }, {});
  };

  // Calculate total scene time
  const totalSceneTimeByCategory = calculateTotalSceneTime(timestamps);

  // Function to post the data
  const postTimestamps = (requestData) => {
    // const timestamps_url = `https://waitlist.choiceai.in/version-test/api/1.1/obj/timestamps`;

    fetch(timestamps_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from API:", data);
        // chrome.tabs.sendMessage(sender.tab.id, { action: "timestampsPosted", response: data });
      })
      .catch((error) => {
        console.error("API request error:", error);
        // chrome.tabs.sendMessage(sender.tab.id, { action: "timestampsPostError", error: error.toString() });
      });
  };

  // Iterate over each category and post data
  Object.keys(totalSceneTimeByCategory).forEach((category) => {
    const totalSceneTime = totalSceneTimeByCategory[category];
    const requestData = {
      scenetime_number: totalSceneTime,
      option_text: opt,
      url_text: url,
      category_text: category,
      email_text: email,
      platform_text: platform,
    };

    console.log("Request Data to be sent:", requestData);
    postTimestamps(requestData);
  });
}

async function sendFeedback(request, sender, sendResponse) {
  const feedback = request.feedback;
  // const url = request.url;
  email = unique_id;
  console.log(
    "Request received to send feedback:",
    feedback,
    ", email:",
    email
  );
  sendResponse({ success: true });
  const feedbackData = {
    feedback_text: feedback,
    email_text: email,
  };
  // const fb_api = "https://waitlist.choiceai.in/version-test/api/1.1/obj/feedbacks";
  fetch(fb_api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(feedbackData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Data added successfully:", data);
      sendResponse({ success: true, data: data }); // Send success response back to the sender
    })
    .catch((error) => {
      console.error("Error:", error);
      sendResponse({ success: false, error: error.message }); // Send failure response back to the sender
    });

  // Return true to indicate you will send a response asynchronously
  return true;
}
let timeRanges_DB = [];
async function handleCheckTitleExists(request, tabId, sender) {
  const { pageTitle, platform, url: originalUrl } = request;
  unique_id = request.uniqueId;
  console.log("email rcved in backend from check title exists:", unique_id);
  let v_code;
  let n_url;

  if (originalUrl.includes("/watch")) {
    n_url = originalUrl.replace(/\/watch$/, "");
  } else {
    n_url = originalUrl;
  }

  let url = n_url; // Reassign url using let
  console.log("url:", url);

  if (url.includes("jiocinema")) {
    v_code = url.split("/").slice(-1)[0];
  } else if (url.includes("youtube")) {
    v_code = url.split("=").slice(-1)[0];
  } else if (url.includes("primevideo")) {
    v_code = url.split("/").slice(-2, -1)[0]; // For /detail/0KEP4A6DWRKFYQFTSU5RXHEAN2
  }
  // const apiUrl_mongo = `http://127.0.0.1:5000/api/listOfMovies/getListOfMovies/${v_code}`;
  // const apiUrl_mongo = `https://choice-mgva.onrender.com/api/listOfMovies/getListOfMovies`;
  const finalUrlMongo = `http://localhost:5000/api/listOfMovies/getListOfMovies/${v_code}`;
  const finaleverythingMongo = `http://localhost:5000/api/timestampData/geteverything/${v_code}`;

  let titleFound = false;
  const codeStartTime = new Date().getTime();

  const fetchData = async () => {
    // let customUrl;
    if (url.includes("primevideo")) {
      customUrl = url;
    } else {
      if (!url.includes("/watch")) {
        customUrl = url + "/watch";
      } else {
        customUrl = url;
      }
    }
    console.log("customUrl:", customUrl);
    console.log("v_code:", v_code);

    const fetchFromMongo = async () => {
      try {
        // Get the Auth0 token
        // const audience = `http://127.0.0.1:5000`;
        // clientId = clientId;
        // clientSecret = clientSecret;
        // const token = await getToken(clientId, clientSecret, audience);
        // const securedToken = await yoo(unique_id);

        // console.log("Non secured token :", token);
        console.log("secured token :", token);

        // Fetch data from MongoDB with the token
        const response = await fetch(`${finaleverythingMongo}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        console.log(
          "Data from mongoDB in the fetch request from new db:",
          data
        );

        if (data.message === "Content not found") {
          console.log("timeRanges_DB:", timeRanges_DB);
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "showTitleNotFound",
            pageTitle: pageTitle,
          });
          console.log(`Title "${pageTitle}" not found.`);
          // If title is not found, fetch custom tags and update timeRanges_DB
          // Fetch custom tags
          const customTags = await fetchCustomTags(sender, unique_id);

          // Log the length and contents of customTags
          console.log("custom tags length const we get:", customTags.length);
          console.log(
            "the custom tags we get:",
            JSON.stringify(customTags, null, 2)
          );

          // Define a function to check if an object is a plain object
          const isPlainObject = (obj) => {
            return obj && typeof obj === "object" && obj.constructor === Object;
          };

          // Filter out objects that are not plain objects or have unwanted prototype properties
          const validCustomTags = customTags.filter(
            (tag) => isPlainObject(tag) && tag.category_text !== "mmm"
          );

          // Log the valid custom tags
          console.log(
            "validCustomTags:",
            JSON.stringify(validCustomTags, null, 2)
          );

          // Directly assign validCustomTags to timeRanges_DB
          timeRanges_DB = validCustomTags;

          // Log the updated timeRanges_DB and its length
          console.log(
            "timeRanges_DB after assignment:",
            JSON.stringify(timeRanges_DB, null, 2)
          );
          console.log("timeRanges_DB.length:", timeRanges_DB.length);

          console.log("timeRanges_DB.length:", timeRanges_DB.length);

          if (customTags.length > 0) {
            chrome.tabs.sendMessage(sender.tab.id, {
              action: "customTagsFound",
              pageTitle: data.title,
            });
            timeRanges_DB = JSON.stringify(timeRanges_DB);
            console.log(
              "timeRanges_DB in the forrrrr looooppp:",
              timeRanges_DB
            );
            chrome.tabs.sendMessage(sender.tab.id, {
              action: "sendTimeRanges_seconds",
              timeRanges_DB,
            });
          } else {
            chrome.tabs.sendMessage(sender.tab.id, {
              action: "customTagsNotFound",
              pageTitle: data.title,
            });
          }
        } else {
          titleFound = true;
          console.log("Title Exists...bob");
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "showTitlePopup",
            pageTitle: pageTitle,
          });
          // Assuming db contains the ts array from your MongoDB data
          let db = data.ts;

          timeRanges_DB = db.map((timestamp) => ({
            start_text: timestamp.start,
            end_text: timestamp.end,
            scenetime_text: timestamp.scenetime,
            category_text: timestamp.category,
            cs: timestamp.confidence,
          }));

          // fetchTimestamps(pageTitle, platform, v_code, sender, unique_id);

          // console.log(`Time taken to Fetch: ${elapsedTime} ms`);
          const customTags = await fetchCustomTags(sender, unique_id);
          timeRanges_DB = timeRanges_DB.concat(customTags);
          console.log(
            "custom tags length const we get",
            customTags.length,
            "the custom tags we get",
            customTags
          );

          timeRanges_DB = JSON.stringify(timeRanges_DB);
          console.log("timeRanges_DB in from msg send :", timeRanges_DB);
          const CodeEndTime = new Date().getTime();
          const elapsedTime = CodeEndTime - codeStartTime;
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "checking",
            mssg: `Time taken to Fetch: ${elapsedTime} ms`,
          });
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "sendTimeRanges_seconds",
            timeRanges_DB,
          });
          if (customTags.length > 0) {
            chrome.tabs.sendMessage(sender.tab.id, {
              action: "customTagsFound",
              pageTitle: data.title,
            });
          } else {
            chrome.tabs.sendMessage(sender.tab.id, {
              action: "customTagsNotFound",
              pageTitle: data.title,
            });
          }
        }
      } catch (error) {
        console.error("API request error:", error);
      }
    };

    const checkTokenAndFetch = () => {
      const intervalId = setInterval(() => {
        if (token) {
          clearInterval(intervalId);
          fetchFromMongo();
        } else {
          console.log("Waiting for token...");
        }
      }, 100);
    };

    checkTokenAndFetch();
  };
  fetchData();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // let tr_custom = [];
  // if (request.action === "checkTitleExists") {
  //   const pageTitle = request.pageTitle;
  //   const pagePlatform = request.platform;
  //   const url = request.url;
  //   unique_id = request.uniqueId;
  //   if(url.includes("jiocinema")){
  //     v_code = url.split("/").slice(-1)[0];
  //   }else  if(url.includes("youtube")){
  //     v_code = url.split("=").slice(-1)[0];
  //   }
  //   const apiUrl_mongo = `http://127.0.0.1:5000/api/listOfMovies/getListOfMovies/${v_code}`;
  //   let titleFound = false;
  //   const codeStartTime = new Date().getTime();
  //   const fetchData = () => {
  //     if(!url.includes("/watch")){
  //       customUrl = url+"/watch";
  //     }else{
  //       customUrl = url;
  //     }
  //     console.log("customUrl:", customUrl);
  //     let timeRanges_DB = [];
  //     const fetchFromMongo = () => {
  //       fetch(apiUrl_mongo)
  //           .then(response => response.json())
  //           .then(async data => {
  //             // chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: `into mongo Db search⚠️` });
  //               console.log("Data from mongoDB:", data);
  //               // Check if the URL matches the one you're interested in
  //               const matchingItem = data.find(item => item.url === url);
  //               if (matchingItem) {
  //                 titleFound = true;
  //                 console.log("Title Exists...");
  //                 // chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: `Title Found: ${pageTitle} 🚀` });
  //                 chrome.tabs.sendMessage(sender.tab.id, { action: "showTitlePopup", pageTitle: pageTitle });
  //                 // chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: "fetchTimestamps function initiated from monogDB......✅" });
  //                 fetchTimestamps(pageTitle, pagePlatform, v_code, sender);
  //                 const CodeEndTime = new Date().getTime();
  //                 const elapsedTime = CodeEndTime - codeStartTime;
  //                 chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: `Time taken to Fetch: ${elapsedTime} ms` });
  //               }else if (!titleFound){
  //                 // If title is not found in both apiUrl and apiUrl_mongo, send message indicating title not found
  //                 customTags = await fetchCustomTags(sender);
  //                 timeRanges_DB = timeRanges_DB.concat(customTags);
  //                 // Convert timeRanges_DB to JSON string
  //                 // timeRanges_DB = JSON.stringify(timeRanges_DB);
  //                 // Send the updated timeRanges_DB
  //                 if (timeRanges_DB.length > 0) {
  //                   timeRanges_DB = JSON.stringify(timeRanges_DB);
  //                   console.log("timeRanges_DB in the forrrrr looooppp:", timeRanges_DB);
  //                   chrome.tabs.sendMessage(sender.tab.id, { action: "sendTimeRanges_seconds", timeRanges_DB });
  //                   chrome.tabs.sendMessage(sender.tab.id, { action: "customTagsFound", pageTitle: pageTitle});
  //                 }else{
  //                   console.log("timeRanges_DB:", timeRanges_DB);
  //                   chrome.tabs.sendMessage(sender.tab.id, { action: "showTitleNotFound", pageTitle: pageTitle });
  //                   console.log(`Title "${pageTitle}" not found.`);
  //                 }
  //               }
  //           })
  //           .catch(error => {
  //               console.error("API request error:", error);
  //           });
  //     };
  //     fetchFromMongo();
  //     };
  //   // Start fetching data
  //   fetchData();
  // }
  // //new API for collecting Requests
  // if (request.action === "createRequest") {
  //   const inputString = request.title;
  //   const currentURL = request.url;
  //   const type = request.type;
  //   const platform = request.platform;
  //   const user = request.uniqueId
  //   const movieId = (match => match ? match[1] : 'Movie ID not found in the URL.')(currentURL.match(/\/(\d+)$/));
  //   console.log(movieId);
  //     function replaceSpecialCharacters(inputString) {
  //       // Define a regular expression to match special characters
  //       var specialCharactersRegex = /[!@#$%^&*()_+{}\[\]:;<>,.|?~\\/-]/g;
  //       // Replace special characters with underscores
  //       var resultString = inputString.replace(specialCharactersRegex, '_');
  //       return resultString;
  //   }
  //   // var inputString = "Hello! This is a @sample string with special characters.";
  //   var pageTitle = replaceSpecialCharacters(inputString);
  //   const requestData = {
  //                   "content_name_text": pageTitle,
  //                   "platform_text": platform,
  //                   "url_text": currentURL,
  //                   "type_text": type,
  //                   "requested_by_text": user,
  //                   "vcode2_text": movieId
  //                   // "requested_by_text": uniqueId
  //               };
  //               // const apiUrl = "https://choice-94121.bubbleapps.io/version-test/api/1.1/obj/requests";
  //               // const apiUrl = "https://waitlist.choiceai.in/api/1.1/obj/requests";
  //               const apiUrl = "https://waitlist.choiceai.in/version-test/api/1.1/obj/requests";
  //               fetch(apiUrl, {
  //                   method: "POST",
  //                   headers: {
  //                       "Content-Type": "application/json"
  //                       // Add authorization header if required
  //                   },
  //                   body: JSON.stringify(requestData)
  //               })
  //               .then(response => response.json())
  //               .then(data => {
  //                   console.log("Data added successfully:", data);
  //                   // You might want to send a response back to the content script or show a notification
  //                   // chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: data });
  //                   chrome.tabs.sendMessage(sender.tab.id, { action: "request_taken", title: pageTitle, url: currentURL, type: type });
  //               })
  //               .catch(error => {
  //                   console.error("Error:", error);
  //               });
  //               });
  //   /*
  //   // Use chrome.cookies.get with a callback function
  //   chrome.cookies.get(
  //       {
  //           // url: "https://waitlist.choiceai.in/movie_list",
  //           url: "https://waitlist.choiceai.in/version-test/movie_list",
  //           name: "username"
  //       },
  //       function (cookie) {
  //           if (cookie) {
  //               const uniqueId = cookie.value;
  //               chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: `Found the Creator = ${uniqueId}` });
  //               // Continue with the rest of your logic inside this block
  //               const requestData = {
  //                   "content_name_text": pageTitle,
  //                   "platform_text": platform,
  //                   "url_text": currentURL,
  //                   "type_text": type,
  //                   "requested_by_text": user
  //                   // "requested_by_text": uniqueId
  //               };
  //               const apiUrl = "https://choice-94121.bubbleapps.io/version-test/api/1.1/obj/requests";
  //               // const apiUrl = "https://waitlist.choiceai.in/api/1.1/obj/requests";
  //               fetch(apiUrl, {
  //                   method: "POST",
  //                   headers: {
  //                       "Content-Type": "application/json"
  //                       // Add authorization header if required
  //                   },
  //                   body: JSON.stringify(requestData)
  //               })
  //               .then(response => response.json())
  //               .then(data => {
  //                   console.log("Data added successfully:", data);
  //                   // You might want to send a response back to the content script or show a notification
  //                   // chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: data });
  //                   chrome.tabs.sendMessage(sender.tab.id, { action: "request_taken", title: pageTitle, url: currentURL, type: type });
  //               })
  //               .catch(error => {
  //                   console.error("Error:", error);
  //               });
  //           } else {
  //               chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: "BIG Problems here to find the Cookie" });
  //           }
  //       }
  //   );
  //   */
  // }
  // //new API for checking the Requests
  // else if (request.action === "checkrequest") {
  //   const pageTitle = request.pageTitle;
  //   const currentURL = request.currentURL;
  //   const uniqueId = request.uniqueId;
  //   let cursor = 0;
  //   const pageSize = 100;
  //   chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: `API CHECK REQUEST about to Start.........🔥🔥🔥🔥🔥` });
  //   let titleFound = false;
  //   const codeStartTime = new Date().getTime();
  //   // Function to fetch data for a specific cursor
  //   const fetchData = () => {
  //     chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: "CHECk REQUEST API 1 is running....✅" });
  //     const constraints = [
  //       // { key: "content_name_text", constraint_type: "number contains", value: pageTitle },
  //       { key: "url_text", constraint_type: "text contains", value: currentURL },
  //       { key: "requested_by_text", constraint_type: "text contains", value: uniqueId }
  //       //{ key: "platform_text", constraint_type: "equals", value: "Jio Cinema" }
  //     ];
  //     // const apiUrl = `https://choice-94121.bubbleapps.io/version-test/api/1.1/obj/listofmovies?constraints=${encodeURIComponent(JSON.stringify(constraints))}&cursor=${cursor}`;
  //     // const apiUrl = `https://waitlist.choiceai.in/api/1.1/obj/requests?constraints=${encodeURIComponent(JSON.stringify(constraints))}&cursor=${cursor}`;
  //     const apiUrl = `https://waitlist.choiceai.in/version-test/api/1.1/obj/requests?constraints=${encodeURIComponent(JSON.stringify(constraints))}&cursor=${cursor}`;
  //     chrome.tabs.sendMessage(sender.tab.id,{action:"checking", mssg:`🔗api 1 url =  ${apiUrl} `});
  //     fetch(apiUrl)
  //       .then(response => response.json())
  //       .then(data => {
  //         const contentItems = data.response.results;
  //         chrome.tabs.sendMessage(sender.tab.id,{action:"checking",mssg:`contentItems ie. response = ${contentItems}` })
  //         if (!titleFound && contentItems.length > 0) {
  //           titleFound = true; // Set the flag to true
  //         //console.log("Title Exists...");
  //           chrome.tabs.sendMessage(sender.tab.id,{action:"checking", mssg:`REQUEST Found from API 1 ${pageTitle} 🚀`});
  //           // Send messages to content script
  //           chrome.tabs.sendMessage(sender.tab.id, { action: "already_requested", pageTitle: pageTitle });
  //           const CodeEndTime = new Date().getTime();
  //           const elapsedTime = CodeEndTime - codeStartTime;
  //           // chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: `Time taken to check REQUEST: ${elapsedTime} ms` });
  //         }
  //         // Fetch the next page if there is more data
  //         if (data.response.remaining > 0) {
  //           cursor += pageSize;
  //           fetchData();
  //         } else if (!titleFound) {
  //           chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: `REQUEST FOR ⚠️: ${pageTitle} not found` });
  //           // Send a message to content script indicating that the title was not found
  //           chrome.tabs.sendMessage(sender.tab.id, { action: "new_request", pageTitle: pageTitle });
  //           // console.log(`Title "${pageTitle}" not found in the database.`);
  //         }
  //       })
  //       .catch(error => {
  //         console.error("API request error:", error);
  //       });
  //   };
  //   // Start fetching data
  //   fetchData();
  // }
  // else if (request.action === "report_error") {
  //   console.log("Request received to report error:", request);
  //   const pageTitle = request.title;
  //   const currentURL = request.currentURL;
  //   const start_text = request.start;
  //   const end_text = request.end;
  //   const scene_time = request.sceneTime;
  //   const categories_text = request.category;
  //   const requestData = {
  //       "title_text": pageTitle,
  //       "url_text": currentURL,
  //       "start_text": start_text,
  //       "end_text": end_text,
  //       "scene_time_text": scene_time,
  //       "category_text": categories_text
  //   };
  //   const apiUrl = "https://waitlist.choiceai.in/version-test/api/1.1/obj/error_reports";
  //   // Log that the error reporting process has started
  //   console.log("Starting error reporting process...");
  //   fetch(apiUrl, {
  //       method: "POST",
  //       headers: {
  //           "Content-Type": "application/json"
  //           // Add authorization header if required
  //       },
  //       body: JSON.stringify(requestData)
  //   })
  //   .then(response => {
  //     console.log("Response status:", response.status);
  //     console.log("Response headers:", response.headers);
  //       if (!response.ok) {
  //           throw new Error("Network response was not ok");
  //       }
  //       return response.json();
  //   })
  //   .then(data => {
  //       // Log the success message and data received
  //       console.log("Data added successfully:", data);
  //       // Send a response back to the content script to indicate success
  //       sendResponse({ success: true });
  //   })
  //   .catch(error => {
  //       // Log and handle the error
  //       console.error("Error:", error);
  //       // Send a response back to the content script to indicate failure
  //       sendResponse({ success: false });
  //   });
  // }
  // else if (request.action === "addCustomTag") {
  //   console.log("Request received to add custom tag:", request.data);
  //   console.log("email:", email)
  //   unique_id = request.uniqueId;
  //   requestData = {
  //     start_number: request.data.start_number,
  //     end_number: request.data.end_number,
  //     scenetime_number: request.data.scenetime_number,
  //     email_text: unique_id,
  //     url_text: request.url,
  //     category_text: request.data.category_text,
  //     conf_number:request.data.cs
  //   }
  //   console.log("Request Data to be sent:", requestData);
  //   api = "https://waitlist.choiceai.in/version-test/api/1.1/obj/custom_tags"
  //   fetch(api, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify(requestData)
  //   })
  //   .then(response => response.json())
  //   .then(data => {
  //     console.log("Data added successfully:", data);
  //   })
  //   .catch(error => {
  //     console.error("Error:", error);
  //   });
  //   sendResponse({ success: true });
  // }
  // else if (request.action === "timestamps") {
  //   const timestamps = request.data;
  //   const opt = request.opt;
  //   const url = request.url;
  //   if(url.includes("jiocinema")){
  //     platform = "Jio Cinema"
  //   }else  if(url.includes("youtube")){
  //     platform = "Youtube";
  //   }
  //   const categories = request.categories;
  //   email = email
  //   console.log("Request received to add timestamps:", timestamps,"opt:",opt, "url:", url, "categories:", categories, "email:", email);
  //   // const timestamps_url = `https://waitlist.choiceai.in/version-test/api/1.1/obj/timestamps`;
  //   // Function to calculate total scene time for each category
  //   const calculateTotalSceneTime = (timestamps) => {
  //     return timestamps.reduce((acc, { scenetime_text, category_text }) => {
  //         if (!acc[category_text]) {
  //             acc[category_text] = 0;
  //         }
  //         acc[category_text] += scenetime_text;
  //         return acc;
  //     }, {});
  //   };
  //   // Calculate total scene time
  //   const totalSceneTimeByCategory = calculateTotalSceneTime(timestamps);
  //   // Function to post the data
  //   const postTimestamps = (requestData) => {
  //     const timestamps_url = `https://waitlist.choiceai.in/version-test/api/1.1/obj/timestamps`;
  //     fetch(timestamps_url, {
  //         method: 'POST',
  //         headers: {
  //             'Content-Type': 'application/json'
  //         },
  //         body: JSON.stringify(requestData)
  //     })
  //     .then(response => response.json())
  //     .then(data => {
  //         console.log("Response from API:", data);
  //         // chrome.tabs.sendMessage(sender.tab.id, { action: "timestampsPosted", response: data });
  //     })
  //     .catch(error => {
  //         console.error("API request error:", error);
  //         // chrome.tabs.sendMessage(sender.tab.id, { action: "timestampsPostError", error: error.toString() });
  //     });
  //   };
  //   // Iterate over each category and post data
  //   Object.keys(totalSceneTimeByCategory).forEach(category => {
  //     const totalSceneTime = totalSceneTimeByCategory[category];
  //     const requestData = {
  //         scenetime_number: totalSceneTime,
  //         option_text: opt,
  //         url_text: url,
  //         category_text: category,
  //         email_text: email,
  //         platform_text: platform
  //     };
  //     console.log("Request Data to be sent:", requestData);
  //     postTimestamps(requestData);
  //   });
  // }
  // if(request.action === "sendFeedback"){
  //   const feedback = request.feedback;
  //   // const url = request.url;
  //   email = email;
  //   console.log("Request received to send feedback:", feedback, ", email:", email);
  //   sendResponse({ success: true });
  //   const feedbackData = {
  //     feedback_text: feedback,
  //     email_text: email
  //   };
  //   const apiUrl = "https://waitlist.choiceai.in/version-test/api/1.1/obj/feedbacks";
  //   fetch(apiUrl, {
  //     method: "POST",
  //     headers: {
  //         "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify(feedbackData)
  //   })
  //   .then(response => response.json())
  //   .then(data => {
  //       console.log("Data added successfully:", data);
  //       sendResponse({ success: true, data: data }); // Send success response back to the sender
  //   })
  //   .catch(error => {
  //       console.error("Error:", error);
  //       sendResponse({ success: false, error: error.message }); // Send failure response back to the sender
  //   });
  //   // Return true to indicate you will send a response asynchronously
  //   return true;
  // }
});

//not needed now

function getCookieValue(name) {
  currentURL = window.location.href;
  let cookies = currentURL.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.startsWith(name + "=")) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}

// Example usage:
// let choiceUserValue = getCookieValue('choice_user');
// console.log('Value of choice_user cookie:', choiceUserValue);

const fetchCustomTags = async (sender, unique_id) => {
  let tr_custom = [];
  console.log("unique_id in custom tags fetching", unique_id);
  try {
    const constraints = [
      { key: "url_text", constraint_type: "text contains", value: customUrl },
      { key: "email_text", constraint_type: "equals", value: unique_id },
    ];

    // const customtags_url = `https://waitlist.choiceai.in/version-test/api/1.1/obj/custom_tags`;
    const final_ct_url = `${customtags_url}?constraints=${encodeURIComponent(
      JSON.stringify(constraints)
    )}&cursor=${cursor}`;
    console.log("customtags_url:", final_ct_url);

    const response = await fetch(final_ct_url);
    const data = await response.json();
    const customTags = data.response.results;

    if (data.response.remaining > 0) {
      cursor += pageSize;
      tr_custom = tr_custom.concat(await fetchCustomTags(sender, unique_id));
    } else if (customTags.length > 0) {
      // chrome.tabs.sendMessage(sender.tab.id, { action: "showCustomTags", customTags });
      console.log("Custom tags:", customTags);
      customTags.forEach((timestamp) => {
        const {
          start_number,
          end_number,
          scenetime_number,
          category_text,
          conf_number,
          _id
        } = timestamp;
        tr_custom.push({
          start_text: start_number,
          end_text: end_number,
          scenetime_text: scenetime_number,
          category_text: category_text,
          cs: conf_number,
          type: "customtags",
          _id: _id,
        });
      });
    }
  } catch (error) {
    console.error("API request error:", error);
  }
  return tr_custom;
};

// new latest time efficient code
// const fetchTimestamps = (pageTitle, pagePlatform, v_code, sender) => {
//   chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: "API 2 Running....1" });
//   let cursor = 0;
//   const pageSize = 100;

//   // Array to store the fetched timestamps
//   let timeRanges_DB = [];

//   cursor = 0;
//   const codeStartTime_api2 = new Date().getTime();

//   const fetchFromSecondAPI = () => {
//     chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: "API 2 Running...." });
//     // var cursor= 0;
//     let limit = 500;
//     let confidence = 60;

//     const apiUrl_second = `http://localhost:5000/api/contentData/getContentData/?query=${v_code}&limit=${limit}&skip=${cursor}&confidence=${confidence}`;
//     chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: `MongoDB apiUrl_second: ${apiUrl_second}` });

//     fetch(apiUrl_second)
//         .then(response => response.json())
//         .then(async data => {
//             const contentItems = data; // No need to access .response.results since data itself contains the response array
//             // console.log("contentItems:", contentItems);

//             if (contentItems.length > 0) {
//                 contentItems.forEach(timestamp => {
//                     const { start, end, scenetime, category, confidence } = timestamp;
//                     timeRanges_DB.push({ start_text: start, end_text: end, scenetime_text: scenetime, category_text: category, cs: confidence });
//                 });
//                 // console.log("timeRanges_DB:", timeRanges_DB);
//             }
//             // console.log("Number of items fetched:", contentItems.length);
//             if (contentItems.length === limit) {
//                 cursor += limit;
//                 fetchFromSecondAPI(); // Recursive call with updated cursor
//             } else {
//                 if (timeRanges_DB.length > 0) {
//                     customTags = await fetchCustomTags(sender);
//                     timeRanges_DB = timeRanges_DB.concat(customTags);
//                     timeRanges_DB = JSON.stringify(timeRanges_DB);
//                     chrome.tabs.sendMessage(sender.tab.id, { action: "sendTimeRanges_seconds", timeRanges_DB });
//                     // chrome.tabs.sendMessage(sender.tab.id, { action: "show choose btn" });
//                     console.log("Fetched timeRanges_DB from mongoDB:", timeRanges_DB);
//                     const CodeEndTime_api2 = new Date().getTime();
//                     const elapsedTime_api2 = CodeEndTime_api2 - codeStartTime_api2;
//                     chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: `Time taken to Fetch: ${elapsedTime_api2} ms` });
//                 } else {
//                     console.log("No matching timestamps found.");
//                 }
//             }
//         })
//         .catch(error => {
//             console.error("API request error:", error);
//         });
//   };
//   fetchFromSecondAPI();
// };

// const fetchTimestamps = async (pageTitle, pagePlatform, v_code, sender) => {
//   chrome.tabs.sendMessage(sender.tab.id, {
//     action: "checking",
//     mssg: "API 2 Running....1",
//   });
//   let cursor = 0;
//   const pageSize = 100;

//   // Array to store the fetched timestamps
//   // let timeRanges_DB = [];

//   cursor = 0;
//   const codeStartTime_api2 = new Date().getTime();

//   const fetchFromSecondAPI = async () => {
//     chrome.tabs.sendMessage(sender.tab.id, {
//       action: "checking",
//       mssg: "API 2 Running....",
//     });
//     let limit = 500;
//     let confidence = 60;

//     // const apiUrl_second = `http://localhost:5000/api/contentData/getContentData/?query=${v_code}&limit=${limit}&skip=${cursor}&confidence=${confidence}`;
//     // const apiUrl_second = `https://choice-mgva.onrender.com/api/contentData/getContentData`;
//     const finalUrlMongo = `http://localhost:5000/api/contentData/getContentData/?query=${v_code}&limit=${limit}&skip=${cursor}&confidence=${confidence}`;
//     chrome.tabs.sendMessage(sender.tab.id, {
//       action: "checking",
//       mssg: `MongoDB apiUrl_second: ${finalUrlMongo}`,
//     });

//     try {
//       // Get the Auth0 token
//       // const audience = `http://localhost:5000`;
//       // const clientId = "JDuXBdlzQTajz3nxRoGOO3lXxKt8pA3A";
//       // const clientSecret = "iqeqQZ7cWL97gpPfJtqzHjpvjrMQUUt-ruV-vsG-QM3QwgZbWdVpsJZkqqftPNFc";
//       let a = new Date().getTime();
//       let b = new Date().getTime();
//       let c = b - a;
//       chrome.tabs.sendMessage(sender.tab.id, {
//         action: "checking",
//         mssg: `Time taken to token: ${c} ms`,
//       });

//       a = new Date().getTime();
//       // Fetch data from the second API with the token
//       const response = await fetch(finalUrlMongo, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       b = new Date().getTime();
//       c = b - a;
//       chrome.tabs.sendMessage(sender.tab.id, {
//         action: "checking",
//         mssg: `Time taken to fetch timestamps: ${c} ms`,
//       });

//       const data = await response.json();
//       const contentItems = data; // No need to access .response.results since data itself contains the response array
//       console.log("contentItems:", contentItems);

//       a = new Date().getTime();
//       if (contentItems.length > 0) {
//         contentItems.forEach((timestamp) => {
//           const { start, end, scenetime, category, confidence } = timestamp;
//           timeRanges_DB.push({
//             start_text: start,
//             end_text: end,
//             scenetime_text: scenetime,
//             category_text: category,
//             cs: confidence,
//           });
//         });
//         console.log("timeRanges_DB:", timeRanges_DB);
//       }
//       b = new Date().getTime();
//       c = b - a;
//       chrome.tabs.sendMessage(sender.tab.id, {
//         action: "checking",
//         mssg: `Time taken process: ${c} ms`,
//       });

//       if (contentItems.length === limit) {
//         cursor += limit;
//         fetchFromSecondAPI(); // Recursive call with updated cursor
//       } else {
//         if (timeRanges_DB.length > 0) {
//           const customTags = await fetchCustomTags(sender, unique_id);
//           timeRanges_DB = timeRanges_DB.concat(customTags);
//           timeRanges_DB = JSON.stringify(timeRanges_DB);
//           chrome.tabs.sendMessage(sender.tab.id, {
//             action: "sendTimeRanges_seconds",
//             timeRanges_DB,
//           });
//           // console.log("Fetched timeRanges_DB from mongoDB:", timeRanges_DB);
//           const CodeEndTime_api2 = new Date().getTime();
//           const elapsedTime_api2 = CodeEndTime_api2 - codeStartTime_api2;
//           chrome.tabs.sendMessage(sender.tab.id, {
//             action: "checking",
//             mssg: `Time taken to final send: ${elapsedTime_api2} ms`,
//           });
//         } else {
//           console.log("No matching timestamps found.");
//         }
//       }
//     } catch (error) {
//       console.error("API request error:", error);
//     }
//   };

//   // Start fetching data
//   fetchFromSecondAPI();
// };

//profiles uncomment afterwards

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "new profile") {
    const email = request.email;
    const p_name = request.p_name;
    const cat = request.cat;
    // const default =

    const requestData = {
      username_text: email,
      p_name_text: p_name,
      categories_text: cat,
    };

    // const apiUrl = "https://choice-94121.bubbleapps.io/version-test/api/1.1/obj/requests";
    // const apiUrl = "https://waitlist.choiceai.in/api/1.1/obj/requests";
    const profile_apiUrl = "https://waitlist.choiceai.in/api/1.1/obj/profile";
    // const profile_apiUrl = "https://waitlist.choiceai.in/version-test/api/1.1/obj/profile";

    fetch(profile_apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add authorization header if required
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Data added successfully:", data);
        // You might want to send a response back to the content script or show a notification
        // chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: data });
        // chrome.tabs.sendMessage(sender.tab.id, { action: "request_taken", title: pageTitle, url: currentURL, type: type });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else if (request.action === "check profile") {
    const email = request.email;
    // const p_name = request.p_name;
    // const cat = request.cat;
    let cursor = 0;
    const pageSize = 100;

    // chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: `pageTitle= ${pageTitle}, platform = ${pagePlatform}` });

    let emailFound = false;
    const codeStartTime = new Date().getTime();
    // Function to fetch data for a specific cursor
    const FetchProfile = () => {
      chrome.tabs.sendMessage(sender.tab.id, {
        action: "checking",
        mssg: "FetchProfile is running....✅",
      });
      const constraints = [
        {
          key: "username_text",
          constraint_type: "text contains",
          value: email,
        },
        // { key: "platform_text", constraint_type: "equals", value: pagePlatform }
        // { key: "url_text", constraint_type: "equals", value: url }

        //{ key: "platform_text", constraint_type: "equals", value: "Jio Cinema" }
      ];
      chrome.tabs.sendMessage(sender.tab.id, {
        action: "checking",
        mssg: `Username in cookie constraint is 🔗 = ${email} `,
      });

      // const apiUrl = `https://waitlist.choiceai.in/api/1.1/obj/profile?constraints=${encodeURIComponent(
      //   JSON.stringify(constraints)
      // )}&cursor=${cursor}`;
      const apiUrl = `https://waitlist.choiceai.in/api/1.1/obj/profile?constraints=${encodeURIComponent(
        JSON.stringify(constraints)
      )}&cursor=${cursor}`;

      fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
          // chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: `response = ${JSON.stringify(data)}` }); // Move this line here

          const contentItems = data.response.results;

          const profileData = contentItems.map((item) => {
            return {
              profileName: item.p_name_text,
              categories: item.categories_text.split(", "),
            };
          });

          console.log("Profile Data:", profileData);

          console.log("Length of contentItems:", contentItems.length);

          if (!emailFound && contentItems.length > 0) {
            console.log("Username Profile Exists...");

            // chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: `Profiles found !!!!` });

            const profileInfoString = profileData
              .map(
                (profile) =>
                  `${profile.profileName}: ${profile.categories.join(", ")}`
              )
              .join("; ");
            // chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: `Profiles found: ${profileInfoString}` });
            chrome.tabs.sendMessage(sender.tab.id, {
              action: "loadProfiles",
              profile: profileInfoString,
            });

            emailFound = true;
            const CodeEndTime = new Date().getTime();
            const elapsedTime = CodeEndTime - codeStartTime;
            chrome.tabs.sendMessage(sender.tab.id, {
              action: "checking",
              mssg: `Time taken to Fetch User Profile: ${elapsedTime} ms`,
            });
          }
          if (data.response.remaining > 0) {
            cursor += pageSize;
            FetchProfile();
          } else if (!emailFound) {
            chrome.tabs.sendMessage(sender.tab.id, {
              action: "checking",
              mssg: `Profile⚠️: ${email}`,
            });
          }
        })
        .catch((error) => {
          console.error("API request error:", error);
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "checking",
            mssg: `API request error: ${error}`,
          });
        });
    };

    // Start fetching data
    FetchProfile();
  }
});

// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//   if (message.getConfidenceScore) {
//       // Retrieve confidence score from storage
//       chrome.storage.local.get('confidenceScore', function(data) {
//           const confidenceScore = data.confidenceScore;
//           // Send the confidence score back to the popup script
//           sendResponse({ confidenceScore: confidenceScore });
//       });
//       // Return true to indicate that sendResponse will be called asynchronously
//       return true;
//   }
// });

/*   uncomment afterwards
  
  //new API for collecting Requests
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "createRequest") {
      const pageTitle = request.title;
      const currentURL = request.url; 
      const type = request.type;
      const platform = request.platform;
  
      const requestData = {
        "content_name_text": pageTitle,
        "platform_text": platform,
        "url_text": currentURL,
        "type_text": type
      };
  
      // const apiUrl = "https://choice-94121.bubbleapps.io/version-test/api/1.1/obj/requests";
      const apiUrl = "https://waitlist.choiceai.in/api/1.1/obj/requests";
  
      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
          // Add authorization header if required
        },
        body: JSON.stringify(requestData)
      })
      .then(response => response.json())
      .then(data => {
        console.log("Data added successfully:", data);
        // You might want to send a response back to the content script or show a notification
        // chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: data });
  
        chrome.tabs.sendMessage(sender.tab.id,{ action: "request_taken", title: pageTitle, url: currentURL, type: type });
      })
      .catch(error => {
        console.error("Error:", error);
      });
    }
  });
  
  
  //new API for checking the Requests
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: request });
  
    if (request.action === "checkrequest") {
      const pageTitle = request.pageTitle;
      const currentURL = request.currentURL;
      let cursor = 0;
      const pageSize = 100;
      chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: `API CHECK REQUEST about to Start.........🔥🔥🔥🔥🔥` });
      
  
      let titleFound = false;
      const codeStartTime = new Date().getTime();
      // Function to fetch data for a specific cursor
      const fetchData = () => {
        chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: "CHECk REQUEST API is running....✅" });
        const constraints = [
          { key: "content_name_text", constraint_type: "text contains", value: pageTitle },
          { key: "url_text", constraint_type: "text contains", value: currentURL }
          //{ key: "platform_text", constraint_type: "equals", value: "Jio Cinema" }
        ];
        // const apiUrl = `https://choice-94121.bubbleapps.io/version-test/api/1.1/obj/listofmovies?constraints=${encodeURIComponent(JSON.stringify(constraints))}&cursor=${cursor}`;
        const apiUrl = `https://waitlist.choiceai.in/api/1.1/obj/requests?constraints=${encodeURIComponent(JSON.stringify(constraints))}&cursor=${cursor}`;
        chrome.tabs.sendMessage(sender.tab.id,{action:"checking", mssg:`🔗api 1 url =  ${apiUrl} `});
        fetch(apiUrl)
          .then(response => response.json())
          .then(data => {
            const contentItems = data.response.results;
  
            if (!titleFound && contentItems.length > 0) {
              titleFound = true; // Set the flag to true
            //console.log("Title Exists...");
              chrome.tabs.sendMessage(sender.tab.id,{action:"checking", mssg:`REQUEST Found from API 1 ${pageTitle} 🚀`});
              // Send messages to content script
              chrome.tabs.sendMessage(sender.tab.id, { action: "already_requested", pageTitle: pageTitle });
  
              const CodeEndTime = new Date().getTime();
              const elapsedTime = CodeEndTime - codeStartTime;
              chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: `Time taken to check REQUEST: ${elapsedTime} ms` });
  
            }
            // Fetch the next page if there is more data
            if (data.response.remaining > 0) {
              cursor += pageSize;
              fetchData();
            } else if (!titleFound) {
  
              chrome.tabs.sendMessage(sender.tab.id, { action: "checking", mssg: `REQUEST FOR ⚠️: ${pageTitle} not found` });
              // Send a message to content script indicating that the title was not found
              chrome.tabs.sendMessage(sender.tab.id, { action: "new_request", pageTitle: pageTitle });
              // console.log(`Title "${pageTitle}" not found in the database.`);
            }
          })
          .catch(error => {
            console.error("API request error:", error);
          });
      };
      // Start fetching data
      fetchData();
    }
  });
  
  */
