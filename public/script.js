const submitBtn = document.querySelector('#submitBtn');
const form = document.querySelector('#form');
const loginEmail = document.querySelector('#login-email');
const loginPassword = document.querySelector('#login-password');
const loginBtn = document.querySelector('#login-btn');


// Registration Process (Sign Up)
if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const firstName = document.querySelector('#firstName').value.trim();
        const lastName = document.querySelector('#lastName').value.trim();
        const email = document.querySelector('#email').value.trim();
        const password1 = document.querySelector('#password1').value.trim();
        const password2 = document.querySelector('#password2').value.trim();

        saveData(firstName, lastName, email, password1, password2);
    });
}

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;

// Save data to backend   SignUp
function saveData(firstName, lastName, email, password1, password2) {
    switch (true) {
        case (password1 === "" || password2 === ""):
            alert("Please enter your password!");
            break;

        case (password1 !== password2):
            alert("Passwords do not match!");
            break;
            
            case(!passwordRegex.test(password1)):
            alert("Password must be at least 6 characters long, contain at least one uppercase letter, and one special character."); 
            break;

        case (!validateEmail(email)):
            alert("Invalid email! It must contain exactly one '@' and not at the start or end.");
            break;

        case (firstName === ""):
            alert("Enter your First Name!");
            break;

        case (lastName === ""):
            alert("Enter your Last Name!");
            break;

        default:
           

            fetch('http://localhost:3000/save-note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstName, lastName, email, password1 })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert(data.message);
                        form.reset();
                        window.location.href = 'main.html'; 
                        

                    } else {
                        alert(data.message);
                    }
                })
                .catch(err => {
                    console.error('Error:', err);
                    alert('Something went wrong!');
                });
    }
}

// Login
if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();

        if (!email || !password) {
            alert("Please fill in both email and password!");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/login-note", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password1: password })
            });

            const result = await response.json();

            if (result.success) {
                alert("Login successful!");
                // Redirect or update UI here

                window.location.href = 'main.html';
            } else {
                alert(result.message || "Login failed.");
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("Something went wrong. Please try again later.");
        }
    });





}



// Email validation 
function validateEmail(email) {
    const atIndex = email.indexOf("@");
    return (
        atIndex > 0 &&
        atIndex === email.lastIndexOf("@") &&
        atIndex < email.length - 1
    );
}

// function deleteAcc() {
  
  
    
  
//     fetch("http://localhost:3000/delete-account", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({ email, password1: password })
//     })
//       .then(res => res.json())
//       .then(data => {
//         if (data.success) {
//           alert(data.message);
//           window.location.href = "login.html"; 
//         } else {
//           alert(data.message);
//         }
//       })
//       .catch(err => {
//         console.error("Error deleting account:", err);
//         alert("Something went wrong while deleting the account.");
//       });
//   }
  

//*************************** */


  