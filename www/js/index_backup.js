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

    // start new question
    $('#question-new').click(function(){
        $('#pg-new-question').html(
            '<form method="get" action="">\
                <fieldset class="ui-field-contain">\
                    <label for="basicfield" class="ui-hidden-accessible">Your question</label>\
                    <textarea id="my-question" placeholder="My question"></textarea>\
                </fieldset>\
                <a href="#pg-question-location" id="question-button" class="ui-btn">next</a>\
            </form>');
    });

    //document.getElementById('myContent').innerHTML = "deviceready";
    //console.log("deviceready");
    $(document).on('click', '#question-button', function(){
    // $('#question-button').click(function(){
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
                    <div class="question-all-text" data-index="' + question.index + '">\
                        <h1>' + question.text + '</h1>\
                    </div>\
                    <div class="yes-and-no">\
                        <a href="#" class="yes ui-btn ui-btn-inline" data-index="' + question.index + '">\
                            yes</a>\
                        <a href="#" class="no ui-btn ui-btn-inline" data-index="' + question.index + '">no</a>\
                    </div>\
                </div>\
            </div>');

        index++;
    });

    // open single question 
    $(document).on('tap', '.question-all-text', function(){ //for elements appended to html
        var i = $(this).attr('data-index');
        console.log(questions[i]);
        $.mobile.changePage('#pg-question-single');

         $('#pg-question-single .question-details').html(
            '<div class="question-single-all">\
                <h1>'+ questions[i].text + '</h1>\
                <a href="#" class="yes ui-btn ui-btn-inline" data-index="' + questions[i].index + '">yes</a>\
                <a href="#" class="no ui-btn ui-btn-inline" data-index="' + questions[i].index + '">no</a>\
                <div class="question-comments-area">\
                    <div class="new-comment-field">\
                        <form method="get" action="">\
                            <fieldset class="ui-field-contain">\
                                <label for="basicfield" class="ui-hidden-accessible">Your comment</label>\
                                <textarea id="my-comment" placeholder="My comment"></textarea>\
                            </fieldset>\
                            <a href="#" id="comment-button" class="ui-btn"  data-index="' + questions[i].index + '">submit</a>\
                       </form>\
                    </div>\
                </div>\
            </div>');

        showComments(questions[i].comment.length, questions[i].comment);
        //console.log('comments: ' + questions[i].comment);
        return false;
    });

    // add to a question's comments
    $(document).on('click', '#comment-button', function(){
        var i = $(this).attr('data-index');
        var nComm = $('#my-comment').val();
        console.log("New comment: " + nComm);
        console.log("index: " + i);
        questions[i].comment.push(nComm);
        showComments(questions[i].comment.length, questions[i].comment);
    });


    // increase # of yes
    $(document).on('click', '.yes', function(){
        var i = $(this).attr('data-index');
        console.log(questions[i]);
        questions[i].yes++;
        console.log(questions[i].yes);
    });

    // increase # of no
    $(document).on('click', '.no', function(){
        var i = $(this).attr('data-index');
        console.log(questions[i]);
        questions[i].no++;
        console.log(questions[i].no);
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

function showComments(commentLength, comments){
    console.log(commentLength + ',' + comments);
    var comm = '';
    if (commentLength > 0) {        
        for (var i = 0; i < commentLength; i++) {
            comm += '<p>' + comments[i] + '</p>';           
        }
    } else {
            comm ='<p>Be the first to comment.</p>';
        }

        $('.ppls-comments').html(comm);
}






//Setup this to run init when page loads
window.addEventListener('load', init, false);
