const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");

let userMessage;
const API_KEY = localStorage.getItem('API_KEY') || (localStorage.setItem("API_KEY", prompt("API Key?")) || localStorage.getItem('API_KEY'));


//Array to keep track of convo history
let convoHistory = [
    { role: "system", content: "You are a nutrition assistant bot. If the user message contains a food name, respond by providing the shelf life of that food and what signs of spoilage that food has. If the user message is not a food, reply with an error like \"That's not a food, please give me a food name,\". Be concise. Only 1 sentence at a time. If the user asks follow up questions regarding the food item they asked, answer concisely and be appropriate to the context. Adjust the conversation accordingly. If the user asks for a recipe for the ingredient, make sure to reply appropriately and give recipes but be concise and give the recipies in bullet points formatted correctly.  Be concise and context-aware"}
];

const createChatLi = (message, className) => {
    // Creating a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" ? `<p>${message}</p>` : `<span style="font-size: 30px;">🤖</span> <p>${message}</p>`;
    chatLi.innerHTML = chatContent;
    return chatLi;
}

const generateResponse = (incomingChatLI) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const messageElement = incomingChatLI.querySelector("p");

    //Including convo history in API request
    let messages = convoHistory.concat([{role: "user", content: userMessage }]);

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: messages // Now includes system message from convoHistory 
        })
        
    };

    // Sending POST request to API, getting response
    fetch(API_URL, requestOptions).then(res => res.json()).then(data => {
        let botResponse = data.choices[0].message.content;
        messageElement.textContent = botResponse;

        //Updating convo history with new messages
        convoHistory.push({ role: "user", content: userMessage });
        convoHistory.push({ role: "assistant", content: botResponse });

})

.catch((error) => {
    messageElement.textContent = "Oops! Something went wrong. Please try again.";
})

.finally(() => {
    chatbox.scrollTo(0, chatbox.scrollHeight);
});
};

const handleChat = () => {
    userMessage = chatInput.value.trim();
    if(!userMessage) return;

    // Appending user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        // Displaying "Thinking..." message from chatbot while waiting for response
        const incomingChatLI = createChatLi("Thinking...", "incoming")
        chatbox.appendChild(incomingChatLI);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLI);

    }, 500);
    chatInput.value = '';
};

chatInput.addEventListener("keypress", function(event){
    if (event.key === "Enter"){
        event.preventDefault();
        handleChat();
    }
});



sendChatBtn.addEventListener("click", handleChat);