function Ask(){
  this.questionList = document.getElementById('questions')
  this.questionForm = document.getElementById('question-form');
  this.signOutButton = document.getElementById('sign-out');
  this.submitButton = document.getElementById('submit');
  this.questionInput = document.getElementById('question');

  //Add Event Handlers for Sign out and Submit Message

  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.questionForm.addEventListener('submit', this.saveQuestion.bind(this));

  // this.answerButton = document.getElementsByClassName('answer-button');
  // this.answerButton = addEventListener('click', this.introBox.bind(this));

  //Image Stuff:

  this.submitImageButton = document.getElementById('submitImage');
  this.imageForm = document.getElementById('image-form');
  this.mediaCapture = document.getElementById('mediaCapture');

  // this.answerButton = addEventListener('click', this.introBox.bind(this));
    // Toggle for the button.
  // var buttonTogglingHandler = this.toggleButton.bind(this);
  // this.messageInput.addEventListener('keyup', buttonTogglingHandler);
  // this.messageInput.addEventListener('change', buttonTogglingHandler);

  this.initFirebase();
}

Ask.QUESTION_TEMPLATE =
    '<div class="question-container">' +
      '<div class="message"></div>' +
      '<div class="name"></div>' +
    '</div>';

Ask.prototype.initFirebase = function() {
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();

  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

Ask.prototype.signOut = function() {
  // TODO(DEVELOPER): Sign out of Firebase.
  this.auth.signOut();
};


Ask.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
        this.loadQuestions();
        this.loadAnswers();
  } else { // User is signed out!
    window.location.href = "index.html";
  }
};

Ask.prototype.loadQuestions = function() {
  console.log("in load questions");
  var currentUser = this.auth.currentUser;
  var email = currentUser.email;
  var domain = email.split("@")[1].split(".")[0];
  var dbRef = '/' + domain + '/' + 'questions';
  this.questionsRef = this.database.ref(dbRef);
  //remove all other listeners
  this.questionsRef.off();
  var setMessage = function(data){
    var val = data.val();
    this.displayQuestion(data.key, val.name, val.text);
  }.bind(this);
  this.questionsRef.limitToLast(20).on('child_added', setMessage);
  this.questionsRef.limitToLast(20).on('child_changed', setMessage);
  };


Ask.prototype.displayQuestion = function(key, name, text){
  var div = document.getElementById(key);
  if(!div){
    var container = document.createElement('div');
    container.innerHTML = 
    '<div class="question-container" align="left" style="margin-bottom: 100px;">' +
      '<h2 class="question" style="margin-left:50px"></h2>' +
      '<div class="name" style= "margin-left:50px"></div>' +
      '<div class="response-buttons>' + '<button class="answer-button" id="answer-button' + key + '" onClick="Ask.comment(this.id)" style="border:none; background-color: white; text-align: center; font-size: 16px; color: blue; padding: 10px 10px; margin-left:45px;"> Answer </button>' +
      '<button style="border:none; background-color: white; text-align: center; font-size: 16px; color: green; padding: 10px 10px; margin-left:45px;"> Upvote </button>' +
      '</div>' +
      '<div id = "answer-box-list' + key + '"> </div>' +

    '</div>';
    div = container.firstChild;
    div.setAttribute('id', key);
    var allQuestions = document.getElementById('questions');
    this.questionList.insertBefore(div, allQuestions.firstChild);
  }

  div.querySelector('.name').textContent = "Asked by: " + name;
  var questionElement = div.querySelector('.question');
  questionElement.textContent = text;
  questionElement.innerHTML = questionElement.innerHTML.replace(/\n/g, '<br>');

  setTimeout(function() { div.classList.add('visible')}, 1);
  this.questionList.scrollTop = this.questionList.scrollHeight;
  this.questionInput.focus();
};


Ask.prototype.saveQuestion = function(){
  //NEED TO ADD THE ACTUAL QUESTION 
  var currentUser = this.auth.currentUser;
  this.questionsRef.push({name: currentUser.displayName, text:this.questionInput.value})
};

