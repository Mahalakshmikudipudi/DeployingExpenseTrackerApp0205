async function login(e) {
    try {
        e.preventDefault();

        const loginDetails = {
            email: e.target.email.value,
            password: e.target.password.value
        };
        console.log("Logging in with:", loginDetails);

        const response = await axios.post("http://localhost:5000/user/login", loginDetails);

        if (response.status === 200) {
            alert(response.data.message);
            console.log(response.data);

            localStorage.setItem("token", response.data.token); // Store JWT Token
            window.location.href = "../html/expense.html"; // Redirect to expense page
            
            // Clear input fields after successful login
            e.target.email.value = "";
            e.target.password.value = "";
        }
    } catch (err) {
        console.log("Login Error:", err.response ? err.response.data.message : err.message);

        // Show error message in UI
        document.body.innerHTML += `<div style="color:red;">${err.response ? err.response.data.message : err.message}</div>`;
    }
}
