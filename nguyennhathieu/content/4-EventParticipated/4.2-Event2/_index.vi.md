---

title: "Sự kiện 2 (Trực tuyến)"
date: 2026-06-01
weight: 2
chapter: false
pre: " <b> 2. </b> "
--------------------

# Sự kiện 2 (Tham gia trực tuyến)

## 1. Tổng quan

Sự kiện đề cập đến các nền tảng Cloud Agentic, Voice AI dành cho tiếng Việt, tự động hóa DevOps, ứng dụng AI trong tuyển dụng và kết nối mạng riêng an toàn cho các hệ thống AI doanh nghiệp.

Sự kiện cho thấy việc áp dụng AI thành công đòi hỏi hạ tầng đám mây trưởng thành, khả năng quan sát hệ thống đáng tin cậy, cơ chế quản trị chặt chẽ và các biện pháp bảo mật phù hợp.

AI agent có thể cải thiện hiệu quả vận hành, nhưng vẫn cần con người giám sát đối với những quyết định kỹ thuật và kinh doanh quan trọng.

## 2. Các chủ đề

### 2.1. Nền tảng Cloud Agentic và sự phát triển nghề nghiệp - Steve Tran

Phiên chia sẻ giải thích cách nghề nghiệp trong lĩnh vực cloud đang chuyển dịch từ quản trị máy chủ truyền thống sang kỹ thuật đám mây và các nền tảng agentic được hỗ trợ bởi AI.

Khi các công cụ AI tự động hóa nhiều công việc triển khai, doanh nghiệp ngày càng cần những kỹ sư có khả năng hiểu kiến trúc, logic hệ thống, bảo mật và quy trình ra quyết định trong vận hành.

Nền tảng của CloudThinker được giới thiệu như một giải pháp hỗ trợ tự động hóa các lĩnh vực:

* Quản lý sự cố.
* FinOps.
* Bảo mật đám mây.
* Giám sát hạ tầng.
* Đề xuất phương án vận hành.

Phiên chia sẻ cũng so sánh kiến trúc single-agent và multi-agent.

Một agent đa năng có thể hoàn thành phần lớn công việc, nhưng có thể gặp hạn chế do context window quá lớn, chi phí cao và ranh giới quyền hạn không rõ ràng.

Kiến trúc multi-agent sử dụng nhiều agent chuyên biệt với phạm vi trách nhiệm giới hạn. Cách tiếp cận này có thể cải thiện:

* Độ chính xác của ngữ cảnh.
* Role-Based Access Control.
* Bảo mật.
* Hiệu năng.
* Quản lý chi phí.

Bài học chính là kỹ sư cloud cần hiểu và sử dụng AI hiệu quả, đồng thời tiếp tục xây dựng kiến thức vững chắc về hạ tầng, bảo mật và kiến trúc hệ thống.

### 2.2. Voice AI và khoảng cách ngôn ngữ tiếng Việt - Nghi Danh, Kiet, Trung

Phiên chia sẻ tập trung vào những thách thức khi triển khai Voice AI cho người dùng Việt Nam.

Tiếng Việt được xem là một ngôn ngữ có nguồn dữ liệu hạn chế hơn so với tiếng Anh và nhiều ngôn ngữ phổ biến khác. Điều này tạo ra những khó khăn liên quan đến nhận dạng giọng nói, cách phát âm, vùng miền, ngữ cảnh và chất lượng phản hồi.

Các diễn giả đề xuất sử dụng quy trình Voice AI theo kiến trúc module:

**Speech-to-Text → Large Language Model → Text-to-Speech**

Cách tiếp cận này cho phép kiểm soát hệ thống tốt hơn so với mô hình speech-to-speech trực tiếp.

Kiến trúc module cho phép nhà phát triển áp dụng:

* Guardrail có tính xác định.
* Kiểm soát hallucination.
* Xác thực nội dung.
* Giới hạn tool calling.
* Các yêu cầu tuân thủ.

Phần trình diễn giới thiệu một hệ thống tư vấn sản phẩm Apple được xây dựng bằng Amazon Bedrock.

Hệ thống có các tính năng:

* Tương tác giọng nói theo thời gian thực.
* Xử lý việc người dùng ngắt lời dựa trên ngữ cảnh.
* Nhận diện giới tính.
* Truy xuất thông tin sản phẩm.
* Tool calling cho các hành động như khóa thẻ.

