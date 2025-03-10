const mongoose = require("mongoose");
const {Schema}= mongoose
const ledgerSchema = new Schema({
    transactionId: {
        type: String,
        unique: true,
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: null
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    transactionType: {
        type: String,
        enum: ["Credit", "Debit"],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "Card", "Razorpay", "Wallet", "Refund","Referal"],
        required: true
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Ledger = mongoose.model("Ledger", ledgerSchema);
module.exports = Ledger;