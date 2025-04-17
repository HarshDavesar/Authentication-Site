const submitBtn = document.querySelector('#submitBtn');
const form = document.querySelector('#form');
const loginEmail = document.querySelector('#login-email');
const loginPassword = document.querySelector('#login-password');
const loginBtn = document.querySelector('#login-btn');

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;

// Registration Process
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

function saveData(firstName, lastName, email, password1, password2) {
    switch (true) {
        case (password1 === "" || password2 === ""):
            alert("Please enter your password!");
            break;

        case (password1 !== password2):
            alert("Passwords do not match!");
            break;

        case (!passwordRegex.test(password1)):
            alert("Password must be at least 6 characters long, contain one uppercase letter, and one special character.");
            break;

        case (!validateEmail(email)):
            alert("Invalid email format.");
            break;

        case (firstName === ""):
            alert("Enter your First Name!");
            break;

        case (lastName === ""):
            alert("Enter your Last Name!");
            break;

        default:
            fetch('/save-note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ firstName, lastName, email, password1 }),
                credentials: 'include'  // Needed for cookies
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
            const response = await fetch('/login-note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password1: password }),
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                alert("Login successful!");
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
