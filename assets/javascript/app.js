//initializing firebase
var config = {
    apiKey: "AIzaSyBEJjSqEi-1xTuOsa9iCYLphNubJ1LE1jc",
    authDomain: "anytime-is-train-time-a0f60.firebaseio.com",
    databaseURL: "https://anytime-is-train-time-a0f60.firebaseio.com/",
  };

firebase.initializeApp(config);

var database = firebase.database();

// Creating new train when submit button is clicked.
$("#submitButton").on("click", function(event)
{
    console.log("hit");
    event.preventDefault();

    //grabs user input
    var trainName = $("#trainNameInput").val().trim();
    var trainDestination = $("#destinationInput").val().trim();
    var trainFirstTime = $("#firstTrainTimeInput").val().trim();
    var trainFrequency = $("#frequencyInput").val().trim();

    // Creates local "temporary" object for holding new train data
    var newTrain = {
        name: trainName,
        destination: trainDestination,
        firstArrival: trainFirstTime,
        frequency: trainFrequency,
    };

    //Uploads new train data to the database
    database.ref().push(newTrain);

    //Logs everything to console
    console.log(newTrain.name);
    console.log(newTrain.destination);
    console.log(newTrain.firstArrival);
    console.log(newTrain.frequency);

    alert("New Train has been successfully added");

    // Clears all text-boxes
    $("#trainNameInput").val("");
    $("#destinationInput").val("");
    $("#firstTrainTimeInput").val("");
    $("#frequencyInput").val("");
});

// Create firebase event for adding a row in the html when a user adds an entry.
database.ref().on("child_added", function(childSnapshot)
{
    console.log(childSnapshot.val());

    //Store everything into a variable.
    var trainName = childSnapshot.val().name;
    var trainDestination = childSnapshot.val().destination;
    var trainFirstArrival = childSnapshot.val().firstArrival;
    var trainFrequency = childSnapshot.val().frequency;

    //Train Information
    console.log(trainName);
    console.log(trainDestination);
    console.log(trainFirstArrival);
    console.log(trainFrequency);

    //Calculate minutes away
    var m = moment();
    var currentTime = m; // now
    var startOfDay =  moment().startOf('day'); // start of day

    var currentMinutes = Math.floor((currentTime - startOfDay) / 60000); // Important: divide by milliseconds in a minute to convert to minutes

    var nextArrival = calculateNextArrival(trainFirstArrival, parseInt(trainFrequency), currentMinutes);

    var trainNextArrival = convertMinutesToTimeStamp(nextArrival);
    var trainMinutesAway = nextArrival - currentMinutes;

    // Create the new row
    var newRow = $("<tr>").append(
        $("<td>").text(trainName),
        $("<td>").text(trainDestination),
        $("<td>").text(trainFrequency),
        $("<td>").text(trainNextArrival),
        $("<td>").text(trainMinutesAway)
    );

    // Append the new row to the table
    $("#train-table > tbody").append(newRow);
});

//Calculate train next arrival
function calculateNextArrival(trainFirstArrival, trainFrequency, currentMinutes)
{
    var firstArrivalInMinutes = convertTimeStampToMinutes(trainFirstArrival);

    var nextArrival = firstArrivalInMinutes;
    while(nextArrival < currentMinutes)
    {
        nextArrival += trainFrequency;
    }

    return nextArrival;
}

function convertTimeStampToMinutes(timeStamp)
{
    var isPM = timeStamp.includes("PM");
    var segments = timeStamp.split(":");
    var hour = parseInt(segments[0]);
    var minutes = parseInt(segments[1].replace(" PM", "").replace(" AM", ""));

    var result = ((isPM ? hour + 12 : hour) * 60) + minutes;
    return result;
}

function convertMinutesToTimeStamp(minutes)
{
    // determine remainder minutes
    var minutes = minutes % 60;
    // find total hours
    var hours = Math.floor(minutes / 60);
    // determine PM/AM
    var isPM = hours > 11;

    var timestamp = (isPM ? hours - 12 : hours) + ":" + ((minutes < 10) ? ("0" + minutes) : minutes) + (isPM ? " PM" : " AM");
    return timestamp;
}