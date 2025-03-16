async function passwordreset(e) {
    try {
        e.preventDefault();

        const passwordResetDetails = {
            email: e.target.email.value
        };
        console.log("Password Reset Details:", passwordResetDetails);

        

        const response = await axios.post("http://13.201.18.144:5000/password/forgotpassword", passwordResetDetails);
        if(response.status === 202){
            document.body.innerHTML += '<div style="color:green;">Mail Successfuly sent <div>'
        } else {
            throw new Error('Something went wrong!!!')
        }

    }catch (err) {
        console.log("Password Reset error:", err.response ? err.response.data.message : err.message);

        // Show error message in UI
        document.body.innerHTML += `<div style="color:red;">${err.response ? err.response.data.message : err.message}</div>`;
    }
}