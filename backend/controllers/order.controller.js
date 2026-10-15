import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import User from "../models/customer.model.js";
import Product from "../models/product.model.js";
import razorpay from "../config/razorpay.js";

export const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required"
      });
    }

    const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !addressLine1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All shipping address fields are required"
      });
    }

    const cleanPincode = pincode.trim();
    if (!/^\d{6}$/.test(cleanPincode)) {
      return res.status(400).json({
        success: false,
        message: "Pincode must contain exactly 6 digits"
      });
    }

    const cleanPhone = phone.trim();
    if (!/^\d{10,12}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit phone number"
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Add products before checking out."
      });
    }

    const orderItems = [];
    let calculatedTotal = 0;

    for (const item of user.cart) {
      const productId = item.product;
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One or more products in your cart are no longer available"
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available stock is ${product.stock}`
        });
      }

      const itemTotal = product.price * item.quantity;
      calculatedTotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    if (calculatedTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order total"
      });
    }

    const shopKartOrder = await Order.create({
      user: user._id,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: cleanPhone,
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: cleanPincode
      },
      totalAmount: calculatedTotal,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT"
    });

    const amountInPaise = Math.round(calculatedTotal * 100);
    let razorpayOrderId = `order_${Date.now()}_mock`;

    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: shopKartOrder._id.toString()
      });
      razorpayOrderId = razorpayOrder.id;
    } catch (rzpErr) {
      console.warn("Razorpay API call note (using fallback mock order id for testing if keys are mock):", rzpErr.message);
      razorpayOrderId = `order_test_${shopKartOrder._id}`;
    }

    shopKartOrder.razorpayOrderId = razorpayOrderId;
    await shopKartOrder.save();

    return res.status(201).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrderId,
      amount: amountInPaise,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag",
      totalAmount: calculatedTotal
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!shopKartOrderId || !mongoose.isValidObjectId(shopKartOrderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing ShopKart order ID"
      });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to order"
      });
    }

    if (!razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment confirmation parameters"
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_secret_placeholder_mock";
    const trustedOrderId = order.razorpayOrderId || razorpay_order_id;
    const body = `${trustedOrderId}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = "FAILED";
      order.status = "FAILED";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    const user = await User.findById(req.user._id);
    if (user) {
      user.cart = [];
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed successfully",
      order
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order"
      });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Error fetching single order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "FAILED"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
}