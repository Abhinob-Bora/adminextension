// Initialize the extension when the page is first loaded or refreshed
// initializeExtension();
//<----------------------------------------       HELPER FUNCTIONS       ---------------------------------------------------------------------->
//Create a floating box-like DOM element to display messages, Function to create a floating box that automatically disappears after a specified duration
function createFloatingBox(message) {
  // Create a div element for the floating box

  // Remove the floating box if it already exists
  const existingBox = document.querySelector(".floating-box");
  if (existingBox) {
    document.body.removeChild(existingBox);
  }

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


  // Append the floating box to the body
  document.body.appendChild(floatingBox);

  // Remove the floating box after 2 seconds
  setTimeout(() => {
    floatingBox.style.opacity = 0;
    setTimeout(() => {
      if (floatingBox.parentNode) {
        document.body.removeChild(floatingBox);
      }
    }, 1000); // Fade out animation duration
  }, 3000); // Auto close duration
}
