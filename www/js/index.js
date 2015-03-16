var questions = []; //store all question objects
var index = 0; //keep track of number of questions in array

var questionText; //a single question's text
var latLong; //a single question's location


function Question(t, loc, i) {
    this.text = t;
    this.location = loc;
    this.yes = 0;
    this.no = 0;
    this.comment = [];
    this.index = i;
}

function init(){
    //This will run when the page is ready
    alert("init");
    
    //document.getElementById('myContent').innerHTML = "init";
    //Run device ready when phonegap is loaded
    document.addEventListener("deviceready", deviceReady, false);
}

function deviceReady() {
                //Run any Phonegap specific code here
    alert("deviceready");
    //document.getElementById('myContent').innerHTML = "deviceready";
    //console.log("deviceready");
    $('#question-button').click(function(){
            alert("triggered map");
            navigator.geolocation.getCurrentPosition(onSuccess, onFail);
            // get value from textfield
            questionText = $('#my-question').val();
    });


    // create and save new question
    $('#save-button').click(function(){
        alert("saved question");
        var question = new Question(questionText, latLong, index);
        questions.push(question);
        console.log(questions);
        $('#question-list').append(
            '<div class="question-area">\
                <div class="question-all" data-index="' + question.index + '">\
                    <h1>' + question.text + '</h1>\
                </div>\
                <div class="yes-and-no">\
                    <a href="#" id="yes" class="ui-btn ui-btn-inline">yes</a>\
                    <a href="#" id="no" class="ui-btn ui-btn-inline">no</a>\
                </div>\
            </div>');

        index++;
    });

    // open single question 
    $(document).on('tap', '.question-all', function(){ //for elements appended to html
        var i = $(this).attr('data-index');
        console.log(questions[i]);
        $.mobile.changePage('#pg-question-single');

        $('#pg-question-single .question-details').html(
            '<div class="question-single-all">\
                <h1>'+ questions[i].text + '</h1>\
                <a href="#" id="yes" class="ui-btn ui-btn-inline">yes</a>\
                <a href="#" id="no" class="ui-btn ui-btn-inline">no</a>\
                <div class="question-comments">\
                    <p>comment 1</p>\
                </div>\
            </div>');
        return false;
    });
}


function onSuccess(position){
    console.log(position);

    var longitude = position.coords.longitude;
    var latitude = position.coords.latitude;
    latLong = new google.maps.LatLng(latitude, longitude);

    var mapOptions = {
            center: latLong,
            zoom: 16,
            disableDefaultUI: true
            //mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var mapCenter = document.getElementById("map");

    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    // document.getElementById("map").innerHTML = map;

    var marker = new google.maps.Marker({
        position: mapCenter.getCenter(),
        map: map,
        title: 'my location'
    });

    // google.maps.event.addListener(map, 'center_changed', function() {
    //             // 0.1 seconds after the center of the map has changed,
    //             // set back the marker position.
                
    //               var center = mapCenter.getCenter();
    //               marker.setPosition(center);
                
    // });
    alert("Your location " + latLong);
    var newQuestion = new Question();
}

function onFail(message){
    alert('code: ' + error.code + '\n' + 'message' + error.message + '\n');
}






//Setup this to run init when page loads
window.addEventListener('load', init, false);
