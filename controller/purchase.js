require("dotenv").config();
const Order = require("../models/orders");
const { createOrder } = require("../service/cashfreeService");
const { getPaymentStatus } = require("../service/cashfreeService");
const userController = require("./user");



const purchasepremium = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = "ORDER-" + Date.now();
        const orderAmount = 2000;
        const orderCurrency = "INR";
        const customerID = userId.toString();
        const customerPhone = "9999999999";
        const paymentSessionId = await createOrder(orderId, orderAmount, orderCurrency, customerID, customerPhone);
        await Order.create({ userId, orderAmount, orderCurrency, orderId, paymentSessionId, paymentStatus: "PENDING" });
        //console.log("PaymentId:", paymentSessionId);
        return res.status(201).json({ success: true, paymentSessionId, orderId }); // Return order_id
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(402).json({ message: "Something went wrong", error: err.message });
    }
};

const checkPaymentStatus = async (req, res) => {
  try {
      const userId = req.user.id;  // Extract user ID from authenticated request
      //console.log("UserId is:", userId);
      const orderId = req.body.orderId;

      if (!orderId) {
          return res.status(400).json({ success: false, message: "Missing order_id parameter" });
      }

      //console.log("Received OrderId:", orderId);

      const orderStatus = await getPaymentStatus(orderId);
      //console.log("Fetched OrderStatus:", orderStatus);

      // Find the order in the database
      const order = await Order.findOne({ where: { orderId, userId } }); // Ensure it belongs to the user

      if (!order) {
          return res.status(404).json({ success: false, message: "Order not found for this user" });
      }
      order.paymentStatus = orderStatus;

      if (order.paymentStatus === "SUCCESS") {
          await Promise.all([
              order.update({ paymentStatus: "SUCCESS" }),
              req.user.update({ ispremiumuser: true }),
          ]);

          // Generate a new token with premium access
          const newToken = userController.generateAccessToken(userId, undefined, true);

          return res.status(200).json({
              success: true,
              message: "Transaction Successful",
              paymentStatus: "SUCCESS",
              token: newToken,
          });
      }

      return res.status(200).json({ success: true, paymentStatus: order.paymentStatus });

  } catch (error) {
      console.error("Error fetching payment status:", error.message);
      return res.status(500).json({ success: false, message: "Error fetching payment status" });
  }
};



module.exports = {
    purchasepremium,
    checkPaymentStatus
};
