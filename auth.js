document.addEventListener('DOMContentLoaded', function () {

     const loginContainer = document.getElementById('login-container');
     const appContainer = document.getElementById('app-container');
     const authLoader = document.getElementById('auth-loader');
     const loginForm = document.getElementById('login-form');
     const emailInput = document.getElementById('email');
     const passwordInput = document.getElementById('password');
     const loginError = document.getElementById('login-error');
     const logoutButton = document.getElementById('logout-button');

     firebase.auth().onAuthStateChanged(user => {
          authLoader.style.display = 'none';

          if (user) {
               loginContainer.style.display = 'none';
               appContainer.style.display = 'block';

               const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    background: '#2d333d',
                    color: '#d6d6d6',
                    didOpen: (toast) => {
                         toast.addEventListener('mouseenter', Swal.stopTimer)
                         toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
               });

               Swal.fire({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3500,
                    timerProgressBar: true,
                    html: `
                         <div class="custom-toast-content">
                              <i class="fas fa-check-circle custom-toast-icon"></i>
                              <div class="custom-toast-text">
                                   <strong>Giriş Başarılı</strong>
                                   <span>Tekrar hoş geldiniz!</span>
                              </div>
                         </div>
                    `,
                    icon: undefined,

                    customClass: {
                         popup: 'gradient-toast'
                    },

                    didOpen: (toast) => {
                         toast.addEventListener('mouseenter', Swal.stopTimer)
                         toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
               });

          } else {

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
                    loginError.textContent = "Hatalı e-posta veya şifre. Lütfen tekrar deneyin.";
                    loginError.style.display = 'block';
               });
     });

     logoutButton.addEventListener('click', () => {
          Swal.fire({
               title: 'Emin misiniz?',
               text: "Oturumu kapatmak istediğinizden emin misiniz?",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#007bff',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Evet, çıkış yap!',
               cancelButtonText: 'İptal',
               background: '#2d333d',
               color: '#d6d6d6'

          }).then((result) => {
               if (result.isConfirmed) {
                    firebase.auth().signOut().then(() => {
                         Swal.fire({
                              title: 'Başarılı!',
                              text: 'Oturumunuz güvenli bir şekilde kapatıldı.',
                              icon: 'success',
                              timer: 2000,
                              showConfirmButton: false,
                              background: '#2d333d',
                              color: '#d6d6d6'
                         });


                    }).catch((error) => {
                         console.error('Sign out error:', error);
                         Swal.fire(
                              'Hata!',
                              'Çıkış yapılırken bir sorun oluştu.',
                              'error'
                         );
                    });
               }
          });
     });

});