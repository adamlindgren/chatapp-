let socket = io()
socket.on("message", addMessages);

$(() => {
    $("#send").click(() => {
        let message = { name: $("#name").val(), message: $("#message").val() };
        postMessages(message);
    });
    //anropar den nya getMessages-funktionen
    getMessages();
})

function deleteMessage(messageId, callback) {
    $.ajax({
      url: `/meddelanden/${messageId}`, // Uppdaterad URL
      type: 'DELETE',
      success: function(result) {
        if (callback) {
          callback();
        }
      }
    });
  }  
  

function addMessages(message) {
    let messageElement = $(`
      <div class="message">
        <h4> ${message.namn} </h4>
        <p> ${message.meddelande} </p>
        <button class="delete-message-btn btn btn-danger">Ta bort</button>
      </div>
    `);
    
    // Lägg till klick-event till knappen för att ta bort meddelandet
    messageElement.find(".delete-message-btn").click(() => {
        deleteMessage(message.chat_id, () => {
          // Ta bort meddelandet från DOM
          messageElement.remove();
        });
      });
      
    
    $("#messages").append(messageElement);
  }
  

//funktion för att hämta medelande från backend
function getMessages() {
    $.get("/chats", (data) => {
      data.forEach((message) => {
        addMessages(message);
      });
    });
  }

function postMessages(message) {
    $.post("http://localhost:3000/meddelanden", message, function () {
        $("#name").val("");
        $("#message").val("");
    });
}