Ask.prototype.comment = function(id){
  var currentUser = this.auth.currentUser;
  var email = currentUser.email;
  var domain = email.split("@")[1].split(".")[0];
  var dbRef = '/' + domain + '/' + 'commentID';
  var commentRef = this.database.ref(dbRef);
  var commentIDval = 0;
  commentRef.on('value', function(data) {
    commentIDval = data.val();
  });
  commentIDval_update = commentIDval + 1; 
  this.database.ref(dbRef).set(commentIDval_update);

  var key = id.substring(14, id.length);

  var scommentID = commentIDval_update.toString() + '-.-' + key;

  var id2 = 'answer-box-list-' + key;
  this.answerBoxList = document.getElementById(id2);
  var answerBox = document.createElement("div");
  answerBox.innerHTML = '<div id="div-' + scommentID + '">' + '<form action="#" id="form-comment-' + scommentID + '" class="comment-box">' + 
  'Comment: <input style="width:500px;" type="text" id="comment-' + scommentID +'">' + 
  '<input type="submit" value="Submit" onClick= "Ask.addComment(\'' + scommentID + '\')"' + 
  '</form>' + '</div>';

  this.answerBoxList.appendChild(answerBox);

};

Ask.prototype.addComment = function(x){
  var currentUser = this.auth.currentUser;
  if(currentUser){
    var username = currentUser.displayName;
  }
  else{
    var username = "Anonymous";
  }
  var cid_key = x.split("-.-");
  var y = cid_key[0];
  var key = cid_key[1];

  var commentID = 'comment-' + x;
  var formID = 'form-comment-' + y;
  var commentText = document.getElementById(commentID).value;

  this.answersRef.push({name: username, text: commentText, commentID: x, k: key})
  this.displayComment(username, commentText, x, key);
};

Ask.prototype.displayComment = function(name, commentText, x, key){

  var postedCommentID = 'posted-' + x;

  if (document.getElementById(postedCommentID)) {
    var oldComment = document.getElementById(postedCommentID)
    oldComment.innerHTML = '<div align="left" id="' + postedCommentID + '">  <font size="3" color="red"> Name: ' + name + '</font>' + 
  '<br>' +
  '<font color="blue"> Answer: </font>' + commentText +
  '</div>';
  }
  else{
  var commentID = 'comment-' + x;
  var formID = 'form-comment-' + x;
  var commentBlob = document.createElement('div');
  // var form = document.getElementById(formID);
  var divID = "answer-button-" + key;

  var div2 = document.getElementById(divID)
  commentBlob.innerHTML = '<div align="left" id="' + postedCommentID + '">  <font size="3" color="red"> Name: ' + name + '</font>' + 
  '<br>' +
  '<font color="blue"> Answer: </font>' + commentText +
  '</div>';
  // var commentBlob = '<div> Name:' + currentUser.displayName + '</div>';
  // form.insertBefore(commentBlob, form.firstChild);
  div2.appendChild(commentBlob);
}
};

Ask.prototype.loadAnswers = function(){
  var currentUser = this.auth.currentUser;
  var email = currentUser.email;
  var domain = email.split("@")[1].split(".")[0];
  var dbRef = '/' + domain + '/' + 'answers';

  //referencing messages/database

  this.answersRef = this.database.ref(dbRef);
  this.answersRef.off();
  var setComment = function(data){
    var val = data.val();
    this.displayComment(val.name, val.text, val.commentID, val.k)
  }.bind(this);
  this.answersRef.limitToLast(20).on('child_added', setComment);
  this.answersRef.limitToLast(20).on('child_changed', setComment);

};


Ask.prototype.saveImageMessage = function(event){
  var fyle = event.target.files[0];
  this.imageForm.reset();
  var currentUser = this.auth.currentUser;
  this.questionsRef.push({name: currentUser.displayName}).then()

}



// Ask.prototype.saveAnswer = function(userName, commentText, cid){
//   var currentUser = this.auth.currentUser;
//   this.answersRef.push({name: name, text: commentText, commentID: cid})
// }

//answer-box-list-KPM9oKytHHxTpCR7iJ-
//answer-button-KPM9oKytHHxTpCR7iJ-
// Ask.prototype.saveAnswer = function(){
//   var currentUser = this.auth.currentUser;
//   this.answersRef.push({name: currentUser.displayName, text: this.answerInput.value});
// }


window.onload = function() {
  window.Ask = new Ask();
};

//The problem is that set comment is being called everytime you comment! Not just on Load Answers. 
//Form is Null because when loadAnswers is called there is no form!