Phiên chia sẻ giải thích rằng các ngành như ngân hàng cần kiểm soát chặt chẽ phản hồi của AI. Kiến trúc module cho phép từng giai đoạn được giám sát và xác thực trước khi hệ thống thực hiện một hành động nhạy cảm.

### 2.3. Sự phát triển của DevOps AI Agent - Bao, Nguyen

Phiên chia sẻ giới thiệu các AI agent được thiết kế để hỗ trợ hoạt động cloud và các nhóm DevOps.

Mục tiêu chính của DevOps AI Agent là giảm:

* Mean Time to Detect.
* Mean Time to Recovery.
* Công sức điều tra thủ công.
* Thời gian gián đoạn hệ thống.

Phiên chia sẻ giới thiệu khái niệm **Agent Space**, một môi trường logic nơi agent học cấu trúc hệ thống và hiểu mối quan hệ giữa các tài nguyên cloud.

Những tài nguyên được kết nối có thể bao gồm:

* Amazon ECS.
* AWS IAM.
* Amazon RDS.
* Log ứng dụng.
* Chỉ số giám sát.
* Cấu hình bảo mật.

Nền tảng agent được xây dựng dựa trên sáu yếu tố:

* Context.
* Control.
* Integration.
* Collaboration.
* Convenience.
* Cost.

Phần trình diễn trực tiếp mô phỏng một cuộc tấn công từ chối dịch vụ phân tán vào ứng dụng thương mại điện tử.

AI agent phân tích thông tin có sẵn, xác định nguyên nhân có thể xảy ra và đề xuất phương án giảm thiểu trong vòng vài phút.

Tuy nhiên, agent không tự động chấm dứt tài nguyên bị ảnh hưởng. Hệ thống chờ con người phê duyệt trước khi thực hiện hành động có mức ảnh hưởng cao.

Điều này cho thấy tầm quan trọng của phương pháp **Human-in-the-Loop**.

AI agent có thể phân tích dữ liệu và đề xuất hành động, nhưng kỹ sư được cấp quyền vẫn chịu trách nhiệm đối với quyết định cuối cùng.

Phiên chia sẻ cũng giới thiệu mức giá khoảng **0,083 USD mỗi giây**, cho thấy lợi ích vận hành cần được cân bằng với chi phí sử dụng.

### 2.4. Chuyển đổi quy trình nhân sự với Amazon Q - Truong, Minh Anh

Phiên chia sẻ trình bày cách Amazon Q có thể hỗ trợ quy trình tuyển dụng và quản lý nhân tài.

Việc sàng lọc CV theo phương pháp truyền thống có thể tốn nhiều thời gian và bị ảnh hưởng bởi sự thiếu nhất quán hoặc thiên kiến cá nhân.

Amazon Q được sử dụng để tự động hóa các công việc:

* Tạo mô tả công việc.
* Sàng lọc CV ứng viên.
* Xác định kỹ năng kỹ thuật.
* Ước tính cấp độ kinh nghiệm của ứng viên.
* Tạo báo cáo nhân tài.
* So sánh kỳ vọng về mức lương.

Trong phần trình diễn, hệ thống đánh giá một ứng viên tên Thinh.

AI xác định kinh nghiệm kỹ thuật liên quan đến AWS và Kubernetes, đồng thời ước tính cấp độ của ứng viên với độ chính xác khoảng 98% đến 99%.

Hệ thống cũng sử dụng phương pháp chấm điểm khách quan để so sánh ứng viên với yêu cầu công việc.

Cách tiếp cận này có thể rút ngắn thời gian tuyển dụng và hỗ trợ quá trình ra quyết định nhất quán hơn.

Tuy nhiên, phiên chia sẻ cũng nhấn mạnh tầm quan trọng của việc bảo vệ thông tin ứng viên và bảo đảm dữ liệu doanh nghiệp chỉ được xử lý trong môi trường an toàn đã được phê duyệt.

### 2.5. Bảo mật AI doanh nghiệp bằng kết nối riêng và MCP - Toan Nguyen, Nghi Danh

Phiên cuối cùng tập trung vào việc bảo vệ các ứng dụng AI doanh nghiệp bằng kết nối mạng riêng.

Các diễn giả giải thích rằng hệ thống AI có thể truy cập dữ liệu nội bộ nhạy cảm, dịch vụ ứng dụng và công cụ kinh doanh. Việc cho phép dữ liệu truyền qua Internet công cộng có thể làm tăng nguy cơ rò rỉ dữ liệu và tấn công Man-in-the-Middle.

