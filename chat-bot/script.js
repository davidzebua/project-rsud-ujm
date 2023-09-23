const chatContainer = document.getElementById('chat');
const userInput = document.getElementById('user-input');
let userStep = 0;
let userData = {};

function appendBotMessage(message) {
    const botMessage = document.createElement('div');
    botMessage.classList.add('chat-bot');
    botMessage.innerText = `Chatbot: ${message}`;
    chatContainer.appendChild(botMessage);
}

function appendUserMessage(message) {
    const userMessage = document.createElement('div');
    userMessage.classList.add('chat-user');
    userMessage.innerText = `You: ${message}`;
    chatContainer.appendChild(userMessage);
}

function resetChat() {
    chatContainer.innerHTML = '';  // Clear chat history
    userStep = 0;
    userData = {};
    appendBotMessage("Welcome! Please enter your user ID.");
}

// Validate user_id function
function validateUserId(user_id) {
    // Define validation criteria, e.g., minimum length of 5 characters
    const trueLength = 16;

    // Check if user_id meets the criteria
    if (user_id.length != trueLength) {
        return false;
    }

    // You can add more complex validation rules here, e.g., allowed characters

    return true;
}

// Modified sendMessage function to include user_id validation
function sendMessage() {
    const userMessage = userInput.value;
    userInput.value = '';
    appendUserMessage(userMessage);

    if (!userData.user_id) {
        const user_id = userMessage.toLowerCase();  // Convert to lowercase
        if (!validateUserId(user_id)) {
            appendBotMessage("User ID must be at least 16 characters long.");
            return;
        }
        userData.user_id = user_id;
        checkUser(userData.user_id);
    } else if (userStep === 1) {
        userData.name = userMessage;
        appendBotMessage("Thank you! Please enter your age.");
        userStep = 2;
    } else if (userStep === 2) {
        userData.age = parseInt(userMessage);
        appendBotMessage("Thank you! Please enter your gender.");
        userStep = 3;
    } else if (userStep === 3) {
        userData.gender = userMessage;
        appendBotMessage("Thank you for providing your information. Processing...");
        sendUserData();
    }
}

function checkUser(user_id) {
    fetch(`http://127.0.0.1:5000/check_user/${user_id}`)
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                fetch(`http://127.0.0.1:5000/get_user/${user_id}`)
                    .then(response => response.json())
                    .then(user => {
                        appendBotMessage(`User ID ${user_id} already exists with the following information:`);
                        appendBotMessage(`Name: ${user.user.name}`);
                        appendBotMessage(`Age: ${user.user.age}`);
                        appendBotMessage(`Gender: ${user.user.gender}`);
                        appendBotMessage("Is there anything else I can assist you with?");
                    })
                    .catch(error => console.error('Error:', error));
            } else {
                appendBotMessage("Thank you! Please enter your name.");
                userStep = 1;
            }
        })
        .catch(error => console.error('Error:', error));
}

function sendUserData() {
    fetch('http://127.0.0.1:5000/add_user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
        .then(response => response.json())
        .then(data => {
            appendBotMessage(data.message);
            appendBotMessage("Is there anything else I can assist you with?");
        })
        .catch(error => console.error('Error:', error));
}

// Call resetChat when the page loads to start a new chat
resetChat();
