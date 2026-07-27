---
title: "Event 1"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 4.1. </b> "
---


# Bài thu hoạch Event 1: AWS Cloud, Monitoring và Bảo mật ứng dụng

### Mục Đích Của Sự Kiện

- Giúp người tham dự hiểu vai trò của **Service Level Agreement (SLA)** và monitoring trong quản trị rủi ro dịch vụ
- Làm rõ sự khác biệt giữa hạ tầng hoạt động ổn định và trải nghiệm thực tế của người dùng
- Cung cấp lộ trình học tập và chiến lược chuẩn bị cho kỳ thi **AWS Certified Cloud Practitioner (CLF-C02)**
- Củng cố kiến thức nền tảng về cloud concepts, security, AWS services, billing và support
- Giới thiệu cách ứng dụng **AWS Security Agent** vào design review, code review và automated penetration testing
- Nâng cao nhận thức về vận hành, bảo mật và trách nhiệm của đội ngũ xây dựng hệ thống trên AWS

### Danh Sách Diễn Giả

- **Nguyễn Huỳnh Sơn** - Infrastructure Support Engineer tại Endava, thành viên AWS Student Builder Group HUFLIT
- **Ngô Lê Tấn Huy** - Diễn giả chủ đề *Inside the Exam: AWS Cloud Practitioner*
- **Nguyễn Tuấn Thịnh** - DevOps/DevSecOps/Cloud Engineer tại Styl Solutions, First Cloud AI Journey

### Nội Dung Nổi Bật

#### Chủ đề 1: SLA and Monitoring - From SLA to Monitoring What Really Matters

**Service Level Agreement (SLA)** là thỏa thuận chính thức xác định mức dịch vụ được kỳ vọng giữa nhà cung cấp và khách hàng. SLA giúp thiết lập kỳ vọng rõ ràng, tăng trách nhiệm cung cấp dịch vụ, hỗ trợ quản trị rủi ro và tạo cơ sở đo lường hiệu suất.

Tuy nhiên, SLA của cloud provider không bảo đảm toàn bộ ứng dụng luôn mang lại trải nghiệm tốt cho người dùng. AWS services, server và health check có thể vẫn hiển thị trạng thái ổn định, trong khi người dùng không thể đăng nhập hoặc hoàn thành một tác vụ nghiệp vụ quan trọng.

- **Risk management loop**: Identify risk → Monitor signals → Respond → Improve
- **Monitor signals**: Metrics, logs và alarms
- **Response mechanisms**: CloudWatch Alarm, Amazon SNS, email hoặc Slack notification và SOP xử lý sự cố
- **Customer journey metrics**: Login success, checkout, payment, search và order success
- **Application metrics**: Errors, latency, requests và dependency status
- **Infrastructure metrics**: CPU, memory, disk, network và healthy host

Mô hình monitoring được trình bày theo nhiều tầng, từ cloud provider, infrastructure và application cho đến business metrics và customer experience. Các chỉ số tầng dưới hỗ trợ tìm nguyên nhân sự cố, còn các chỉ số tầng trên cho biết người dùng và hoạt động kinh doanh có đang bị ảnh hưởng hay không.

Thông điệp chính của chủ đề:

> **Healthy Infrastructure ≠ Healthy User Experience**

#### Chủ đề 2: Inside the Exam - AWS Cloud Practitioner

Chủ đề thứ hai giới thiệu tổng quan về kỳ thi **AWS Certified Cloud Practitioner (CLF-C02)**. Đây là chứng chỉ nền tảng, tập trung vào bức tranh tổng thể của AWS Cloud và không yêu cầu thí sinh phải biết lập trình hoặc thực hiện cấu hình hệ thống chuyên sâu.

Cấu trúc nội dung của kỳ thi gồm bốn domain:

- **Domain 1 - Cloud Concepts (24%)**: Lợi ích của AWS Cloud, AWS Well-Architected Framework và AWS Cloud Adoption Framework
- **Domain 2 - Security and Compliance (30%)**: Shared Responsibility Model, IAM, nguyên tắc least privilege, Security Groups, NACLs, AWS Shield, AWS WAF và AWS Artifact
- **Domain 3 - Cloud Technology and Services (34%)**: Region, Availability Zone, Edge Location, EC2, Lambda, S3, EBS, EFS, RDS, DynamoDB, VPC và Route 53
- **Domain 4 - Billing, Pricing, and Support (12%)**: Các mô hình giá EC2, AWS Cost Explorer, AWS Budgets và AWS Support Plans

