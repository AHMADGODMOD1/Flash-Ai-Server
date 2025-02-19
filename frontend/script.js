function checkKey() {
         let enteredKey = document.getElementById("keyInput").value;
         let users = JSON.parse(localStorage.getItem("users")) || [];
         let isValid = users.some(user => user.key === enteredKey);

         if (isValid) {
             localStorage.setItem("isLoggedIn", "true");
             showHomePage();
         } else {
             document.getElementById("message").innerText = "Invalid Key!";
         }
     }

     function showHomePage() {
         document.getElementById("loginBox").style.display = "none";
         document.getElementById("homeBox").style.display = "block";
     }

     function logout() {
         localStorage.removeItem("isLoggedIn");
         location.reload();
     }

     if (localStorage.getItem("isLoggedIn") === "true") {
         showHomePage();
     }
