function checkTimeRange() {
  var video = document.querySelector("video");
  console.log("Checking is Video.play == true");

  if (
    (window.location.href.includes("/watch") ||
      window.location.href.includes("/tv-shows")) &&
    video &&
    !video.paused
  ) {
    console.log("Running checkTimeRange");

    var currentTime = video.currentTime;

    console.log("Current Time:", currentTime);

    for (let i = 0; i < timeRanges.length; i++) {
      const startTime = timeRanges[i].start_text;
      const endTime = timeRanges[i].end_text;
      const category = timeRanges[i].category_text;

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
        createFloatingBox(
          `✔️Skipped:${category} for ${endTime - startTime} seconds`
        );

        break; // Exit the loop after the first match
      } else {
        console.log("Not within Time Range");
      }
    }
  } else {
    console.log("Video not playing or video element not found");
  }
  // Clear the interval if the page is not on /watch
  if (
    !(
      window.location.href.includes("/watch") ||
      window.location.href.includes("/tv-shows")
    )
  ) {
    clearInterval(intervalId);
    return;
  }
}

// Path: Ext/watchTimeRange.js
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
  // video.currentTime = 0;
  var currentTime = video.currentTime;
  console.log("Current Time:", currentTime);

  for (let i = 0; i < timeRanges.length; i++) {
    const startTime = timeRanges[i].start_text;
    const endTime = timeRanges[i].end_text;
    const category = timeRanges[i].category_text;
    const cs = timeRanges[i].cs;
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
      const formattedStartTime = secondsToHMS(startTime);
      const formattedEndTime = secondsToHMS(endTime);
      const formattedCurrentTime = secondsToHMS(Math.floor(currentTime));
      createFloatingBox(
        `category: ${category}, start time: ${formattedStartTime}, end time: ${formattedEndTime}, current Time: ${formattedCurrentTime}`
      );
      // createFloatingBox(`category: ${category}, current Time: ${Math.floor(currentTime)}, start time: ${startTime}, end time: ${endTime}`);
      console.log("We're within a valid time range, so no action needed");
      break;
    }
  }
  if (
    !(
      window.location.href.includes("/watch") ||
      window.location.href.includes("/tv-shows")
    ) &&
    isPageLoaded()
  ) {
    clearInterval(intervalId);
    console.log("clearInterval(intervalId); in watchTimeRange function");
    return;
  }
}