Các thông tin về hình thức thi được trình bày trong sự kiện bao gồm 65 câu hỏi, thời gian làm bài 90 phút và điểm đạt là 700 trên thang điểm từ 100 đến 1.000. Chứng chỉ có thời hạn ba năm và có thể thi tại Pearson VUE hoặc thi online với remote proctoring.

Diễn giả cũng chia sẻ một số phương pháp chuẩn bị:

- **Map Keyword Thinking**: Liên kết từng AWS service với một hoặc hai từ khóa use case
- **Review Mistakes**: Phân tích lý do đáp án đúng và lý do các đáp án còn lại không phù hợp
- **Hands-on Practice**: Thực hành EC2, S3, IAM và các dịch vụ cơ bản trên AWS Free Tier
- **Reference Materials**: AWS Skill Builder, Udemy courses và mock exams
- **Exam Strategy**: Dùng phương pháp loại trừ, chú ý các từ khóa như “NOT”, “least cost”, “most scalable” và không suy diễn câu hỏi quá phức tạp
- **Time Management**: Đánh dấu câu chưa chắc chắn bằng chức năng flag for review và quay lại sau

#### Chủ đề 3: Securing Your Web Apps With AWS Security Agent

Chủ đề cuối tập trung vào những hạn chế của quy trình kiểm thử bảo mật thủ công và cách một security agent có thể hỗ trợ tự động hóa. Theo nội dung trình bày, manual penetration testing thường mất nhiều thời gian, cần nhân sự chuyên môn cao, có chi phí lớn và mức độ bao phủ có thể không đồng đều.

AWS Security Agent được giới thiệu với khả năng autonomous reasoning dựa trên Amazon Bedrock, cho phép lập kế hoạch và thực hiện các tác vụ bảo mật trong nhiều giai đoạn của vòng đời phát triển ứng dụng.

Ba nhóm khả năng chính gồm:

- **Design Security Review**: Phân tích architecture documents, Markdown hoặc Terraform trước khi code được triển khai; kiểm tra thiết kế theo các managed packs như PCI DSS, NIST CSF và AWS Well-Architected
- **Code Security Review**: Tích hợp với GitHub hoặc GitLab pull requests, phát hiện vulnerabilities và secrets, comment trực tiếp trên dòng code và đề xuất bản sửa lỗi
- **Automated Pentesting**: Kiểm thử ứng dụng đang chạy, xác thực như người dùng thực, thực hiện multi-step exploit chains và cung cấp attack graph cùng bằng chứng có thể kiểm chứng

Bên cạnh lợi ích, diễn giả cũng nêu một số giới hạn quan trọng:

- MFA, biometrics và mTLS có thể ngăn agent truy cập vào luồng cần kiểm thử
- Business logic flaws khó phát hiện nếu agent không có đủ context nghiệp vụ
- Ứng dụng phức tạp có thể tiêu thụ nhiều task-hours nên cần theo dõi chi phí chặt chẽ
- Agent không thay thế hoàn toàn chuyên gia bảo mật mà đóng vai trò tăng tốc và mở rộng phạm vi kiểm tra

### Những Gì Học Được

#### Tư Duy Monitoring và Reliability

- Monitoring cần bắt đầu từ **customer journey**, không chỉ từ CPU hoặc memory
- Các business metrics như login success rate và order success phản ánh trực tiếp ảnh hưởng tới người dùng
- Health check đơn giản có thể bỏ sót lỗi dependency như database connection
- CloudWatch custom metrics, alarms và SNS giúp phát hiện và thông báo sự cố trước khi khách hàng phản ánh
- SLA cần được hiểu đúng phạm vi; cloud provider bảo đảm dịch vụ cloud, còn đội ngũ phát triển chịu trách nhiệm về trải nghiệm end-to-end

#### Nền Tảng AWS và Chiến Lược Học Chứng Chỉ

