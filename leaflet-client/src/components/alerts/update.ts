export const showUpdateMessage = () => {
  const updateMessage = document.getElementById('updateMessage');
  if (updateMessage) {
    updateMessage.style.display = 'block'; // Show the div

    // Add the 'show' class to trigger the animation
    updateMessage.classList.add('show');

    setTimeout(() => {
      // Remove the 'show' class to prevent animation when hiding
      updateMessage.classList.remove('show');
      updateMessage.style.display = 'none'; // Hide the div after 2 seconds
    }, 2000); // 2000 milliseconds (2 seconds)
  }
};
