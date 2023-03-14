const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: "voucherhubs@gmail.com",
        pass: "Akaphucle55"
    }
})

var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
    from: 'VoucherHubs@gmail.com',
    to: 'hoangphuc552001@gmail.com',
    subject: 'Test Nodemailer',
    text: 'You recieved message from ',
    html: '<p>You have got a new message</b></p>'
}
transporter.sendMail(mainOptions, function(err, info){
    if (err) {
        console.log(err);
    } else {
        console.log('Message sent: ' +  info.response);
    }
});
