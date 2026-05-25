import User from "../models/User.js";

export const updateUserSettings = async (req, res) => {
  try {
    const { firstName, lastName, currency, avatar } = req.body;

    const allowedCurrencies = ["USD", "EUR", "GBP", "NGN", "CAD", "AUD"];

    if (currency && !allowedCurrencies.includes(currency)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported currency selected",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.currency = currency || user.currency;
    user.avatar = avatar ?? user.avatar;

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        currency: updatedUser.currency,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};