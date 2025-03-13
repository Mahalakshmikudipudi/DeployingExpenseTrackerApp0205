const dotenv = require('dotenv');
dotenv.config();
const path = require('path');

const express = require('express');
var cors = require('cors')
const Cashfree = require('cashfree-pg');
const sequelize = require('./util/database');
const User = require('./models/users');
const Expense = require('./models/expenses');
const Order = require('./models/orders');
const Forgotpassword = require('./models/forgotpassword');

const userRoutes = require('./routes/user')
const expenseRoutes = require('./routes/expense')
const purchaseRoutes = require('./routes/purchase')
const premiumFeatureRoutes = require('./routes/premiumFeature')
const forgotPasswordRoutes = require('./routes/forgotpassword');
const { Proton } = require('aws-sdk');

const app = express();


// get config vars



app.use(cors());

// app.use(bodyParser.urlencoded());  ////this is for handling forms
app.use(express.json());  //this is for handling jsons

app.use('/user', userRoutes)
app.use('/expense', expenseRoutes)
app.use('/purchase', purchaseRoutes)
app.use('/premium', premiumFeatureRoutes)
app.use('/password', forgotPasswordRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);



sequelize.sync()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server running on localhost ${process.env.PORT}`)
        });
    })
    .catch(err => {
        console.log(err);
    })