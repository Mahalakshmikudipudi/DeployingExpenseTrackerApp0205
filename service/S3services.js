const AWS = require('aws-sdk');

const uploadToS3 = async(data, filename) => {
    const BUCKET_NAME = 'expensetracker0205';
    const IAM_USER_KEY = 'AKIAYSE4OEGXJJ2ZI3WK';
    const IAM_USER_SECRET = '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';

    let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
        Bucket: BUCKET_NAME
    })

    var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'

    }
    return new Promise((resolve, reject) => {
        s3bucket.upload(params, (err, s3response) => {
            if (err) {
                console.log('Something went wrong', err)
                reject(err);

            } else {
                console.log('success', s3response);
                resolve(s3response.Location);
            }
        })
    })
    
}

module.exports = {
    uploadToS3
}