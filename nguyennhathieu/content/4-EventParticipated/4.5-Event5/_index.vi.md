---
title: "Sự kiện 5"
date: 2026-08-01
weight: 5
chapter: false
pre: " <b> 5. </b> "
---

# Sự kiện 5: Agent Forge - Deepdive Ngày 1 (01/08/2026)

## 1. Tổng quan
 
Sự kiện tập trung vào việc xây dựng và triển khai các AI agent sẵn sàng cho môi trường production trên **Amazon Bedrock AgentCore** bằng phương pháp **vibe coding với Kiro**.

Thay vì tự viết mã nguồn thủ công, người tham gia chỉ cần mô tả bằng ngôn ngữ tự nhiên những gì mình muốn xây dựng. Sau đó, Kiro sẽ tạo ra mã ứng dụng, cấu hình hạ tầng, script triển khai, bài kiểm thử và tài liệu cần thiết.

Trong workshop, người tham gia đã xây dựng một **AI Agent hỗ trợ Trả hàng và Hoàn tiền** hoàn chỉnh, sau đó triển khai agent này lên AWS. Workshop giới thiệu toàn bộ vòng đời phát triển AI agent, từ xây dựng logic của agent đến bổ sung bộ nhớ, tích hợp dịch vụ bên ngoài, xác thực, triển khai, giám sát và dọn dẹp tài nguyên.

Workshop được thiết kế để hoàn thành trong khoảng bốn giờ và phù hợp với lập trình viên, quản lý sản phẩm, kiến trúc sư kỹ thuật cũng như những người quan tâm đến phát triển phần mềm có sự hỗ trợ của AI.

## 2. Các chủ đề

Các chủ đề chính được đề cập trong sự kiện gồm:

### Kiro và Vibe Coding

- Sử dụng prompt bằng ngôn ngữ tự nhiên để tạo phần mềm hoạt động được
- Xây dựng tính năng mà không cần tự viết mã thủ công
- Sử dụng phương pháp phát triển dựa trên đặc tả để chuyển ý tưởng thành các yêu cầu có cấu trúc
- Sử dụng Agent Hooks để tự động hóa quy trình phát triển
- Kết nối với các công cụ và dịch vụ bên ngoài thông qua MCP
- Tạo mã nguồn đã được kiểm thử, có tài liệu và sẵn sàng để triển khai

### Strands Agents SDK

- Xây dựng AI agent bằng Strands Agents SDK mã nguồn mở
- Tạo các công cụ tùy chỉnh cho agent
- Quản lý bộ nhớ và ngữ cảnh hội thoại của agent
- Điều phối luồng hoạt động của agent
- Kết nối agent với các dịch vụ bên ngoài

### Amazon Bedrock AgentCore

- **AgentCore Memory** để ghi nhớ tùy chọn của người dùng và lịch sử hội thoại
- **AgentCore Gateway** để kết nối an toàn với API và cơ sở dữ liệu
- **AgentCore Runtime** để triển khai và mở rộng AI agent
- **AgentCore Observability** để theo dõi hiệu năng của agent
- Tích hợp AgentCore với Amazon CloudWatch

### Các dịch vụ AWS

- Amazon Bedrock
- AWS Lambda
- Amazon Cognito
- AWS Identity and Access Management
- Amazon CloudWatch
- Triển khai và dọn dẹp hạ tầng AWS

### Các bài thực hành trong workshop

#### Lab 1: Kiro và Vibe Coding

- Thiết lập môi trường phát triển
- Cấu hình thông tin xác thực AWS
- Tìm hiểu cách tương tác với Kiro
- Tạo phần mềm bằng cách mô tả yêu cầu bằng ngôn ngữ tự nhiên

#### Lab 2: Xây dựng và triển khai AI Agent

- Xây dựng trợ lý Trả hàng và Hoàn tiền bằng Strands Agents
- Bổ sung bộ nhớ lâu dài bằng AgentCore Memory
- Tạo các Lambda function và cơ chế xác thực
- Cấu hình AgentCore Gateway
- Triển khai agent bằng AgentCore Runtime
- Bổ sung log, metric, dashboard và hệ thống giám sát
- Dọn dẹp tài nguyên AWS sau khi hoàn thành workshop

## 3. Những gì mình đã học được

