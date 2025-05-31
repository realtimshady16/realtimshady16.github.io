// Get the input box, submit button, and output box elements
const inputBox = document.getElementById('input-box');
const submitBtn = document.getElementById('submit-btn');
const outputBox = document.getElementById('output-box');

// Add an event listener to the submit button
submitBtn.addEventListener('click', () => {
    // Get the user input
    const userInput = inputBox.value.trim();

    // Process the user input (e.g., convert to uppercase)
    const output = userInput.toUpperCase();

    // Display the output
    outputBox.innerText = output;
});


