import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ],
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
          min: [1, "Quantity cannot be less than 1"]
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);
export default User;

