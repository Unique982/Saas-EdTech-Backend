import crypto from "crypto";
const generateSha256Hash = (data: string, secretKey: string) => {
  if (!data || !secretKey) throw new Error("Provide dara,secretkey");

  const hash = crypto
    .createHmac("sha256", secretKey) // first is algo, next is secret to use
    .update(data)
    .digest("base64");
};

export default generateSha256Hash;
