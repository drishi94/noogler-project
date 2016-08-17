

function Ask(){
	this.checkSetup();

	this.signOutButton = document.getElementById('sign-out');
	this.signOutButton.addEventListener('click', this.signOut.bind(this));

	this.initFirebase();
}

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
        this.loadMessages();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    // Show sign-in button.
    // this.signInButton.removeAttribute('hidden');
    window.location.href = "index.html";
  }
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