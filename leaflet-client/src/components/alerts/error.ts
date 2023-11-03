export const showErrorMessage = () => {
  const errorMessage = document.getElementById('errorMessage');
  if (errorMessage) {
    errorMessage.style.display = 'block'; // Show the div

    // Add the 'show' class to trigger the animation
    errorMessage.classList.add('show');

    setTimeout(() => {
      // Remove the 'show' class to prevent animation when hiding
      errorMessage.classList.remove('show');
      errorMessage.style.display = 'none'; // Hide the div after 2 seconds
    }, 2000); // 2000 milliseconds (2 seconds)
  }
};
