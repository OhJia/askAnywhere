Parse.initialize("Ljr2dQpbEZnH3mw1RImWBlsiFWdZzB7eUyuEZGms", "GcX4fuwjHRIS7ArKy0sie6szsMguAs7MgLYqwgLi");


var questionText; //a single question's text
var latLong; //a single question's location


var Question = Parse.Object.extend("Question");
var query = new Parse.Query(Question);

var Comment = Parse.Object.extend("Comment");
var queryComm = new Parse.Query(Comment);

var resultQuestion;
var par;


function init(){
    //This will run when the page is ready
    alert("init");  

    
    
    //Run device ready when phonegap is loaded
    document.addEventListener("deviceready", deviceReady, false);
}

function deviceReady() {
                //Run any Phonegap specific code here
    alert("device is ready");

    // $(document).on("pageshow", "#pg-question-list", function(){
    //     loadAllQuestions();
    // });

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

    $(document).on('click', '#question-button', function(){
        // get value from textfield
        questionText = $('#my-question').val();
    });

    //when #pg-question-location shows, get geolocation
    $(document).on("pageshow", "#pg-question-location", function(){
        navigator.geolocation.getCurrentPosition(onSuccess, onFail);
    });


    // create and save new question
    $('#save-button').click(function(){
        var question = new Question();

        question.save({
            text: questionText,
            location: latLong,
            yes: 0,
            no: 0, 
            comments: 0          
        }).then(function(object) {
            alert("yay! question " +question.id+ "saved.");
        });        
        console.log(question);
    });
    
    // when #pg-question-list shows, show all questions
    $(document).on("pageshow", "#pg-question-list", function(){
        loadAllQuestions();
    });


    // open single question 
    $(document).on('tap', '.question-all-text', function(){ //for elements appended to html
        var qID = $(this).attr('data-id');
        $.mobile.changePage( $('#pg-question-single') );
        console.log("opening: " + qID);

        var q = new Parse.Query(Question);
        //console.log(q);

        q.get(qID, {
            success: function(results){
                console.log(results);
                resultQuestion = results;
                 $('#pg-question-single .question-details').html(
                    '<div id="question-map" data-id="' + qID + '"></div>\
                    <div class="question-single-all">\
                        <h1>'+ results.attributes.text + '</h1>\
                        <a href="#" class="yes ui-btn ui-btn-inline" data-id="' + qID + '">yes</a>\
                        <a href="#" class="no ui-btn ui-btn-inline" data-id="' + qID + '">no</a>\
                    </div>\
                    <div class="comment-count"></div>\
                    <div class="question-comments-area"></div>');
                 showQuestionMap(results.attributes.location.k, results.attributes.location.D);
                 newComment(results.id);
                 showComments(resultQuestion);
            },
            error: function(object, error){
                alert("Error: " + error.code + " " + error.message);
            }
        });
        return false;
    });
    
    // create new comment object after submitting a new comment
    $(document).on('click', '#comment-button', function(){
        var nComm = $('#my-comment').val();
        console.log("New comment: " + nComm);

        var comment = new Comment();
        comment.save({
            text: nComm,
            parent: resultQuestion        
        }).then(function(object) {
            alert("yay! comment " +comment.attributes.text+ " saved.");
        });   
        // add to # of comments
        resultQuestion.increment("comments");
        resultQuestion.save();  
        // clear comment text field                     
        newComment(resultQuestion.id);
        // query for comments that are children of this question, display them
        par = comment.get("parent");
        showComments(par);
    });


    // increase # of yes
    $(document).on('click', '.yes', function(){
         var qID = $(this).attr('data-id');
         console.log(qID);

        var q = new Parse.Query(Question);

        q.get(qID, {
            success: function(results){
                results.increment("yes");
                results.save();
                console.log(results);
            },
            error: function(object, error){
                alert("Error: " + error.code + " " + error.message);
            }
        });
    });

    // increase # of no
    $(document).on('click', '.no', function(){
         var qID = $(this).attr('data-id');
         console.log(qID);

        var q = new Parse.Query(Question);

        q.get(qID, {
            success: function(results){
                results.increment("no");
                results.save();
                console.log(results);
            },
            error: function(object, error){
                alert("Error: " + error.code + " " + error.message);
            }
        });
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

function showComments(par){
    queryComm.equalTo("parent", par);

        queryComm.find({
            success: function(results) {
                
                alert("successfully retrieved " + results.length + "comments");
                var comm = '';
                if (results.length > 0) {        
                    for (var i = results.length-1; i >= 0; i--) {
                        comm += '<p>' + results[i].attributes.text + '</p>';           
                    }
                } else {
                        comm ='<p>Be the first to comment.</p>';
                    }

                    $('.ppls-comments').html(comm);
                
            },
            error: function(error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });
}

function showQuestionMap(qLat, qLong){
    var c = new google.maps.LatLng(qLat, qLong);
    console.log(qLat, qLong);
    var mapOptions = {
        zoom: 16,
        // center: [qLat, qLong],
        center: c,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById('question-map'),mapOptions);

    var marker = new google.maps.Marker({
      position: c,
      map: map,
      //title: 'Hello World!'
    });

    //console.log('question mapOptions: '+mapOptions);
}

function loadAllQuestions(){
    // $('#pg-question-list').on('load', function(){
    //navigator.geolocation.getCurrentPosition(onSuccess, onFail);
        query.find({
            success: function(results) {
                
                alert("successfully retrieved " + results.length + "questions");
                
                $('#question-list').html('');
                for (var i = results.length-1; i >= 0; i--){
                    var q = results[i];
                    console.log("var q: ", q);
                    $('#question-list').append(
                        '<div class="question-area">\
                            <div class="question-all" data-id="' + q.id + '">\
                                <div class="question-all-text" data-id="' + q.id  + '">\
                                    <h1>' + q.attributes.text + '</h1>\
                                </div>\
                                <div class="yes-and-no">\
                                    <div class="yes">\
                                    <a href="#" class="" data-id="' + q.id  + '">yes</a>\
                                    </div>\
                                    <div class="no">\
                                    <a href="#" class="" data-id="' + q.id  + '">no</a>\
                                    </div>\
                                </div>\
                                <div class="comment-count" data-id="' + q.id  + '">'+ q.attributes.comments +' comments</div>\
                            </div>\
                        </div>');
                    if (i % 2 === 0){
                        $('.question-area:nth-child(even)').addClass('area-white');
                    } 
                }
            },
            error: function(error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });             
}









//Setup this to run init when page loads
window.addEventListener('load', init, false);
