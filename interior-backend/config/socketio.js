const { projectModel } = require("../models/projectModel");
const { userModel } = require("../models/userModel");
const { generateReply } = require("./gemini");

const connectSocket = (io) => {
  io.on("connection", async (socket) => {
    let chatHistory = [];
    try {
      const id = socket.handshake.auth.clientId;
      console.log("Socket connected:", id);

      const project = await projectModel
        .findOne({ clientId: id })
        .populate("updates");
      if (!project) {
        socket.emit("answer", { reply: "Invalid Client ID. Access denied." });
        return socket.disconnect();
      }

      const user = await userModel.findById(id).select("-password");
      if (!user) {
        socket.emit("answer", { reply: "Invalid User ID. Access denied." });
        return socket.disconnect();
      }

      const userDetails = {
        projectDetails: project,
        userInfo: user,
      };

      socket.on("question", async (message) => {
        try {
          const reply = await generateReply(userDetails, message, chatHistory);
          console.log("Reply:", reply);

          chatHistory.push({ role: "user", parts: [{ text: message }] });
          chatHistory.push({ role: "model", parts: [{ text: reply }] });

          if (chatHistory.length > 6) {
            chatHistory = chatHistory.slice(chatHistory.length - 6);
          }

          socket.emit("answer", { reply: reply });
        } catch (error) {
          console.error("Error generating reply:", error);
          socket.emit("answer", {
            reply: "Sorry, an error occurred while processing your question.",
          });
        }
      });
    } catch (error) {
      console.error("Socket connection error:", error);
      socket.emit("answer", { reply: "Internal server error." });
      socket.disconnect();
    }
  });
};

module.exports = connectSocket;
