---

title: "Blog 1"
date: 2026-07-21
weight: 1
chapter: false
pre: " <b> 3.1. </b> "
---------------------

# CƠ CHẾ DDoS PROTECTION TRÊN AMAZON GAMELIFT SERVERS
|           |                                                      |
| --------- | ---------------------------------------------------- |
| Published | 03/07/2026                                 |
| Platform  | AWS Study Group                                      |
| Link      | https://www.facebook.com/photo?fbid=2182481875876802&set=gm.2202654247166202&idorvanity=660548818043427       |                                 |
| Evidence  | images/3-BlogsPosted/3.1-Blog1/image.png |

---

### GIỚI THIỆU

Tháng 3/2026, AWS ra mắt tính năng DDoS Protection tích hợp dành cho Amazon GameLift Servers, giúp tăng khả năng chống chịu của game session trước các cuộc tấn công từ chối dịch vụ phân tán.

Thay vì để game client kết nối trực tiếp đến địa chỉ IP và port của game server, cơ chế mới đưa traffic qua **Amazon GameLift Servers Player Gateway**.

Player Gateway hoạt động như một lớp trung gian giữa người chơi và game server. Lớp này xác thực từng player, giới hạn lưu lượng, phân tán traffic qua nhiều relay endpoint và hỗ trợ tự động chuyển đổi endpoint khi xảy ra sự cố.

Điểm đáng chú ý là cơ chế này không chỉ phát hiện và phản ứng sau khi cuộc tấn công đã ảnh hưởng đến server. Nó chủ động giảm bề mặt tấn công bằng cách ẩn game server khỏi client và loại bỏ traffic không hợp lệ trước khi traffic đó tiếp cận game session.

### VẤN ĐỀ VỚI GIẢI PHÁP CŨ

Nhiều hệ thống chống DDoS truyền thống hoạt động theo mô hình phản ứng:

```text
Attack → Detect → Analyze → Mitigate
```

Hệ thống phải chờ cuộc tấn công xuất hiện, xác định server hoặc traffic pattern đang bị ảnh hưởng, sau đó mới áp dụng biện pháp giảm thiểu.

Với game online, khoảng thời gian này có thể tạo ra tác động rõ rệt. Chỉ cần vài giây packet loss, jitter hoặc latency tăng cao cũng có thể làm gián đoạn game session và ảnh hưởng tiêu cực đến trải nghiệm người chơi.

Vấn đề này đặc biệt quan trọng với UDP traffic, loại traffic được sử dụng phổ biến trong các game thời gian thực như:

* FPS;
* MOBA;
* racing;
* action game;
* game multiplayer yêu cầu độ trễ thấp.

UDP không thiết lập kết nối theo cách TCP thực hiện. Vì vậy, attacker có thể tạo ra lượng lớn packet giả mạo hoặc packet không hợp lệ và gửi trực tiếp đến IP và port của game server.

Các giải pháp truyền thống thường phải dựa vào byte-matching rule hoặc traffic signature để nhận diện packet tấn công.

Cách tiếp cận này có hai hạn chế:

1. Hệ thống phải biết trước đặc điểm của packet độc hại.
2. Rule phải liên tục được cập nhật khi attacker thay đổi phương thức tấn công.

Điều đó khiến cơ chế phòng thủ thường chậm hơn attacker ít nhất một bước.

### GIẢI PHÁP CỦA AWS: PLAYER GATEWAY

Trung tâm của cơ chế DDoS Protection mới là **Amazon GameLift Servers Player Gateway**.

Player Gateway cung cấp một lớp relay networking nằm giữa game client và game server.

![Kiến trúc Amazon GameLift Servers Player Gateway](/images/3-blogs/blog-02-player-gateway.png)

Luồng kết nối tổng quát diễn ra như sau:

```text
Game client
    ↓
Player Gateway relay endpoint
    ↓
Amazon GameLift game server
```

Game client không cần biết địa chỉ IP thật của game server. Client chỉ nhận token và danh sách relay endpoint cần thiết để tham gia game session.

Player Gateway gồm ba cơ chế chính:

1. Relay Networking kết hợp Token Authentication.
2. Multi-Relay.
3. Dynamic Failover.

### 1. RELAY NETWORKING VÀ TOKEN AUTHENTICATION

Trong mô hình kết nối thông thường, game client kết nối trực tiếp đến IP và port của game server.

Điều này khiến địa chỉ của game server có thể bị lộ cho client. Nếu attacker lấy được thông tin đó, họ có thể gửi lượng lớn UDP traffic trực tiếp đến server.

Với Player Gateway, client không còn kết nối trực tiếp đến game server.

Khi một người chơi chuẩn bị tham gia game session, game backend gọi API:

```text
GetPlayerConnectionDetails
```

API trả về:

* Player Gateway Token;
* danh sách relay endpoint;
* thông tin kết nối cần thiết cho game client.

Backend sau đó gửi thông tin này về client.

