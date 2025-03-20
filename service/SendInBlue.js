const Sib = require('sib-api-v3-sdk');
require('dotenv').config();

const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.API_KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();

const sender = {
    email: 'mahalakshmiguthula125@gmail.com',
};



const sendEmail = async (email, id) => {
    try {
        const receivers = [
            {
                email: email,
            },
        ];
        const response = await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: 'Subscribe to Sharpener to become a developer',
            htmlContent: `<a href="http://localhost:5000/password/resetpassword/${id}">Reset password</a>`,
        });
        //console.log('Response is', response);
        return response.data;
    } catch (err) {
        console.error('Error sending email:', err);
        throw err;
    }
};

module.exports = {
    sendEmail
}
