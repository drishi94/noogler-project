

function Ask(){
  this.checkSetup();

  this.questionList = document.getElementById('questions')
  this.questionForm = document.getElementById('question-form');
	this.signOutButton = document.getElementById('sign-out');
  this.submitButton = document.getElementById('submit');
	this.questionInput = document.getElementById('question');

  //Add Event Handlers for Sign out and Submit Message

  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.questionForm.addEventListener('submit', this.saveQuestion.bind(this));

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
  this.questionsRef.limitToLast(12).on('child_added', setMessage);
  this.questionsRef.limitToLast(12).on('child_changed', setMessage);
  };


Ask.prototype.displayQuestion = function(key, name, text){
  var div = document.getElementById(key);
  if(!div){
    var container = document.createElement('div');
    container.innerHTML = 
    '<div class="question-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="question"></div>' +
      '<div class="name"></div>' +
    '</div>';
    div = container.firstChild;
    div.setAttribute('id', key);
    this.questionList.appendChild(div);
  }

  div.querySelector('.name').textContent = name;
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

Ask.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions.');
  } else if (config.storageBucket === '') {
    window.alert('Your Firebase Storage bucket has not been enabled. Sorry about that. This is ' +
        'actually a Firebase bug that occurs rarely. ' +
        'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
        'and make sure the storageBucket attribute is not empty. ' +
        'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
        'displayed there.');
  }
};



// Ask.prototype.signOut = function() {
//   	window.location.href = "index.html";

  // this.auth.signOut();
// }

window.onload = function() {
  window.Ask = new Ask();
};