Khi gửi UDP traffic, client gắn Player Gateway Token vào đầu mỗi packet và gửi packet đến relay endpoint thay vì địa chỉ game server.

Luồng xử lý packet có thể được mô tả như sau:

```text
UDP packet
    ↓
Player Gateway Token
    ↓
Relay endpoint
    ↓
Token validation
    ↓
Original game payload
    ↓
Game server
```

Relay xác thực token trước khi cho phép traffic đi tiếp.

* Packet thiếu token sẽ bị loại bỏ.
* Packet sử dụng token không hợp lệ sẽ bị loại bỏ.
* Packet có token hợp lệ sẽ được chuyển tiếp đến game server.

Trước khi packet được chuyển tiếp, Player Gateway loại bỏ phần token và chỉ gửi payload gốc tới server. Vì vậy, game server vẫn nhận được packet theo định dạng mà game server mong đợi.

Traffic phản hồi từ game server về client cũng đi qua relay network.

Cơ chế này mang lại hai lợi ích quan trọng.

Thứ nhất, IP thật của game server được ẩn khỏi player. Client chỉ nhận địa chỉ của relay endpoint.

Thứ hai, traffic không được xác thực có thể bị loại bỏ trước khi tiếp cận game server.

### GIỚI HẠN TRAFFIC THEO PLAYER

Bên cạnh token authentication, Player Gateway còn áp dụng giới hạn traffic theo từng player.

Điều này giúp xử lý trường hợp attacker sở hữu token hợp lệ, chẳng hạn khi attacker tham gia game session như một player bình thường nhưng sau đó gửi lượng traffic bất thường.

Player Gateway có thể giới hạn lượng traffic của player đó trước khi traffic tiếp cận game server.

Nhờ vậy, một client bị xâm nhập hoặc một player độc hại khó có thể sử dụng một kết nối hợp lệ để làm quá tải toàn bộ game session.

### 2. MULTI-RELAY

Mỗi player nhận nhiều relay endpoint thay vì chỉ một endpoint duy nhất.

Danh sách relay endpoint cũng có thể khác nhau giữa các player trong cùng một game session.

Ví dụ:

| Player   | Relay endpoint            |
| -------- | ------------------------- |
| Player A | Relay 1, Relay 2, Relay 3 |
| Player B | Relay 2, Relay 4, Relay 5 |
| Player C | Relay 1, Relay 4, Relay 6 |

Cách phân phối này giúp traffic không tập trung vào một relay duy nhất.

Nếu tất cả player trong một game session sử dụng cùng một relay, relay đó có thể trở thành single point of failure. Một cuộc tấn công nhắm vào relay có thể gây gián đoạn cho toàn bộ người chơi.

Với Multi-Relay, traffic được phân tán trên relay infrastructure.

Nếu một endpoint bị tấn công hoặc gặp sự cố, phạm vi ảnh hưởng có thể được cô lập ở một nhóm kết nối thay vì lan sang toàn bộ game session.

Cơ chế này cũng làm tăng độ khó của cuộc tấn công. Attacker không chỉ phải xác định một endpoint duy nhất mà phải đối mặt với một tập hợp endpoint được phân phối động giữa nhiều player.

### 3. DYNAMIC FAILOVER

Relay endpoint không cố định trong toàn bộ thời gian tồn tại của game session.

Khi một relay trở nên unhealthy, Amazon GameLift Servers có thể thay thế endpoint đó và trả về thông tin endpoint mới trong lần gọi API tiếp theo.

Client sau đó chuyển traffic sang endpoint khác mà không cần kết nối trực tiếp lại với game server.

AWS cung cấp hai cơ chế lựa chọn endpoint:

* Fallback;
* Predictive Rotation.

### FALLBACK

Trong chế độ Fallback, client sử dụng một relay endpoint chính.

Client tiếp tục gửi traffic đến endpoint này cho đến khi endpoint gặp lỗi hoặc không còn khả dụng. Khi đó, client chuyển sang endpoint khác trong danh sách.

Luồng xử lý có thể được mô tả như sau:

```text
Relay A
    ↓ unhealthy
Relay B
    ↓ unhealthy
Relay C
```

Fallback phù hợp với các loại game hoặc chức năng ít nhạy cảm với packet loss tạm thời, chẳng hạn:

* lobby;
* menu;
* matchmaking screen;
* turn-based game;
* các hoạt động không yêu cầu cập nhật theo thời gian thực liên tục.

Hạn chế của cơ chế này là một số packet có thể bị mất trong khoảng thời gian client phát hiện endpoint lỗi và chuyển sang endpoint khác.

### PREDICTIVE ROTATION

Predictive Rotation liên tục luân chuyển traffic giữa các relay endpoint.

Thay vì chờ một endpoint ngừng hoạt động hoàn toàn, client và Player Gateway chủ động sử dụng nhiều endpoint và dự đoán lỗi trước khi endpoint trở nên unavailable.

Cách tiếp cận này giúp giảm khoảng trống trong quá trình failover và duy trì luồng packet ổn định hơn.

