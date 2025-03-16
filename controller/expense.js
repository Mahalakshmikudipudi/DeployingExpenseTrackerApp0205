const Expense = require('../models/expenses');
const sequelize = require('../util/database');
const User = require('../models/users');
const S3Service = require('../service/S3services')
const UserServices = require('../service/userservices');




const downloadexpense = async(req, res) => {
    try {

        if(!req.user.ispremiumuser){
            return res.status(401).json({ success: false, message: 'User is not a premium User'})
        }
        const expenses =  await UserServices.getExpenses(req);
        //console.log(expenses);
        const stringifiedExpenses = JSON.stringify(expenses);
        //it should depend upon the userId
        const userId = req.user.id;

        const filename = `Expenses${userId}${new Date}.txt`;
        const fileURl = await S3Service.uploadToS3(stringifiedExpenses, filename);
        res.status(201).json({success:true, fileURl});
    } catch(err) {
        console.log(err);
        res.status(500).json({success:false, fileURl:'', err: err})
    }
};



const addexpense = async (req, res) => {
    const transaction = await sequelize.transaction();//creating a transaction object

    try {
        // Fetch latest user data
        const { expenseamount, description, category } = req.body;

        const user = await User.findOne({ where: { id: req.user.id }, transaction }); //transaction is used for tracking the status

        //console.log("UserDetails:", user);

        if (!user) throw new Error("User not found");

        // Ensure totalExpenses is a valid number
        const totalExpense = Number(user.totalExpenses || 0) + Number(expenseamount);

        // Create the expense entry
        const expense = await Expense.create({
            expenseamount,
            description,
            category,
            userId: req.user.id
        }, { transaction });

        // Update the user's totalExpenses field
        const [updatedRows] = await User.update(
            { totalExpenses: totalExpense },
            { where: { id: req.user.id }, transaction }
        );

        //console.log("UpdatedRows:", updatedRows);

        if (updatedRows === 0) throw new Error("Failed to update total expenses");

        // Commit transaction if all operations succeed
        await transaction.commit();

        return res.status(201).json({ expense, success: true, totalExpense });

    } catch (err) {
        await transaction.rollback();
        console.error("Error adding expense:", err);
        return res.status(500).json({ success: false, error: err.message });
    }

}

const getexpenses = async (req, res) => {
    try {
        const expenses = await Expense.findAll({ where: { userId: req.user.id } })
        return res.status(200).json({ expenses, success: true })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: err, success: false })
    }
}

const getExpenses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Debugging: Log incoming request params
        //console.log("Fetching expenses for user:", req.user.id);
        //console.log(`Page: ${page}, Limit: ${limit}`);

        // Ensure userId is available
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        const totalItems = await Expense.count({ where: { userId: req.user.id } });

        const expenses = await Expense.findAll({
            where: { userId: req.user.id },
            offset: (page - 1) * limit,
            limit: limit,
        });

        return res.status(200).json({
            expenses,
            currentPage: page,
            hasNextPage: limit * page < totalItems,
            nextPage: page + 1,
            hasPreviousPage: page > 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / limit),
        });

    } catch (err) {
        console.error("Error fetching expenses:", err); // Log the exact error
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
};




const deleteexpense = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const expenseid = req.params.expenseid;

        if (!expenseid) {
            return res.status(400).json({ success: false, message: "Expense ID is required" });
        }

        // Step 1: Fetch the expense before deleting it
        const expense = await Expense.findOne({ where: { id: expenseid, userId: req.user.id }, transaction });

        if (!expense) {
            return res.status(404).json({ success: false, message: "Expense not found" });
        }

        // 🔹 Fetch the latest totalExpenses from the database
        const user = await User.findOne({ where: { id: req.user.id }, transaction });
        let totalExpense = Number(user.totalExpenses) - Number(expense.expenseamount);

        if (totalExpense < 0) totalExpense = 0; // Prevent negative values

        //console.log(`Before Delete: Total Expenses = ${user.totalExpenses}, Expense Amount = ${expense.expenseamount}`);
        //console.log(`After Delete: New Total Expenses = ${totalExpense}`);

        // Step 2: Delete the expense
        const noOfRows = await Expense.destroy({ where: { id: expenseid, userId: req.user.id }, transaction });

        if (noOfRows === 0) {
            throw new Error("Failed to delete expense");
        }

        // Step 3: Update the total expenses in the User table
        const [updatedRows] = await User.update(
            { totalExpenses: totalExpense },
            { where: { id: req.user.id }, transaction }
        );

        if (updatedRows === 0) {
            throw new Error("Failed to update total expenses");
        }

        // Commit transaction if everything is successful
        await transaction.commit();

        return res.status(200).json({ success: true, message: "Deleted Successfully", totalExpense });

    } catch (err) {
        await transaction.rollback();
        console.error("Error deleting expense:", err);
        return res.status(500).json({ success: false, message: "Failed to delete expense", error: err.message });
    }
};


module.exports = {
    deleteexpense,
    getexpenses,
    getExpenses,
    addexpense,
    downloadexpense
}