- Hiểu bốn domain của CLF-C02 giúp phân bổ thời gian học tập hợp lý
- Shared Responsibility Model là kiến thức xuyên suốt giữa vận hành và bảo mật
- Học AWS services theo use case và keyword giúp ghi nhớ hiệu quả hơn
- Việc phân tích câu sai có giá trị hơn chỉ làm thật nhiều mock tests
- Hands-on practice giúp kết nối khái niệm lý thuyết với hệ thống thực tế

#### Tư Duy DevSecOps và Tự Động Hóa Bảo Mật

- Security nên được kiểm tra từ giai đoạn thiết kế thay vì chờ đến khi ứng dụng hoàn thành
- Tích hợp security review vào pull request giúp phát hiện lỗi sớm trong development workflow
- Automated pentesting có thể mở rộng phạm vi kiểm tra và tạo bằng chứng rõ ràng
- AI agent vẫn cần con người cung cấp context, đánh giá kết quả và kiểm soát phạm vi cũng như chi phí
- Bảo mật, monitoring và reliability cần được thiết kế như những thành phần liên kết của cùng một hệ thống


### Trải nghiệm trong event

Tham gia Event là một trải nghiệm hữu ích vì ba chủ đề đã kết nối kiến thức nền tảng, hoạt động vận hành và bảo mật thành một bức tranh tương đối hoàn chỉnh về AWS. Tôi không chỉ được học về các dịch vụ cloud mà còn hiểu rõ hơn cách những dịch vụ đó cần được giám sát, bảo vệ và gắn với trải nghiệm thực tế của người dùng.

#### Học hỏi từ các diễn giả có kinh nghiệm thực tế

- Các diễn giả chia sẻ nội dung từ nhiều góc nhìn gồm infrastructure support, cloud certification và DevSecOps
- Những ví dụ thực tế giúp các khái niệm như SLA, customer journey monitoring và security review trở nên dễ hiểu hơn
- Các kinh nghiệm luyện thi giúp tôi xác định phương pháp học có hệ thống thay vì chỉ ghi nhớ tên dịch vụ

#### Trải nghiệm kỹ thuật thực tế

- Demo về hai endpoint cho thấy health check thành công chưa chắc đồng nghĩa với login thành công
- Luồng custom metric → CloudWatch Alarm → SNS giúp tôi hình dung rõ quy trình cảnh báo sự cố
- Phần automated pentesting cho thấy AI agent có thể kiểm thử theo nhiều bước và cung cấp bằng chứng thay vì chỉ đưa ra nhận xét chung

#### Ứng dụng công cụ hiện đại

- Tìm hiểu cách sử dụng CloudWatch metrics, alarms và SNS trong monitoring
- Biết thêm các nguồn học như AWS Skill Builder và AWS Free Tier để chuẩn bị chứng chỉ
- Tiếp cận mô hình security agent hỗ trợ design review, code review và penetration testing

#### Kết nối và trao đổi

- Event tạo cơ hội trao đổi về lộ trình học AWS, kinh nghiệm thi chứng chỉ và công việc cloud thực tế
- Qua ba chủ đề, tôi nhận thấy kiến thức cloud không nên được học tách rời giữa development, operations và security
- Những nội dung được chia sẻ giúp tôi có thêm định hướng cho việc phát triển kỹ năng Cloud, DevOps và DevSecOps

#### Bài học rút ra

- Một dashboard toàn màu xanh chưa đủ để kết luận hệ thống đang phục vụ người dùng tốt
- Kiến thức nền tảng từ Cloud Practitioner là cơ sở để tiếp tục học các chứng chỉ và kỹ năng AWS chuyên sâu
- Security cần được đưa vào toàn bộ vòng đời phát triển, nhưng công cụ tự động không thể thay thế hoàn toàn tư duy và đánh giá của con người
- Hệ thống đáng tin cậy cần kết hợp đúng kiến thức cloud, monitoring theo trải nghiệm người dùng và quy trình bảo mật chủ động

#### Một số hình ảnh khi tham gia sự kiện
* Thêm các hình ảnh của các bạn tại đây

> Tổng thể, Event 1 giúp tôi hiểu rằng xây dựng hệ thống trên AWS không chỉ là triển khai tài nguyên. Một giải pháp cloud hoàn chỉnh còn cần được giám sát dựa trên trải nghiệm người dùng, vận hành theo các cam kết phù hợp và bảo vệ xuyên suốt vòng đời phát triển ứng dụng.