Predictive Rotation phù hợp với các game thời gian thực như:

* FPS;
* racing;
* action multiplayer;
* battle royale;
* game yêu cầu packet delivery liên tục và latency thấp.

Đối với các thể loại game này, ngay cả một khoảng mất kết nối ngắn cũng có thể khiến nhân vật dịch chuyển bất thường, input không được ghi nhận hoặc trạng thái giữa client và server mất đồng bộ.

### TỪ PHÒNG THỦ BỊ ĐỘNG SANG CHỦ ĐỘNG

Sự khác biệt chính giữa cơ chế truyền thống và Player Gateway nằm ở thời điểm traffic được xử lý.

Với mô hình truyền thống:

```text
Traffic reaches server
    ↓
Attack is detected
    ↓
Traffic is analyzed
    ↓
Mitigation is applied
```

Với Player Gateway:

```text
Traffic reaches relay
    ↓
Token is validated
    ↓
Player traffic is limited
    ↓
Only valid traffic reaches the game server
```

Traffic không hợp lệ được loại bỏ ở lớp relay, trước khi tiếp cận game server.

IP của game server cũng không được cung cấp trực tiếp cho player. Điều này làm giảm khả năng attacker nhắm trực tiếp vào server đang chạy game session.

Multi-Relay và Dynamic Failover tiếp tục giảm ảnh hưởng bằng cách phân tán traffic và chuyển kết nối khỏi relay đang gặp sự cố.

## LUỒNG HOẠT ĐỘNG TỔNG QUÁT

Toàn bộ quy trình có thể được tóm tắt qua các bước sau:

1. Player yêu cầu tham gia game session.
2. Game backend gọi `GetPlayerConnectionDetails`.
3. Amazon GameLift Servers trả về Player Gateway Token và danh sách relay endpoint.
4. Backend gửi thông tin kết nối về game client.
5. Client gắn token vào UDP packet.
6. Client gửi packet đến relay endpoint.
7. Relay xác thực token.
8. Relay giới hạn traffic theo player.
9. Relay loại bỏ token và chuyển payload đến game server.
10. Traffic phản hồi từ game server được gửi ngược lại qua relay.
11. Nếu relay gặp sự cố, client chuyển sang endpoint khác.

```text
Player
   ↓ Request connection
Game backend
   ↓ GetPlayerConnectionDetails
Amazon GameLift Servers
   ↓ Token + relay endpoints
Game client
   ↓ Authenticated UDP packets
Player Gateway
   ↓ Validated game traffic
Game server
```

## NHỮNG ĐIỂM CẦN LƯU Ý

DDoS Protection của Amazon GameLift Servers được AWS quản lý, nhưng điều đó không có nghĩa là game developer không cần thực hiện tích hợp.

Để sử dụng Player Gateway, hệ thống game vẫn cần:

* bật Player Gateway khi cấu hình tài nguyên GameLift phù hợp;
* cập nhật game backend để gọi `GetPlayerConnectionDetails`;
* gửi token và relay endpoint về client;
* cập nhật game client để gắn token vào UDP packet;
* triển khai logic lựa chọn relay endpoint;
* triển khai Fallback hoặc Predictive Rotation tùy yêu cầu của game;
* xử lý việc làm mới thông tin endpoint khi relay thay đổi.

AWS chịu trách nhiệm vận hành relay infrastructure và cơ chế bảo vệ bên dưới. Tuy nhiên, backend và client vẫn phải sử dụng đúng connection flow do Player Gateway cung cấp.

## KẾT LUẬN

Amazon GameLift Servers DDoS Protection thay đổi cách game server được bảo vệ trước UDP-based DDoS attack.

Thay vì để traffic đi trực tiếp đến server rồi mới phát hiện và giảm thiểu cuộc tấn công, Player Gateway chủ động đưa traffic qua một relay network.

Tại đây, hệ thống:

* xác thực Player Gateway Token;
* loại bỏ packet không hợp lệ;
* giới hạn traffic theo từng player;
* ẩn IP thật của game server;
* phân tán kết nối qua nhiều relay;
* tự động chuyển endpoint khi relay gặp sự cố.

Nhờ đó, game server giảm nguy cơ bị tấn công trực tiếp và game session có khả năng duy trì kết nối tốt hơn khi một phần relay infrastructure gặp sự cố.

Cơ chế này đặc biệt phù hợp với các game multiplayer sử dụng UDP và yêu cầu latency thấp, nơi chỉ một khoảng gián đoạn ngắn cũng có thể ảnh hưởng trực tiếp đến trải nghiệm người chơi.

## NGUỒN THAM KHẢO

* [Amazon GameLift Servers DDoS protection](https://docs.aws.amazon.com/gameliftservers/latest/developerguide/ddos-protection-intro.html)
* [AWS — Amazon GameLift Servers](https://aws.amazon.com/gamelift/servers/)
* {{TODO: AWS announcement URL}}
* {{TODO: AWS technical blog URL}}

