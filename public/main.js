const logout = document.querySelector('#logout');
const deleteacc = document.querySelector('#deleteacc');
const showEmail = document.querySelector('#showEmail');

// Show email on page load
document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:3000/get-user-email', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.email) {
            showEmail.innerHTML = data.email;  // Display the email in the span
        } else {
            console.error("Failed to fetch user email:", data.message);
            alert("Could not fetch email. Please log in again.");
        }
    })
    .catch(err => {
        console.error('Error fetching email:', err);
        alert("Something went wrong while fetching the email.");
    });
});

// Handle logout
logout.addEventListener('click', (e) => {
    e.preventDefault();
    alert("Logged out!");
    window.location.href = 'index.html';
});

// Handle account deletion
deleteacc.addEventListener('click', (e) => {
    e.preventDefault();

    const email = showEmail.innerHTML;  // Use the email displayed on the page
    const password = prompt("Enter your password to confirm account deletion:");

    if (password) {
        fetch('http://localhost:3000/delete-account', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password1: password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Account deleted successfully!");
                window.location.href = 'index.html';  // Redirect after deletion
            } else {
                alert("Error deleting account: " + data.message);
            }
        })
        .catch(err => {
            console.error("Error deleting account:", err);
            alert("Something went wrong while deleting the account.");
        });
    } else {
        alert("Password is required to delete the account.");
    }
});
