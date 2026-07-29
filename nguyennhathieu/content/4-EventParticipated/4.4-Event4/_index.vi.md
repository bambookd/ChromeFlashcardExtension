---
title: "Sự kiện 4 (Trực tuyến)"
date: 2026-07-25
weight: 4
chapter: false
pre: " <b> 4. </b> "
---

# Sự kiện 4 (Tham gia trực tuyến) - FCAJ x Agentic AI Build Week: Show Up. Build. Pitch. WIN! - 25/07/2026

## 1. Tổng quan

FCAJ x Agentic AI Build Week là một sự kiện hackathon chuyên sâu tập trung vào việc thiết kế, xây dựng, triển khai và thuyết trình các giải pháp Agentic AI hướng tới môi trường production để giải quyết các bài toán thực tế của doanh nghiệp.

Các dự án nguyên mẫu tại cuộc thi đã chứng minh cách các AI agent tự chủ có thể tối ưu hóa quy trình vận hành trong nhiều lĩnh vực: đặt hàng bán lẻ qua hội thoại, thu thập thông tin tình báo cạnh tranh, tự động tổng hợp kiến trúc cloud, quản lý đám đông bằng thị giác máy tính và kiểm toán tuân thủ chống rửa tiền (AML).

Sự kiện khuyến khích các đội thi thử nghiệm ý tưởng nhanh chóng, xác định các giới hạn kỹ thuật và đánh giá khả năng phát triển nguyên mẫu thành giải pháp phần mềm doanh nghiệp khả thi.

Một chủ đề trọng tâm của sự kiện là sự chuyển dịch của ngành công nghiệp từ các hệ thống tự động hóa tĩnh truyền thống sang quy trình Agentic AI tự chủ có khả năng suy luận, duy trì ngữ cảnh, gọi công cụ linh hoạt (dynamic tool calling) và thực thi nhiệm vụ nhiều bước. Đáng chú ý, sự kiện cũng nhấn mạnh rằng sự phê duyệt của con người (Human-in-the-Loop) vẫn là bắt buộc đối với các quyết định kinh doanh, tài chính và tuân thủ có rủi ro cao.

## 2. Các Phiên Chuyên đề & Triển lãm Dự án

### 2.1. Định hình Mô hình Tư duy mới trong Kỷ nguyên Agentic AI — Joseph Morazota

Phiên mở đầu giới thiệu một mô hình tư duy kiến trúc hiện đại cho quá trình phân phối phần mềm và vận hành dựa trên AI.

Trong khi quy trình kỹ thuật phần mềm truyền thống phụ thuộc vào các chu kỳ phát hành dài và quy trình cố định, hệ thống agentic cho phép thử nghiệm nhanh chóng, tự động hóa các đề xuất và liên tục phân phối tính năng mới.

Dẫn chứng từ việc Amazon triển khai hơn một triệu robot trong các kho vận, diễn giả nhấn mạnh rằng phần cứng vật lý chỉ là một phần của giá trị; giá trị thực sự nằm ở tầng phần mềm thông minh, luồng dữ liệu và engine ra quyết định điều khiển phần cứng đó.

Phiên chia sẻ nổi bật mô hình kiểm soát **Human-in-the-Loop**: AI agent tổng hợp thông tin telemetry phức tạp và đề xuất hành động, nhưng kỹ sư con người vẫn chịu trách nhiệm phê duyệt và thực thi cuối cùng. Tinh thần học tập liên tục cũng được nhấn mạnh như một yêu cầu bắt buộc trước sự thay đổi nhanh chóng của các mô hình AI.

### 2.2. KFC Force Agent — One Team

One Team giới thiệu KFC Force Agent, một hệ thống đặt hàng qua hội thoại dựa trên AI được tích hợp trực tiếp trong môi trường ứng dụng nhắn tin Zalo và WhatsApp.

Dự án loại bỏ ma sát do chuyển đổi ứng dụng (app-switching friction), ngăn ngừa tình trạng khách hàng rời bỏ đơn hàng do bị điều hướng sang các website đặt hàng bên ngoài.

Các thành phần kiến trúc cốt lõi bao gồm:
* Các dịch vụ backend microservices native trên AWS.
* **Tiny Fish** để thu thập dữ liệu thực đơn theo thời gian thực.
* **Agent Core** để quản lý bộ nhớ liên tục và trạng thái ngữ cảnh.
* Giao diện hội thoại qua API của Zalo và WhatsApp.

Trích xuất thực đơn thời gian thực đảm bảo agent luôn truy cập giá cả và trạng thái còn hàng mới nhất. Bộ nhớ liên tục cho phép duy trì ngữ cảnh qua nhiều lượt hội thoại trong phiên làm việc của người dùng.

Nhóm đạt được chi phí vận hành ước tính khoảng **0.006 USD cho mỗi đơn hàng**, chứng minh tính khả thi về tài chính của AI hội thoại so với các trung tâm tổng đài thủ công.

### 2.3. Signal Scout — Team Signal Scout

Signal Scout xây dựng một engine tự động thu thập thông tin tình báo cạnh tranh, được thiết kế để tổng hợp và phân tích các tín hiệu thị trường nằm rải rác trong báo cáo tài chính, bản ghi cuộc họp công khai và các nền tảng web.

Nhóm ứng dụng khung **Value Creation and Delivery Canvas** để kết nối các năng lực kỹ thuật với ROI của doanh nghiệp.

