// popup.js
document.getElementById("sendBtn").addEventListener("click", function () {
  const feedback = document.getElementById("feedback").value;
  if (feedback === "") {
    alert("Please provide feedback");
    return;
  } else if (feedback) {
    chrome.runtime.sendMessage(
      { action: "sendFeedback", feedback: feedback },
      function (response) {
        if (response.success) {
          alert("Feedback sent successfully!");
          document.getElementById("feedback").value = ""; // Clear the feedback box
        } else {
          alert("Failed to send feedback.");
        }
      }
    );
  }
});

document.querySelector(".explore-btn").addEventListener("click", function () {
  // chrome.tabs.create({ url: 'https://waitlist.choiceai.in/version-test/movie_list' });// remove the version-test from the url for going to production
  chrome.tabs.create({ url: "https://waitlist.choiceai.in" }); // remove the version-test from the url for going to production
});
