const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    feedBack: {
      type: String,
      require: true,
    },
    mood: {
      type: String,
      enum: ["Awesome", "Noiicee", "Meh", "Awful", "Fine"],
      required: true,
    },
    user: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model("feedback", FeedbackSchema);
module.exports = Feedback;