Điểm sáng về công nghệ:
* **Tiny Fish** để cào dữ liệu web không cấu trúc từ các nguồn khó truy cập.
* **Amazon Bedrock** và **LangSmith** để điều phối LLM và ghi log chuỗi suy luận (chain-of-thought logging).

Các đánh đổi kỹ thuật bao gồm duy trì tính nhất quán dữ liệu, phụ thuộc vào API bên thứ ba, đồng bộ hóa đa agent và quản lý chi phí hạ tầng ước tính trong khoảng **35 USD đến 130 USD / tháng**.

### 2.4. SA Professional AI Native App — Team Plan D

Team Plan D phát triển một trợ lý AI dành cho Solution Architect nhằm giải quyết "bài toán trang giấy trắng" trong thiết kế kiến trúc cloud.

Hệ thống tiếp nhận các yêu cầu chưa cấu trúc của khách hàng và tự động xuất ra:
* Khai báo template **Terraform** và **CloudFormation**.
* Sơ đồ kiến trúc **Draw.io** có thể chỉnh sửa.
* Các đề xuất căn chỉnh tự động theo khung AWS Well-Architected Framework.

Bằng cách tích hợp các chính sách bảo mật nội bộ và ràng buộc tuân thủ vào ngữ cảnh prompt, giải pháp tạo ra các kiến trúc chuẩn tuân thủ ngay từ đầu, định hình lại vai trò của Solution Architect từ vẽ sơ đồ thủ công sang xác thực kiến trúc.

### 2.5. Shepherd — Team 3K

Team 3K giới thiệu Shepherd, một co-pilot AI được thiết kế để giám sát mật độ đám đông theo thời gian thực và điều phối nhân sự tại các khu vực có lưu lượng giao thông cao như sân bay.

Triển khai kỹ thuật bao gồm:
* Khung thị giác máy tính tích hợp **YOLO** và **ByteTrack**.
* Thu nhận luồng video thời gian thực và phân tích mật độ.
* Cảnh báo tự động tái điều phối nhân sự.

Để tối ưu hóa chi phí lưu trữ, nhóm lựa chọn biến thể YOLO nhẹ hơn, giới hạn chi phí hosting trên Amazon SageMaker ở mức **48 USD cho 3 giờ** vận hành live—chứng minh việc lựa chọn mô hình hiệu quả dựa trên các ràng buộc về độ trễ, chi phí và độ chính xác.

### 2.6. Engine Quy trình Thích ứng cho AML — Team Six Pillar

Team Six Pillar giải quyết tỷ lệ cảnh báo sai (false positive) cao trong điều tra chống rửa tiền (AML), nơi các hệ thống dựa trên quy tắc truyền thống tạo ra tới 90–95% cảnh báo sai với chi phí 20–25 USD cho mỗi lượt kiểm tra thủ công.

Nhóm triển khai kiến trúc 3 tầng:
1. **Tầng Phát hiện Nhanh (Fast Detection Layer)**: Các mô hình **XGBoost** được quản lý trên Amazon SageMaker.
2. **Tầng Điều tra Agentic (Agentic Investigation Layer)**: Thu nhận sự kiện thời gian thực qua **Amazon Kinesis Data Streams**, tìm kiếm vector với **Amazon OpenSearch**, và suy luận qua **Amazon Bedrock**.
3. **Tầng Quản lý Vụ việc (Case Management Layer)**: Dashboard phân cấp quản lý cho chuyên gia con người.

Agent tự chủ tổng hợp bằng chứng giao dịch và tạo tóm tắt vụ việc, rút ngắn thời gian điều tra từ nhiều giờ xuống vài phút và cho phép các chuyên gia tuân thủ tập trung hoàn toàn vào các trường hợp có rủi ro cao.

## 3. Bài học Thực tiễn & Rút ra Kỹ thuật

* Agentic AI chuyển dịch quá trình phát triển phần mềm từ viết mã từng dòng sang điều phối hệ thống (system orchestration).
* Các AI agent chuẩn production đòi hỏi system prompt rõ ràng, bộ nhớ liên tục, giao diện gọi công cụ, log suy luận, kiểm soát chi phí và ranh giới quyết định Human-in-the-Loop.
* Log kiểm toán suy luận (Reasoning audit logs) là yếu tố sống còn đối với sự tuân thủ, khả năng giải thích và niềm tin của doanh nghiệp.
* Lựa chọn mô hình đòi hỏi phải cân bằng giữa độ chính xác với độ trễ suy luận (inference latency) và chi phí hosting.

## 4. Phản hồi về Sự kiện

Sự kiện hackathon mang lại giá trị thực tiễn to lớn thông qua sự hướng dẫn kỹ thuật trực tiếp, các nguyên mẫu hoạt động được và quá trình đánh giá tính khả thi kinh doanh nghiêm túc.

## 5. Định hướng & Kỳ vọng Tương lai

Sau Sự kiện 4, mình định hướng sẽ:
* Xây dựng các quy trình multi-agent với bộ nhớ liên tục và cơ chế kiểm soát Human-in-the-Loop.
* Triển khai log kiểm toán suy luận có cấu trúc và giám sát chi phí token.
* Tích hợp các cơ chế kiểm soát bảo mật AWS (mã hóa KMS, ranh giới quyền IAM) vào quy trình xử lý của AI agent.
