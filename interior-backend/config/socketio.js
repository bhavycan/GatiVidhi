const { projectModel } = require("../models/projectModel");
const { userModel } = require("../models/userModel");
const { chatMessageModel } = require("../models/chatMessageModel");
const { directMessageModel } = require("../models/directMessageModel");
const { generateReply } = require("./gemini");

const connectSocket = (io) => {
  // ── AI Chatbot (existing) ──────────────────────────────────────────────────
  io.on("connection", async (socket) => {
    let chatHistory = [];
    try {
      const id = socket.handshake.auth.clientId;
      console.log("Socket connected:", id);

      const project = await projectModel.findOne({ clientId: id }).populate("updates");
      if (!project) {
        socket.emit("answer", { reply: "Invalid Client ID. Access denied." });
        return socket.disconnect();
      }

      const user = await userModel.findById(id).select("-password");
      if (!user) {
        socket.emit("answer", { reply: "Invalid User ID. Access denied." });
        return socket.disconnect();
      }

      const userDetails = { projectDetails: project, userInfo: user };

      socket.on("question", async (message) => {
        try {
          const reply = await generateReply(userDetails, message, chatHistory);

          chatHistory.push({ role: "user", parts: [{ text: message }] });
          chatHistory.push({ role: "model", parts: [{ text: reply }] });
          if (chatHistory.length > 6) chatHistory = chatHistory.slice(chatHistory.length - 6);

          await chatMessageModel.create([
            { projectId: project._id, clientId: id, role: "user",  text: message },
            { projectId: project._id, clientId: id, role: "model", text: reply   },
          ]);

          socket.emit("answer", { reply });
        } catch (error) {
          console.error("Error generating reply:", error);
          socket.emit("answer", { reply: "Sorry, an error occurred while processing your question." });
        }
      });
    } catch (error) {
      console.error("Socket connection error:", error);
      socket.emit("answer", { reply: "Internal server error." });
      socket.disconnect();
    }
  });

  // ── Direct Client-Admin Messaging (/dm namespace) ─────────────────────────
  //
  // Two events are used to avoid duplicates:
  //   dm:message  → emitted to the specific client room only (for the open chat view)
  //   dm:notify   → emitted to admin-broadcast only (for conversations list refresh)
  //
  // Admin joins admin-broadcast on connect, and room:${clientId} on demand.
  // This way a message never arrives twice to the same admin socket.

  const dm = io.of("/dm");

  dm.on("connection", (socket) => {
    const { clientId, role } = socket.handshake.auth;

    if (role === "client" && clientId) {
      socket.join(`room:${clientId}`);
    }

    if (role === "admin") {
      // Admins always listen on broadcast for conversations-list updates
      socket.join("admin-broadcast");
    }

    // Admin calls this when opening a specific conversation
    socket.on("dm:join", (targetClientId) => {
      socket.join(`room:${targetClientId}`);
    });

    socket.on("dm:send", async ({ targetClientId, text, updateRef, approvalRef, ticketRef, images }) => {
      const hasText = text && text.trim();
      const hasImages = Array.isArray(images) && images.length > 0;
      if (!hasText && !hasImages) return;

      try {
        const cid = role === "client" ? clientId : targetClientId;
        if (!cid) return;

        const project = await projectModel.findOne({ clientId: cid });
        if (!project) {
          console.error(`[DM] No project found for clientId: ${cid}`);
          socket.emit("dm:error", "No project found. Message not saved.");
          return;
        }

        const msgData = {
          clientId: cid,
          projectId: project._id,
          senderRole: role,
          text: hasText ? text.trim() : '',
        };

        if (hasImages) msgData.images = images;
        if (updateRef && updateRef.updateId) msgData.updateRef = updateRef;
        if (approvalRef && approvalRef.approvalId) msgData.approvalRef = approvalRef;
        if (ticketRef && ticketRef.ticketId) msgData.ticketRef = ticketRef;

        const msg = await directMessageModel.create(msgData);

        // Send full message to the specific room (client + admin viewing this chat)
        dm.to(`room:${cid}`).emit("dm:message", msg);

        // Notify all admins on the broadcast channel (conversations list update only)
        dm.to("admin-broadcast").emit("dm:notify", {
          clientId: msg.clientId,
          lastText: msg.text,
          lastRole: msg.senderRole,
          lastAt: msg.createdAt,
        });
      } catch (err) {
        console.error("[DM ERROR]", err);
        socket.emit("dm:error", "Failed to send message.");
      }
    });
  });
};

module.exports = connectSocket;
