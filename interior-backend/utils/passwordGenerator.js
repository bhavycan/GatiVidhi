
const generatePassword = (length = 12) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  let password = "";
  const charsetLength = charset.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (2**32) * charsetLength);
    password += charset[randomIndex];
  }

  return password;
}


module.exports = generatePassword;
