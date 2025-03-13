const User = require('../models/users');
const Expense = require('../models/expenses');
const sequelize = require('../util/database');
const e = require('express');

const getUserLeaderBoard = async (req, res) => {
    try{
        const leaderboardOfUsers = await User.findAll({
            // attributes: ['id', 'name', [sequelize.fn('sum', sequelize.col('expenses.expenseamount')), 'total_cost']],
            // include: [
            //     {
            //         model: Expense,
            //         attributes: [],
            //     }
            // ],
            // group: ['User.id'],
            order: [[sequelize.literal('totalExpenses'), 'DESC']]

        })

        //console.log("LeaderBoardOfUsers:", leaderboardOfUsers);
        
        //const userAggregatedExpenses = {}
        // console.log(expenses);
        // expenses.forEach((expense) => {
        //     if(userAggregatedExpenses[expense.userId]) {
        //         userAggregatedExpenses[expense.userId] = userAggregatedExpenses[expense.userId] + expense.expenseamount;
        //     } else {
        //         userAggregatedExpenses[expense.userId] = expense.expenseamount
        //     }
        // });
        // var userLeaderBoardDetails = [];
        // users.forEach((user) => {
        //     userLeaderBoardDetails.push({name: user.name, total_cost: userAggregatedExpenses[user.id] || 0})
        // })
        // console.log(userLeaderBoardDetails);
        // userLeaderBoardDetails.sort((a, b) => b.total_cost - a.total_cost);
        return res.status(200).json(leaderboardOfUsers);
    
} catch (err){
    console.log(err)
    return res.status(500).json(err)
}
}

module.exports = {
    getUserLeaderBoard
}