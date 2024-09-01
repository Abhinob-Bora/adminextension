document.addEventListener('DOMContentLoaded', function() {
  const saveBtn = document.getElementById('saveBtn');
  const confidenceScoreInput = document.getElementById('confidenceScore');
  let storedConfidenceScore = null; // Variable to store the confidence score locally in popup

  // Pre-fill input field with stored confidence score from local storage
  const storedValue = localStorage.getItem('confidenceScore');
  if (storedValue !== null) {
      storedConfidenceScore = parseInt(storedValue); // Convert stored value to integer
      confidenceScoreInput.value = storedConfidenceScore;
  }

  // Save button click event listener
  saveBtn.addEventListener('click', function() {
      const confidenceScore = confidenceScoreInput.value;
      
      // Store the confidence score locally in popup
      storedConfidenceScore = confidenceScore;

      // Send message to content script
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { confidenceScore: confidenceScore });
      });

      // Store the confidence score in local storage
      localStorage.setItem('confidenceScore', confidenceScore);
  });
});
