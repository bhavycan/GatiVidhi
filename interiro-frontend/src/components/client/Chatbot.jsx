import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { AnimatePresence, motion } from "motion/react";
import axios from "axios";
import Navbar from "../../templates/Navbar";
import Butterfly from "../../templates/Butterfly";
import { API_BASE } from '../../config.js'

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 Hi! I'm Tanika's AI Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isopen, setOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [typing, setTyping] = useState(false);
  const socketRef = useRef(null);
  const chatRef = useRef(null);
  const parent = useRef(null);

  // Fetch userId from profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/user/profile`, {
          withCredentials: true,
        });
        setUserId(data?.user?._id);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  // Connect socket once userId is available
  useEffect(() => {
    if (!userId) return;

    const socket = io(`${API_BASE}`, {
      auth: { clientId: userId },
    });
    socketRef.current = socket;

    socket.on("answer", (data) => {
      setTyping(false);
      setMessages((prev) => [...prev, { from: "bot", text: data.reply }]);
    });

    return () => socket.disconnect();
  }, [userId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const sendMessage = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !socketRef.current) return;

    setMessages((prev) => [...prev, { from: "user", text }]);
    setTyping(true);
    socketRef.current.emit("question", text);
    setInput("");
  };

  // Render bot message: support images & line breaks
  const renderBotText = (text) => {
    const urlRegex = /(https?:\/\/[^\s,\]\)]+?\.(?:png|jpg|jpeg|gif|webp))/gi;
    const parts = text.split(urlRegex);

    return parts.map((part, i) => {
      if (urlRegex.test(part)) {
        return (
          <img
            key={i}
            src={part}
            alt="shared"
            className="max-w-[180px] rounded-lg mt-1"
          />
        );
      }
      return part.split("\n").map((line, j) => (
        <span key={`${i}-${j}`}>
          {line}
          {j < part.split("\n").length - 1 && <br />}
        </span>
      ));
    });
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden ">
      {/* Menu button */}
      <nav className="z-10 fixed mt-[10%] right-4 md:top-6 md:right-8">
        <motion.div
          onClick={() => setOpen(!isopen)}
          className="menuicon w-10 h-10 md:w-12 md:h-12 items-center justify-center flex cursor-pointer"
        >
          <i className="ri-menu-fill text-3xl text-white opacity-90"></i>
        </motion.div>
      </nav>

      <AnimatePresence mode="wait">
        {isopen && <Navbar value={{ isopen, setOpen }} />}
      </AnimatePresence>

      {/* Background */}
      <section className="overflow-hidden -z-10">
        <figure className="w-screen h-full absolute">
          <img
            className="w-full h-full object-cover"
            src="/images/background.png"
            alt=""
          />
        </figure>
        <Butterfly parent={parent} y={16} x={5} />
        <figure className="w-24 h-28 md:w-32 md:h-40 absolute bottom-[2%] left-[10%]">
          <img
            className="w-full h-full object-cover"
            src="/images/butterfly2.png"
            alt=""
          />
        </figure>
      </section>

      {/* Main content */}
      <main className="w-full h-full px-[8%] pt-[4%] pb-[2%] relative flex flex-col">
        <div className="max-w-3xl w-full mx-auto flex flex-col flex-1 overflow-hidden">

          {/* Header */}
          <header className="shrink-0 mt-[6%]">
            <div className="text-4xl md:text-5xl font-semibold tracking-tight flex gap-[3%]">
              <h1>Tanika</h1>
              <h1 className="text-white">
                AI<span className="inline-block text-black">.</span>
              </h1>
            </div>
            <div className="font-semibold mt-[1%] text-md opacity-70 leading-5 pl-[1%]">
              <h4>Ask anything about your project</h4>
            </div>
            <div className="w-[50%] pb-4 border-b-2 border-white mt-[3%]" />
          </header>

          {/* Chat window */}
          <section
            ref={chatRef}
            className="flex-1 overflow-y-auto py-4 flex flex-col gap-3 mt-2"
          >
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.from === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-[#883bbc] flex items-center justify-center shrink-0 mr-2 mt-1">
                      <i className="ri-sparkling-2-fill text-white text-sm"></i>
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed font-medium
                      ${msg.from === "user"
                        ? "bg-[#883bbc] text-white rounded-br-none shadow-lg shadow-[#883bbc]/30"
                        : "bg-white/70 backdrop-blur-md text-black rounded-bl-none shadow-md border border-white"
                      }`}
                  >
                    {msg.from === "bot" ? renderBotText(msg.text) : msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="flex justify-start items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-[#883bbc] flex items-center justify-center shrink-0">
                    <i className="ri-sparkling-2-fill text-white text-sm"></i>
                  </div>
                  <div className="bg-white/70 backdrop-blur-md px-4 py-3 rounded-2xl rounded-bl-none shadow-md border border-white flex gap-1 items-center">
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        className="w-2 h-2 rounded-full bg-[#883bbc] block"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: dot * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="shrink-0 flex items-center gap-3 py-4 border-t border-white/40"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your project..."
              className="flex-1 bg-white/50 backdrop-blur-md border border-white rounded-full px-5 py-3 text-sm font-medium outline-none placeholder:opacity-60 focus:bg-white/70 transition-colors"
              autoComplete="off"
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.9 }}
              disabled={!input.trim() || !socketRef.current}
              className="w-11 h-11 rounded-full bg-[#883bbc] flex items-center justify-center shrink-0 disabled:opacity-40 cursor-pointer"
            >
              <i className="ri-send-plane-fill text-white text-lg"></i>
            </motion.button>
          </form>

        </div>
      </main>
    </div>
  );
};

export default Chatbot;
