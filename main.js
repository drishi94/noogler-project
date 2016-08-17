

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
        console.log("user logged in!");
        this.loadQuestions();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    // Show sign-in button.
    // this.signInButton.removeAttribute('hidden');
    window.location.href = "index.html";
  }
};

Ask.prototype.loadQuestions = function() {

  //referencing messages/database
  this.questionsRef = this.database.ref('questions');
  //remove all other listeners
  this.questionsRef.off();
  var setMessage = function(data){
    var val = data.val();
    this.displayQuestion(data.key, val.name, val.text);
  }.bind(this);
  console.log(this.questionsRef.val);
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

var commentID = 0;

Ask.prototype.comment = function(id){
  commentID = commentID + 1;
  var scommentID = commentID.toString();
  var key = id.substring(14, id.length);
  var id2 = 'answer-box-list-' + key;
  this.answerBoxList = document.getElementById(id2);
  var answerBox = document.createElement("div");
  answerBox.innerHTML = '<div id="div-' + scommentID + '">' + '<form action="#" id="form-' + scommentID + '" class="comment-box">' + 
  'Comment: <input style="width:500px;" type="text" id="comment-' + scommentID +'">' + 
  '<input type="submit" value="Submit" onClick= "Ask.addComment(' + scommentID + ')"' + 
  '</form>' + '</div>';

  this.answerBoxList.appendChild(answerBox);

};

Ask.prototype.addComment = function(x){
  // console.log(x.value);
  var currentUser = this.auth.currentUser;
  if(currentUser){
    var username = currentUser.displayName;
  }
  else{
    var username = "Anonymous";
  }
  var commentID = 'comment-' + x;
  var formID = 'form-' + x;
  var commentText = document.getElementById(commentID).value;
  var form = document.getElementById(formID);

  var commentBlob = document.createElement('div');
  commentBlob.innerHTML = '<div>  <font size="3" color="red"> Name: ' + currentUser.displayName + '</font>' + 
  '<br>' +
  '<font color="blue"> Answer: </font>' + commentText +
  '</div>';
  // var commentBlob = '<div> Name:' + currentUser.displayName + '</div>';

  form.insertBefore(commentBlob, form.firstChild);


};

//answer-box-list-KPM9oKytHHxTpCR7iJ-
//answer-button-KPM9oKytHHxTpCR7iJ-
// Ask.prototype.saveAnswer = function(){
//   var currentUser = this.auth.currentUser;
//   this.answersRef.push({name: currentUser.displayName, text: this.answerInput.value});
// }


window.onload = function() {
  window.Ask = new Ask();
};