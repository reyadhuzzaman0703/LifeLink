
import { io } from "socket.io-client";

const chatId = "6af4d3aa8aaeceaf2d827994";

const donorToken = process.env.DONOR_TOKEN;
const requesterToken = process.env.REQUESTER_TOKEN;

if (!donorToken || !requesterToken) {
  console.error("Both user tokens are required.");
  process.exit(1);
}

const donorSocket = io("http://localhost:5000", {
  auth: { token: donorToken },
});

const requesterSocket = io("http://localhost:5000", {
  auth: { token: requesterToken },
});

const connectUser = (socket, userName) => {
  socket.on("connect", () => {
    console.log(`${userName} connected:`, socket.id);
    socket.emit("chat:join", chatId);
  });

  socket.on("chat:joined", (data) => {
    console.log(`${userName} joined chat:`, data);
  });

  socket.on("chat:error", (error) => {
    console.log(`${userName} chat error:`, error);
  });

  socket.on("message:new", (data) => {
    console.log(`New message received by ${userName}:`);
    console.log(data.message);
  });

  socket.on("connect_error", (error) => {
    console.log(`${userName} connection error:`, error.message);
  });
};

connectUser(donorSocket, "Donor 1");
connectUser(requesterSocket, "Requester");