Kiến trúc được đề xuất sử dụng:

* Model Context Protocol.
* Kết nối Amazon VPC.
* Interface Endpoint.
* Route 53 Resolver.
* Application Load Balancer riêng tư.
* Amazon EC2 riêng tư.
* MCP server được triển khai trong mạng riêng.

Model Context Protocol cho phép hệ thống AI giao tiếp với các công cụ và nguồn dữ liệu doanh nghiệp thông qua một giao diện được kiểm soát.

Kết nối riêng giúp dữ liệu ứng dụng không cần truyền qua Internet công cộng.

Chi phí hàng tháng ước tính của kiến trúc riêng tư vào khoảng **250 đến 350 USD**.

Route 53 Resolver được xác định là một thành phần chi phí lớn, chiếm khoảng **180 USD mỗi tháng**.

Mặc dù kiến trúc này làm phát sinh thêm chi phí, nó hỗ trợ:

* Bảo vệ quyền riêng tư của dữ liệu.
* Mô hình bảo mật Zero Trust.
* Kiểm soát truy cập mạng.
* Tuân thủ yêu cầu doanh nghiệp.
* Giảm mức độ tiếp xúc với các mối đe dọa từ mạng công cộng.

Phiên chia sẻ cho thấy bảo mật và kiến trúc mạng là những yêu cầu thiết yếu khi triển khai AI trong môi trường doanh nghiệp.

## 3. Những điều mình học được

Từ Sự kiện 2, mình hiểu thêm về cách điện toán đám mây đang phát triển theo hướng các nền tảng Agentic Cloud.

Hoạt động cloud truyền thống phụ thuộc nhiều vào việc giám sát, điều tra và phản hồi thủ công. Các hệ thống Agentic Cloud sử dụng AI agent để phân tích log, metric, dependency và mối quan hệ giữa các tài nguyên cloud.

Những agent này có thể giảm thời gian điều tra và đưa ra đề xuất nhanh hơn khi xảy ra sự cố.

Mình cũng học được rằng AI agent hoạt động hiệu quả nhất khi hạ tầng nền tảng đã đủ trưởng thành. Agent không thể đưa ra đề xuất đáng tin cậy nếu không có log chính xác, metric phù hợp, thông tin về mối quan hệ tài nguyên và dữ liệu bảo mật.

Phiên Voice AI cho thấy kiến trúc module đặc biệt quan trọng đối với các ứng dụng tiếng Việt. Việc tách riêng nhận dạng giọng nói, xử lý ngôn ngữ và tổng hợp giọng nói giúp kiểm soát hallucination và các hành động nhạy cảm tốt hơn.

Phiên DevOps nhấn mạnh tầm quan trọng của Human-in-the-Loop. AI agent nên hỗ trợ kỹ sư thay vì tự động thực hiện mọi hành động có rủi ro cao.

Phiên nhân sự cho thấy Amazon Q có thể hỗ trợ tuyển dụng thông qua việc phân tích CV, đối chiếu kỹ năng và tạo báo cáo ứng viên. Tuy nhiên, con người vẫn cần tham gia đánh giá trước khi đưa ra quyết định cuối cùng.

Phiên bảo mật cho thấy kết nối riêng rất quan trọng khi hệ thống AI doanh nghiệp truy cập dữ liệu và công cụ nội bộ. Các dịch vụ như VPC Endpoint, Route 53 Resolver và Load Balancer riêng tư có thể ngăn dữ liệu nhạy cảm truyền qua Internet công cộng.

AI có thể thực hiện việc thu thập dữ liệu, phân tích và đưa ra đề xuất, trong khi kỹ sư có kinh nghiệm vẫn chịu trách nhiệm đối với quyết định chiến lược, phê duyệt bảo mật và rủi ro vận hành.

## 4. Phản hồi

Sự kiện mang lại giá trị kỹ thuật cao thông qua các phần trình diễn thực tế và những trường hợp ứng dụng trong doanh nghiệp.

## 5. Kỳ vọng

Sau sự kiện này, mình kỳ vọng sẽ tìm hiểu sâu hơn về các hệ thống Agentic Cloud và cách áp dụng chúng an toàn trong các ứng dụng thực tế.

Những kiến thức này sẽ giúp mình cải thiện hiểu biết về AI agent, vận hành cloud, bảo mật doanh nghiệp, mạng riêng và triển khai AI có trách nhiệm.
