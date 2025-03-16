const e = require('express');
const { sendEmail } = require("../service/SendInBlue");
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const User = require('../models/users');
const ForgotPasswordRequests = require('../models/forgotpassword');

//console.log("sendEmail:", sendEmail);

const forgotPassword = async(req, res) => {
    try {
        const { email } = req.body;

        //console.log("Email is :", email);
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const resetToken = uuid.v4();  // Generate UUID
        await ForgotPasswordRequests.create({ userId: user.id, id: resetToken });
        const resetpassword = await sendEmail(email, resetToken);
        res.status(202).json({success: true, message: "Reset link sent to email", resetpassword});

    } catch (err) {
        console.error("Error reset password:", err);
        res.status(402).json({ message: "Something went wrong", error: err.message });
    }

};

const resetPassword = async (req, res) => {
    try {
        const id = req.params.id;
        const forgotpasswordrequest = await ForgotPasswordRequests.findOne({ where: { id, isActive: true } });
        
        //console.log("Forgot:", forgotpasswordrequest);

        if (forgotpasswordrequest) {
            await forgotpasswordrequest.update({ isActive: false });
            res.status(200).send(`
                <html>
                    <script>
                        function formsubmitted(e) {
                            e.preventDefault();
                            console.log('called')
                        }
                    </script>
                    <form action="/password/updatepassword/${id}" method="get">
                        <label for="newpassword">Enter New password</label>
                        <input name="newpassword" type="password" required></input>
                        <button>Reset password</button>
                    </form>
                </html>`
            );
            res.end();
        } else {
            res.status(404).json({ error: 'Invalid password reset request' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;

        //console.log("NewPassword:", newpassword);
        //console.log("ResertPasswordId:", resetpasswordid);
        
        const resetpasswordrequest = await ForgotPasswordRequests.findOne({ where: { id: resetpasswordid } });
        if (!resetpasswordrequest) {
            return res.status(404).json({ error: 'Invalid password reset request', success: false });
        }
        
        const user = await User.findOne({ where: { id: resetpasswordrequest.userId } });
        if (!user) {
            return res.status(404).json({ error: 'No user exists', success: false });
        }
        
        // Encrypt the password
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(newpassword, salt);
        
        await user.update({ password: hash });
        res.status(201).json({ message: 'Successfully updated the new password' });
        
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message, success: false });
    }
};


module.exports = {
    forgotPassword,
    updatePassword,
    resetPassword
}