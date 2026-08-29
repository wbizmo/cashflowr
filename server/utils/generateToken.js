import jwt from "jsonwebtoken";

const generateToken = (id, tokenVersion = 0) => {
  return jwt.sign(
    { id: id.toString(), tokenVersion },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "2h",
      issuer: "cashflowr-api",
      audience: "cashflowr-web",
    }
  );
};

export default generateToken;
