async function addNewExpense(e) {
    try {
        e.preventDefault();

        const expenseDetails = {
            expenseamount: parseInt(e.target.expenseamount.value),
            description: e.target.description.value,
            category: e.target.category.value
        };

        console.log("Adding Expense:", expenseDetails);

        const token = localStorage.getItem('token');
        const response = await axios.post(
            'http://localhost:5000/expense/addexpense',
            expenseDetails,
            { headers: { "Authorization": `Bearer ${token}` } }
        );

        addNewExpensetoUI(response.data.expense);
    } catch (err) {
        console.error("Error:", err.response ? err.response.data.message : err.message);
        document.body.innerHTML += `<div style="color:red;">${err.response ? err.response.data.message : err.message}</div>`;
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error("User not authenticated. Please log in.");
        }

        const response = await axios.get('http://localhost:5000/expense/getexpenses', {
            headers: { "Authorization": `Bearer ${token}` }
        });

        response.data.expenses.forEach(expense => {
            addNewExpensetoUI(expense);
        });
    } catch (err) {
        console.error("Error:", err.response ? err.response.data.message : err.message);
        document.body.innerHTML += `<div style="color:red;">${err.response ? err.response.data.message : err.message}</div>`;
    }
});

function addNewExpensetoUI(expense) {
    const parentElement = document.getElementById('listOfExpenses');
    // Check if the heading already exists, if not, add it
    if (!document.getElementById("expenseHeading")) {
        const heading = document.createElement("h2");
        heading.id = "expenseHeading";
        heading.textContent = "Expenses";
        parentElement.before(heading); // Insert heading before the list
    }
    const expenseEle = document.createElement('li');
    expenseEle.id = `expense-${expense.id}`;
    expenseEle.innerHTML = `
        ${expense.expenseamount} - ${expense.category} - ${expense.description}
        <button onclick='deleteExpense(event, ${expense.id})'>
            Delete Expense
        </button>
    `;
    parentElement.appendChild(expenseEle);
}


async function deleteExpense(e, expenseid) {
    try {
        const token = localStorage.getItem('token');
        await axios.delete(
            `http://localhost:5000/expense/deleteexpenses/${expenseid}`,
            { headers: { "Authorization": `Bearer ${token}` } }
        );

        removeExpensefromUI(expenseid);
    } catch (err) {
        console.error("Error:", err.response ? err.response.data.message : err.message);
        document.body.innerHTML += `<div style="color:red;">${err.response ? err.response.data.message : err.message}</div>`;
    }
}

function removeExpensefromUI(expenseid) {
    const expenseEle = document.getElementById(`expense-${expenseid}`);
    if (expenseEle) expenseEle.remove();
}

async function download() {
    try {
        const token=localStorage.getItem("token");
        console.log(token);
        const response = await axios.get('http://localhost:5000/user/download', { 
            headers: { "Authorization": `Bearer ${token}` } 
        });

        if (response.status === 201) {
            // The backend is sending a download link which, when opened, will trigger the file download
            const a = document.createElement("a");
            a.href = response.data.fileURl;
            a.download = 'myexpense.csv';
            a.click();
        } else {
            throw new Error(response.data.message);
        }
    } catch (err) {
        console.log(err);
    }
};

window.addEventListener("DOMContentLoaded", async () => {
    const expensesPerPage = localStorage.getItem("expensesPerPage") || 5; // Default to 10
    document.getElementById("itemsPerPage").value = expensesPerPage; // Set dropdown value
    await fetchExpenses(1, expensesPerPage);
});

// Event listener for dropdown to update preference
document.getElementById("itemsPerPage").addEventListener("change", async function () {
    const selectedLimit = this.value;
    localStorage.setItem("expensesPerPage", selectedLimit); // Store user preference
    await fetchExpenses(1, selectedLimit); // Fetch data with new limit
});

// Fetch expenses with pagination
async function fetchExpenses(page, limit) {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:5000/expense/expenses?page=${page}&limit=${limit}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        listExpenses(response.data.expenses);
        showPagination(response.data);
    } catch (err) {
        console.log(err);
    }
}

// Display expenses on the screen
async function listExpenses(expenses) {
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = '';

    expenses.forEach(expense => {
        const listItem = document.createElement('li');
        listItem.textContent = `${expense.category} - ${expense.description} - ₹${expense.expenseamount}`;
        expenseList.appendChild(listItem);
    });
}

