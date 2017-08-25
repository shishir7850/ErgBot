var express = require('express');  
var bodyParser = require('body-parser');  
var request = require('request');  
var app = express();

app.use(bodyParser.urlencoded({extended: false}));  
app.use(bodyParser.json());  
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {  
    res.send('This is TestBot Server');
});

// Facebook Webhook
// Used for verification
app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === "this_is_my_token") {
    console.log("Verified webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Verification failed. The tokens do not match.");
    res.sendStatus(403);
  }
});

// All callbacks for Messenger will be POST-ed here
app.post("/webhook", function (req, res) {
  // Make sure this is a page subscription
  if (req.body.object == "page") {
    // Iterate over each entry
    // There may be multiple entries if batched
    req.body.entry.forEach(function(entry) {
      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.postback) {
          processPostback(event);
        } else if (event.message) {
          var message = event.message.text;
          if (message === 'help' || message === 'Help') {
            sendMessage(event.sender.id, {text: "HELP: \n1) How to Erg? : https://www.fitnesstep1.com/wp-content/uploads/2017/01/concept-2-rowing-machine.png\n2) Info: Blah Blah"});
          } else if (event.message.text === 'workouts' || event.message.text === 'workout' || event.message.text === 'Workouts' || event.message.text === 'Workout'){
            showWorkouts(event);
          } else {
            sendMessage(event.sender.id, {text: "Error: wrong input"});
          }
          
        }
      });
    });

    res.sendStatus(200);
  }
});

//
function showWorkouts(event) {
  var senderId = event.sender.id;
  sendMessage(senderId, {text: "Rowing workouts are classified into 3 categories: \n1) VO2: VO2 max is the maximum amount of oxygen your body can utilize during exercise. It's a combination of how much oxygen-rich blood your heart can pump, and the muscles efficiency in extracting and utilizing the oxygen. Since oxygen is critical to running fast, your VO2 max is the single best measure of running fitness. So this workout comprises of high intensity sets designed to test your ability to row hard! \n2) UT: The aerobic system can be improved through training at a level which works the oxygen transporting system of the body without allowing an accumulation of lactate in the muscles, usually at exercise levels of between 55% and 75% of maximum heart rate."});
}

//Just to Process the PostBack
function processPostback(event) {
  var senderId = event.sender.id;
  var payload = event.postback.payload;

  if (payload === "Greeting") {
    // Get user's first name from the User Profile API
    // and include it in the greeting
    request({
      url: "https://graph.facebook.com/v2.6/" + senderId,
      qs: {
        access_token: process.env.PAGE_ACCESS_TOKEN,
        fields: "first_name"
      },
      method: "GET"
    }, function(error, response, body) {
      var greeting = "";
      if (error) {
        console.log("Error getting user's name: " +  error);
      } else {
        var bodyObj = JSON.parse(body);
        name = bodyObj.first_name;
        greeting = "Hi " + name + ". ";
      }
      var message = greeting + "My name is Fatty Ergo. I'm here to introduce you to Erging and help you with your workouts.";
      sendMessage(senderId, {text: message});

      var Message = {
              attachment: {
                type: "template",
                payload: {
                  template_type: "generic",
                  elements: [{
                    title: "So tell me something. Have you Erged before?",
                    subtitle: "",
                    image_url: "https://www.fitnesstep1.com/wp-content/uploads/2017/01/concept-2-rowing-machine.png",
                    buttons: [{
                      type: "postback",
                      title: "First Time",
                      payload: "First Time"
                    }, {
                      type: "postback",
                      title: "Born to Erg!",
                      payload: "Nope"
                    }]
                  }]
                }
            }
        };
        sendMessage(senderId, Message);
    });
  } else if (payload === "First Time") {
  	request({
      url: "https://graph.facebook.com/v2.6/" + senderId,
      qs: {
        access_token: process.env.PAGE_ACCESS_TOKEN,
        fields: "first_name"
      },
      method: "GET"
    }, function(error, response, body) {
      var greeting = "";
      if (error) {
        console.log("Error getting user's name: " +  error);
      } else {
        var bodyObj = JSON.parse(body);
        name = bodyObj.first_name;
      }

      var message = "Hey " + name + ", I'm excited that you have chosen to start rowing. To start off, go through this video tutorial carefully. https://www.youtube.com/watch?v=zQ82RYIFLN8 ";
      sendMessage(senderId, {text: message});

      //Ask for workout
      var Message = {
              attachment: {
                type: "template",
                payload: {
                  template_type: "generic",
                  elements: [{
                  	title: "Continue when ready!",
                    subtitle: "",
                    image_url: "https://imgflip.com/i/1ty1x2",
                    buttons: [{
                      type: "postback",
                      title: "Continue",
                      payload: "Continue"
                    }]
                  }]
                }
            }
        };
        sendMessage(senderId, Message);

    });
  } else if (payload == "Nope") {
    request({
      url: "https://graph.facebook.com/v2.6/" + senderId,
      qs: {
        access_token: process.env.PAGE_ACCESS_TOKEN,
        fields: "first_name"
      },
      method: "GET"
    }, function(error, response, body) {
      var greeting = "";
      if (error) {
        console.log("Error getting user's name: " +  error);
      } else {
        var bodyObj = JSON.parse(body);
        name = bodyObj.first_name;
      }

      var Message = {
          attachment: {
            type: "image",
              payload: {
                url: "https://i.ytimg.com/vi/AU2Ln65I_a8/hqdefault.jpg",
                is_reusable: true
            }
          }
        };
      sendMessage(senderId, Message);
      var message = "Ready to Break the Chain?. Type workouts to get started! If you have any trouble hit help!"
      sendMessage(senderId, {text: message});
    });
  }  else if (payload === "Continue") {
  	var Message = "As mentioned in the video. A rowing stroke is divided into 3 sections: the leg compression, back swing and contraction of arms. The same is followed in the reverse order while going back to take another stroke. Hit Workouts to start out with!"
    sendMessage(senderId, {text: Message});

    var Message = {
              attachment: {
                type: "template",
                payload: {
                  template_type: "generic",
                  elements: [{
                  	title: "Continue when ready!",
                    subtitle: "",
                    image_url: "https://imgflip.com/i/1ty1x2",
                    buttons: [{
                      type: "postback",
                      title: "Let's Start",
                      payload: "Start"
                    }]
                  }]
                }
            }
        };
    sendMessage(senderId, Message);
  } 
  else if (payload === "Start") {
    //Add the code for workouts call function
    
  }
}

//https://s-media-cache-ak0.pinimg.com/736x/85/0c/ed/850ced5ea16cbbb934fc1193a33d6860--rowing-quotes-rugby-quotes.jpg

function showWorkouts(event) {
  //Get DB and post the workouts

}

// sends message to user
function sendMessage(recipientId, message) {
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: "POST",
    json: {
      recipient: {id: recipientId},
      message: message,
    }
  }, function(error, response, body) {
    if (error) {
      console.log("Error sending message: " + response.error);
    }
  });
}
