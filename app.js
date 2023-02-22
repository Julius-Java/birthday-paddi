const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const nodeCron = require("node-cron")
const env = require('dotenv').config()
const request = require('request');

const app = express()



app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}))

mongoose.set('strictQuery', false);
const uri = "mongodb://localhost:27017/birthdayDB";
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => {console.log("Connected to DB");})
    .catch((error) => {console.log(error);})

const memberSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    title: String,
    birthDate: String,
    phoneNumber: String,
    memberId: String
})

const Member = mongoose.model("Member", memberSchema)

const idSchema = new mongoose.Schema({
    id: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    }
})

const Id = mongoose.model("Id", idSchema)

const smsSchema = new mongoose.Schema({
    date: String,
    nameList: Array
})

const Messagelog = mongoose.model("Messagelog", smsSchema)

const id1 = new Id({
    id: process.env.ID_0
})

const id2 = new Id({
    id: process.env.ID_1
})

const id3 = new Id({
    id: process.env.ID_2
})

const id4 = new Id({
    id: process.env.ID_3
})

const id5 = new Id({
    id: process.env.ID_4
})

const defaultIds = [id1, id2, id3, id4, id5];

Id.find({}, (err, foundIds) => {
    if (err) {
        console.log(err);
    } else {
        if (foundIds.length === 0) {
            Id.insertMany(defaultIds)
                .then((docs) => {console.log(docs.length + " were inserted into the DB");})
                .catch((err) => {console.log(err);})
        }
    }
})



app.route("/")
    .get((req, res) => {
        res.sendFile(__dirname + "/indexForm.html");
    })
    .post((req, res) => {
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const title = req.body.title;
        const birthDate = req.body.day + "-" + req.body.month;
        const memberId = req.body.memberId;
        const phoneNumber = req.body.countryCode + " " + req.body.phoneNumber;

        const newMember = new Member({
            firstName: firstName,
            lastName: lastName,
            title: title,
            birthDate: birthDate,
            memberId: memberId.toUpperCase(),
            phoneNumber: phoneNumber
        })

        newMember.save()
            .then((result) => {
                console.log(result.firstName + " " + result.lastName + " info submitted to DB");
                Id.findOneAndUpdate({id: result.memberId}, {$set: {user: result._id}}, (error, item) => {
                    if (!error) {
                        if (item) {
                            console.log(result.title + ". " + result.firstName + " " + result.lastName + " now associated with the id " + item.id);
                            setTimeout(() => {
                                res.redirect('/')
                            }, 1000);
                        } else {
                            console.log("No item was updated");
                        }
                    } else {
                        console.log(error);
                    }
                })
            })
            .catch((err) => {
                console.log(err);
            })



    })

app.route("/search")
    .get((req, res) => {
        var query = req.query.query;

        Id.findOne({id: {$regex: query, $options: 'i'}, user: null}, (err, item) => {
            if (err) {
                // console.log(err);
                console.log("Unable to find item")
            } else {
                if (item) {
                    res.json(item)
                    console.log(item);
                } else {
                    res.send("No ID match")
                    console.log("No ID match");
                }
            }
        })
    })

nodeCron.schedule('*/1 * * * *', () => {
    Member.find({birthDate: "1-1"}, (error, items) => {
        if (!error) {
            if (items) {
                if (items.length === 0) {
                    // console.log("We're not celebrating any birthdays today");
                } else if (items.length === 1) {
                    console.log("We're celebrating only one birthday today and that is " + items.firstName + " " + items.lastName);
                    console.log(items);
                } else if (items.length > 1) {
                    console.log("We're celebrating " + items.length + " birthdays today");
                    console.log(items);
                }
            } else {
                console.log("Error getting items");
            }
        } else {
            console.log(error);
        }
    })
})

// const today = new Date();
// const day = today.getDate().toString()
// const month = (today.getMonth() + 1).toString()
// const formattedDate = `${day}-${month}`;
// console.log(formattedDate);
// // console.log(today);

// var data = {
//     "to": ["2349024432171", "2349161285630"],
//     "from": "julius-java",
//     "sms": "Hi there, testing Termii API",
//     "type": "plain",
//     "channel": "generic",
//     "api_key": process.env.TERMII_API_KEY,
// };

// var options = {
//     "method": "POST",
//     "url": 'https://termii.com/api/sms/send',
//     "headers": {
//         'Content-Type': ['application/json', 'application/json']
//     },
//     body: JSON.stringify(data)
// }

// request(options, (error, response) => {
//     if (error) {
//         console.log("Error found");
//         console.log(error);
//     } else {
//         console.log(response.body);
//     }
// })

// {"message":"Insufficient balance"}


app.listen(4000, () => {
    console.log("Server up and running");
})