// Update pagination buttons
async function showPagination({ currentPage, hasNextPage, nextPage, hasPreviousPage, previousPage, lastPage }) {
    try {
        const pagination = document.getElementById("pagination");
        pagination.innerHTML = '';

        const limit = localStorage.getItem("expensesPerPage") || 5; // Get stored limit

        if (hasPreviousPage) {
            const btnPrev = document.createElement('button');
            btnPrev.innerHTML = previousPage;
            btnPrev.addEventListener('click', () => fetchExpenses(previousPage, limit));
            pagination.appendChild(btnPrev);
        }

        const btnCurrent = document.createElement('button');
        btnCurrent.innerHTML = `<h3>${currentPage}</h3>`;
        btnCurrent.addEventListener('click', () => fetchExpenses(currentPage, limit));
        pagination.appendChild(btnCurrent);

        if (hasNextPage) {
            const btnNext = document.createElement('button');
            btnNext.innerHTML = nextPage;
            btnNext.addEventListener('click', () => fetchExpenses(nextPage, limit));
            pagination.appendChild(btnNext);
        }
    } catch (err) {
        console.log(err);
    }
}


const cashfree = Cashfree({
    mode: "sandbox",
});


document.getElementById("buyPremiumBtn").addEventListener("click", async () => {
    try {
        const token = localStorage.getItem("token");
        //console.log("Token is:", token);

        // Fetch payment session ID from backend
        const response = await fetch("http://localhost:5000/purchase/purchasepremium", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
        });

        const data = await response.json();
        const paymentSessionId = data.paymentSessionId;
        const orderId = data.orderId; // Ensure backend sends orderId

        console.log("paymentId:", orderId);

        let checkoutOptions = {
            paymentSessionId: paymentSessionId,
            orderId: orderId,
            redirectTarget: "_modal",

        };

        // Start the checkout process
        await cashfree. checkout(checkoutOptions);
        updateTransactionStatus(paymentSessionId, orderId);

    } catch (error) {
        console.error("Error initiating payment:", error.message);
        alert("Payment initiation failed. Please try again.");
    }
});

async function updateTransactionStatus(paymentSessionId, orderId) {
    const token = localStorage.getItem("token"); // Retrieve token from local storage

    try {
        const response = await fetch("http://localhost:5000/purchase/update-transaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Send token for authentication
            },
            body: JSON.stringify({
                orderId: orderId,
                paymentSessionId: paymentSessionId
            })
        });

        const data = await response.json();
        if (data.success) {
            alert("Transaction Updated Successfully!");
            showPremiumUserUI();
        } else {
            alert("Transaction update failed: " + data.message);
        }
    } catch (error) {
        console.error("Error updating transaction:", error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error("User not authenticated. Please log in.");
        }

        // ✅ Check if user is premium
        const premiumResponse = await axios.get("http://localhost:5000/user/checkPremiumStatus", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (premiumResponse.data.ispremiumuser) {
            showPremiumUserUI();
        }
    } catch (err) {
        console.error("Error:", err.response ? err.response.data.message : err.message);
        document.body.innerHTML += `<div style="color:red;">${err.response ? err.response.data.message : err.message}</div>`;
    }
});

function showPremiumUserUI() {
    document.getElementById("buyPremiumBtn").style.display = "none";  // Hide buy button
    document.getElementById("premiumUserUI").style.display = "block"; // Show premium message
    document.getElementById("showLeaderboardBtn").addEventListener("click", fetchLeaderboard);
}

async function fetchLeaderboard() {
    const token = localStorage.getItem("token");

    try {
        const response = await axios.get("http://localhost:5000/premium/showleaderboard", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const leaderboardData = response.data;

        console.log("LeaderboardData:", leaderboardData);

        displayLeaderboard(leaderboardData);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
    }
}

// ✅ Display Leaderboard
function displayLeaderboard(users) {
    const leaderboardContainer = document.getElementById("leaderboard");
    leaderboardContainer.innerHTML = "<h2>Show Leaderboard Expenses</h2>";

    if (users.length === 0) {
        leaderboardContainer.innerHTML += "<p>No expenses found.</p>";
        return;
    }

    const table = document.createElement("table");
    table.innerHTML = `
        <tr>
            <th>Name</th>
            <th>Total Expenses</th>
        </tr>
    `;

    users.forEach(user => {
        table.innerHTML += `
            <tr>
                <td>${user.name}</td>
                <td>₹${user.totalExpenses || 0}</td>
            </tr>
        `;
    });


    leaderboardContainer.appendChild(table);
}





