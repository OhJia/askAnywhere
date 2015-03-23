Parse.initialize("Ljr2dQpbEZnH3mw1RImWBlsiFWdZzB7eUyuEZGms", "GcX4fuwjHRIS7ArKy0sie6szsMguAs7MgLYqwgLi");


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


    var TestObject = Parse.Object.extend("TestObject");
    var testObject = new TestObject();
    testObject.save({foo: "bar"}).then(function(object) {
      alert("yay! it worked");
    });
    
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
        //alert("triggered map");        
        // get value from textfield
        questionText = $('#my-question').val();
    });

    $(document).on("pageshow", "#pg-question-location", function(){
        navigator.geolocation.getCurrentPosition(onSuccess, onFail);
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
                        <a href="#" class="yes ui-btn ui-btn-inline" data-index="' + question.index + '">yes</a>\
                        <a href="#" class="no ui-btn ui-btn-inline" data-index="' + question.index + '">no</a>\
                    </div>\
                    <div class="comment-count" data-index="' + question.index + '"></div>\
                </div>\
            </div>');
        index++;
    });
    
    // update comment count when #pg-question-list shows
    $(document).on("pageshow", "#pg-question-list", function(){
    // $('#pg-question-list').on('load', function(){
        for (var i = 0; i < questions.length; i++){
                $('.comment-count[data-index="' + i + '"]').html(questions[i].comment.length + ' comments');
                console.log('comment Index '+ i + ',comment count: ' + questions[i].comment.length);
            
        }              
    });

    // open single question 
    $(document).on('tap', '.question-all-text', function(){ //for elements appended to html
        var i = $(this).attr('data-index');
        console.log(questions[i]);
        $.mobile.changePage('#pg-question-single');

         $('#pg-question-single .question-details').html(
            '<div id="question-map" data-index="' + questions[i].index + '"></div>\
            <div class="question-single-all">\
                <h1>'+ questions[i].text + '</h1>\
                <a href="#" class="yes ui-btn ui-btn-inline" data-index="' + questions[i].index + '">yes</a>\
                <a href="#" class="no ui-btn ui-btn-inline" data-index="' + questions[i].index + '">no</a>\
            </div>\
            <div class="comment-count"></div>\
            <div class="question-comments-area"></div>');
        $('.comment-count').html(questions[i].comment.length + ' comments');

        //showQuestionMap(questions[i].location);
        newComment(questions[i].index);
        showComments(questions[i].comment.length, questions[i].comment);
        //console.log('comments: ' + questions[i].comment);
        return false;
    });
    
    // show map when #pg-question-single shows
    $(document).on("pageshow", "#pg-question-single", function(){
        var index = $('#question-map').attr('data-index');
        showQuestionMap(questions[index].location);
        console.log('question location: '+ questions[index].location );
    });

    // add to a question's comments
    $(document).on('click', '#comment-button', function(){
        var i = $(this).attr('data-index');
        var nComm = $('#my-comment').val();
        console.log("New comment: " + nComm);
        console.log("index: " + i);
        questions[i].comment.push(nComm);
        newComment(questions[i].index);
        showComments(questions[i].comment.length, questions[i].comment);
        $('.comment-count').html(questions[i].comment.length + ' comments');
    });


    // increase # of yes
    $(document).on('click', '.yes', function(){
        var i = $(this).attr('data-index');
        console.log(questions[i]);
        questions[i].yes++;
        console.log(questions[i].yes);
        $(this).find('.yes-num').html(questions[i].yes);
    });

    // increase # of no
    $(document).on('click', '.no', function(){
        var i = $(this).attr('data-index');
        console.log(questions[i]);
        questions[i].no++;
        console.log(questions[i].no);
        $(this).find('.no-num').html(questions[i].no);
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
            disableDefaultUI: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

    $('<div/>').addClass('centerMarker').appendTo(map.getDiv());

    google.maps.event.addListener(map, 'dragend', function() {
        center = map.getCenter();
        console.log(center);
        updateLocation(center);
    });

    //alert("Your location " + latLong);
}

function onFail(message){
    alert('code: ' + error.code + '\n' + 'message' + error.message + '\n');
}

function updateLocation(position) {
    latLong = new google.maps.LatLng(position.lat(), position.lng());
    console.log('new latLong: '+latLong);
}

function newComment(index){
    $('#pg-question-single .question-comments-area').html(
        '<div class="new-comment-field">\
            <form method="get" action="">\
                <fieldset class="ui-field-contain">\
                    <label for="basicfield" class="ui-hidden-accessible">Your comment</label>\
                    <textarea id="my-comment" placeholder="My comment"></textarea>\
                </fieldset>\
                <a href="#" id="comment-button" class="ui-btn"  data-index="' + index + '">submit</a>\
           </form>\
            </div>\
        </div>');
}

function showComments(commentLength, comments){
    console.log(commentLength + ',' + comments);
    var comm = '';
    if (commentLength > 0) {        
        for (var i = commentLength-1; i >= 0; i--) {
            comm += '<p>' + comments[i] + '</p>';           
        }
    } else {
            comm ='<p>Be the first to comment.</p>';
        }

        $('.ppls-comments').html(comm);
}

function showQuestionMap(qLatLong){
    var mapOptions = {
        zoom: 16,
        center: qLatLong,
        disableDefaultUI: true
    };

    var map = new google.maps.Map(document.getElementById('question-map'),mapOptions);

    var marker = new google.maps.Marker({
      position: qLatLong,
      map: map,
      //title: 'Hello World!'
    });

    //console.log('question mapOptions: '+mapOptions);
}









//Setup this to run init when page loads
window.addEventListener('load', init, false);
