/* 
    웹소켓
    웹서버는 웹 브라우저와 서버 사이애 지속적으로 연결을 유지하면서 실시간으로 데이터를 주고받을 수 있는 통신 방식
    서버를 만들 떄 서버 소켓도 만들고 서버 소켓을 띄어놓게되면면 클라이언트가 아이피와 포트를 통해서 서버에 접속하게
    될때 핸드쉐이크 기능을 이용해서 서로 연결된다. 그렇게 되면 클라이언트는 일반 소켓을 생성하게 되고 서버도 일반소켓을 만들어 일반 소켓끼리
    통신하게 된다.
*/
import express from "express";
import { createServer } from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

const app = express();
const server = createServer(app);
const io = new Server(server);
// ES(.mjs)에서는 __dirname, __filename이 없다
// import.meta.url: 현재 파일의 경로
// fileUTLToPath: 실제 경로를 문자열로 변환
// path.dirname: 디렉토리 이름만 추출
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const users = {};
const channels = ["lobby", "sports", "programming", "music"];

io.on("connection", (socket) => {
  socket.on("join", ({ nickname, channel }) => {
    socket.nickname = nickname;
    socket.channel = channel;
    users[socket.id] = { nickname, channel };
    socket.join(channel);

    const msg = { user: "system", text: `${nickname}님이 입장하셨습니다.` };
    io.to(channel).emit("message", msg);
    console.log("nickname: ", nickname, "channel: ", channel);
  });

  socket.on("chat", ({ text, to }) => {
    const sender = users[socket.id];
    if (!sender) return;
    const payload = { user: sender.nickname, text };

    // 귓속말 처리해야 함
    io.to(sender.channel).emit("message", payload);
  });
});

server.listen(3000, () => {
  console.log("서버 실행 중");
});
