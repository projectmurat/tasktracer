document.addEventListener('DOMContentLoaded', function () {

     const loginContainer = document.getElementById('login-container');
     const appContainer = document.getElementById('app-container');
     const loginForm = document.getElementById('login-form');
     const emailInput = document.getElementById('email');
     const passwordInput = document.getElementById('password');
     const loginError = document.getElementById('login-error');
     const logoutButton = document.getElementById('logout-button');

     firebase.auth().onAuthStateChanged(user => {
          if (user) {
               console.log('User is logged in:', user.email);
               loginContainer.style.display = 'none';
               appContainer.style.display = 'block';

               if (typeof refreshTasks === 'function') {
                    refreshTasks();
               }

          } else {
               console.log('User is logged out.');
               loginContainer.style.display = 'flex';
               appContainer.style.display = 'none';
          }
     });

     loginForm.addEventListener('submit', (e) => {
          e.preventDefault();

          const email = emailInput.value;
          const password = passwordInput.value;

          firebase.auth().signInWithEmailAndPassword(email, password)
               .then((userCredential) => {
                    loginError.style.display = 'none';
               })
               .catch((error) => {
                    console.error("Login Error:", error.code, error.message);
                    loginError.textContent = "Hatalı e-posta veya şifre. Lütfen tekrar deneyin."; // Display a user-friendly message
                    loginError.style.display = 'block';
               });
     });

     logoutButton.addEventListener('click', () => {
          firebase.auth().signOut().then(() => {
               console.log('Signed out successfully');
          }).catch((error) => {
               console.error('Sign out error:', error);
          });
     });

});