Qua sự kiện này, mình hiểu rằng phát triển phần mềm có sự hỗ trợ của AI có thể rút ngắn đáng kể quá trình xây dựng các ứng dụng đám mây.

Mình đã học được cách Kiro chuyển các yêu cầu bằng ngôn ngữ tự nhiên thành đặc tả có cấu trúc, mã ứng dụng, script hạ tầng, bài kiểm thử và tài liệu. Điều này cho mình thấy rằng lập trình viên có thể tập trung nhiều hơn vào thiết kế hệ thống và yêu cầu nghiệp vụ, thay vì dành phần lớn thời gian để viết những đoạn mã lặp lại.

Mình cũng hiểu rõ hơn về kiến trúc của một AI agent được sử dụng trong môi trường production. Một AI agent hoàn chỉnh không chỉ cần mô hình ngôn ngữ mà còn cần:

- Các công cụ để thực hiện những tác vụ trong thực tế
- Bộ nhớ để duy trì ngữ cảnh
- Khả năng truy cập an toàn đến các dịch vụ bên ngoài
- Cơ chế xác thực và phân quyền
- Môi trường runtime có khả năng mở rộng
- Log, metric và hệ thống giám sát
- Quy trình dọn dẹp tài nguyên đám mây an toàn

Workshop cũng giúp mình hiểu vai trò của từng thành phần trong Amazon Bedrock AgentCore:

- Memory lưu trữ ngữ cảnh của người dùng và cuộc hội thoại.
- Gateway kết nối agent với các API và dịch vụ bên ngoài.
- Runtime lưu trữ, vận hành và mở rộng agent.
- Observability cung cấp log và thông tin hỗ trợ theo dõi hoạt động.

Một bài học quan trọng khác là mã nguồn do AI tạo ra vẫn cần được con người kiểm tra. Ngay cả khi Kiro tạo mã tự động, lập trình viên vẫn nên xác minh quyền truy cập, cấu hình bảo mật, hạ tầng được tạo, hạn ngạch dịch vụ, khu vực triển khai và chi phí AWS có thể phát sinh.

## 4. Phản hồi

Workshop mang tính thực hành cao và tạo được sự hứng thú vì trình bày một dự án AI agent hoàn chỉnh từ đầu đến cuối, thay vì chỉ tập trung vào lý thuyết.

Điểm nổi bật nhất của sự kiện là việc sử dụng prompt bằng ngôn ngữ tự nhiên để tạo cả mã ứng dụng và hạ tầng AWS. Cách tiếp cận này giúp các dịch vụ tương đối phức tạp như Amazon Bedrock AgentCore, Lambda, Cognito, IAM và CloudWatch trở nên dễ hiểu và dễ tiếp cận hơn.

Tình huống Trả hàng và Hoàn tiền cũng rất hữu ích vì minh họa được cách AI agent có thể giải quyết một vấn đề kinh doanh thực tế.

Một số điểm có thể được cải thiện:

- Nên dành thêm thời gian để giải thích mã nguồn được tạo ra.
- Workshop có thể bổ sung thêm các ví dụ về xử lý lỗi.
- Một bảng ước tính chi phí chi tiết sẽ hữu ích cho những người sử dụng tài khoản AWS cá nhân.
- Nên giải thích sâu hơn về quyền IAM và các nguyên tắc bảo mật.
- Có thể bổ sung ví dụ về thời điểm lập trình viên nên chỉnh sửa mã do AI tạo ra.
- Một sơ đồ kiến trúc ngắn sẽ giúp người học hiểu rõ hơn mối quan hệ giữa các thành phần của AgentCore.

Nhìn chung, sự kiện là một phần giới thiệu có giá trị về vibe coding và quá trình phát triển AI agent dùng trong môi trường production trên AWS.

## 5. Kỳ vọng

Trong Ngày 2, mình kỳ vọng sẽ được tìm hiểu sâu hơn về các công nghệ và có thêm nhiều trải nghiệm thực hành.

Mình muốn tìm hiểu thêm về:

- Cách kiểm tra và cải thiện mã nguồn do AI tạo ra
- Cách quản lý bộ nhớ dài hạn và ngữ cảnh riêng của từng người dùng
- Cách đánh giá phản hồi của agent và giảm hiện tượng hallucination
- Cách theo dõi độ trễ, lượng token sử dụng, lỗi và chi phí
- Cách kiểm thử agent trước khi triển khai lên môi trường production

