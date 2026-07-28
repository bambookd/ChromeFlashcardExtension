---

title: "Sự kiện 1"
date: 2026-07-26
weight: 1
chapter: false
pre: " <b> 1. </b> "
--------------------

# Sự kiện 1

## 1. Tổng quan

Sự kiện 1 bao gồm ba phiên chia sẻ kỹ thuật liên quan đến AWS Cloud, giám sát hệ thống và bảo mật ứng dụng.

Sự kiện giới thiệu về kỳ thi AWS Certified Cloud Practitioner, giải thích tầm quan trọng của việc giám sát các hoạt động thực tế của người dùng, đồng thời trình bày AWS Security Agent như một công cụ hỗ trợ rà soát bảo mật và kiểm thử xâm nhập tự động.

Các phiên chia sẻ giúp mình kết nối kiến thức nền tảng về AWS với những chủ đề thực tế như vận hành hệ thống đám mây, phát hiện sự cố, trải nghiệm người dùng và phát triển phần mềm an toàn.

## 2. Các chủ đề

### 2.1. Kỳ thi AWS Cloud Practitioner - Ngo Le Tan Huy

AWS Certified Cloud Practitioner là một chứng chỉ nền tảng, tập trung vào các khái niệm tổng quan về AWS và trường hợp sử dụng của các dịch vụ.

Kỳ thi gồm 65 câu hỏi, có thời lượng 90 phút và yêu cầu điểm đạt là 700 trên thang điểm 1.000.

Nội dung kỳ thi được chia thành bốn lĩnh vực:

* **Khái niệm về Cloud — 24%**
* **Bảo mật và tuân thủ — 30%**
* **Công nghệ và dịch vụ Cloud — 34%**
* **Thanh toán, định giá và hỗ trợ — 12%**

Phiên chia sẻ giới thiệu các chủ đề quan trọng như mô hình Trách nhiệm Chia sẻ của AWS, AWS IAM, định giá dịch vụ đám mây, các gói hỗ trợ và những dịch vụ AWS phổ biến như EC2, Lambda, S3, RDS, DynamoDB, VPC và Route 53.

Người trình bày khuyến nghị nên học các dịch vụ AWS thông qua trường hợp sử dụng thực tế và những từ khóa liên quan. Việc xem lại các câu trả lời sai trong bài thi thử cũng được giới thiệu như một phương pháp ôn tập hiệu quả.

### 2.2. SLA và giám sát hệ thống - Nguyen Huynh Son

Thông điệp chính của phiên chia sẻ là:

**Hạ tầng hoạt động ổn định không đồng nghĩa với trải nghiệm người dùng tốt.**

Một máy chủ có thể có mức sử dụng CPU và bộ nhớ bình thường, trong khi người dùng vẫn không thể đăng nhập hoặc hoàn thành các thao tác quan trọng.

SLA của AWS chỉ áp dụng cho từng dịch vụ AWS riêng lẻ, trong khi chủ sở hữu ứng dụng vẫn chịu trách nhiệm đối với toàn bộ trải nghiệm của khách hàng.

Mô hình giám sát bao gồm năm tầng:

* Nhà cung cấp dịch vụ đám mây.
* Hạ tầng.
* Ứng dụng.
* Hoạt động kinh doanh.
* Trải nghiệm khách hàng.

Phần trình diễn trực tiếp cho thấy một endpoint kiểm tra tình trạng hệ thống vẫn có thể trả về phản hồi thành công, trong khi endpoint đăng nhập lại thất bại do sự cố kết nối cơ sở dữ liệu.

Phiên chia sẻ cũng giới thiệu một quy trình cảnh báo sử dụng custom metric, Amazon CloudWatch Alarm, Amazon SNS và thông báo qua email hoặc Slack.

Phiên này cho thấy việc giám sát cần bao gồm các hành động thực tế của người dùng như đăng nhập, thanh toán, mua hàng và tìm kiếm, thay vì chỉ dựa vào các chỉ số hạ tầng.

### 2.3. AWS Security Agent - Thinh Nguyen

AWS Security Agent được giới thiệu như một giải pháp bảo mật tự động được hỗ trợ bởi Amazon Bedrock.

Giải pháp này hỗ trợ ba hoạt động chính:

* Rà soát bảo mật thiết kế.
* Rà soát bảo mật mã nguồn.
* Kiểm thử xâm nhập tự động.

Đối với rà soát thiết kế, agent có thể phân tích tài liệu kiến trúc, tệp Markdown và mã Terraform. Hệ thống có thể so sánh thiết kế với các tiêu chuẩn bảo mật như PCI DSS, NIST Cybersecurity Framework và hướng dẫn AWS Well-Architected.

Đối với rà soát mã nguồn, agent có thể tích hợp với pull request trên GitHub hoặc GitLab, phát hiện lỗ hổng, nhận diện secret bị lộ và đề xuất phương án sửa mã.

Đối với kiểm thử xâm nhập, agent có thể kiểm tra các ứng dụng đang hoạt động, xác thực như một người dùng, thực hiện các chuỗi tấn công nhiều bước và cung cấp bằng chứng cho những lỗ hổng đã được xác minh.

Phiên chia sẻ cũng đề cập đến một số hạn chế. Các phương thức xác thực như MFA, sinh trắc học và mutual TLS có thể ngăn agent truy cập vào ứng dụng. Những lỗ hổng liên quan đến logic nghiệp vụ phức tạp vẫn có thể cần sự phân tích của con người.

Chi phí cũng cần được giám sát vì các ứng dụng phức tạp có thể tiêu tốn nhiều task-hour. Các công cụ bảo mật tự động có thể hỗ trợ chuyên gia bảo mật, nhưng không thể thay thế hoàn toàn việc đánh giá của con người.

## 3. Những điều mình học được

Từ Sự kiện 1, mình học thêm về chứng chỉ AWS, giám sát ứng dụng và bảo mật trên nền tảng đám mây.

Phiên AWS Cloud Practitioner giúp mình hiểu rõ hơn về các nhóm dịch vụ chính của AWS, mô hình Trách nhiệm Chia sẻ, các khái niệm bảo mật, mô hình định giá và chiến lược chuẩn bị cho kỳ thi.

Phiên giám sát hệ thống giúp mình hiểu rằng các chỉ số kỹ thuật không thể phản ánh đầy đủ tình trạng của một ứng dụng. Chỉ số hạ tầng hữu ích trong việc xác định nguyên nhân gốc rễ, nhưng các chỉ số kinh doanh và trải nghiệm người dùng mới cho thấy người dùng có thực sự bị ảnh hưởng hay không.

Mình cũng học được cách Amazon CloudWatch và Amazon SNS có thể được sử dụng để phát hiện lỗi và gửi thông báo cho nhóm phụ trách.

Phiên AWS Security Agent giúp mình hiểu cách đưa bảo mật vào toàn bộ vòng đời phát triển phần mềm, từ thiết kế kiến trúc, rà soát mã nguồn cho đến kiểm thử ứng dụng sau khi triển khai.

Mình cũng nhận ra rằng các công cụ bảo mật tự động có thể hỗ trợ lập trình viên và kỹ sư bảo mật, nhưng không thể thay thế hoàn toàn việc đánh giá của con người, sự hiểu biết về ngữ cảnh ứng dụng và hoạt động quản lý chi phí.

Sự kiện giúp mình cải thiện khả năng:

* Kết nối kiến thức AWS với các tình huống thực tế.
* Đánh giá hệ thống từ góc nhìn của người dùng.
* Cân nhắc yếu tố giám sát, bảo mật và chi phí trong quá trình phát triển.
* Tóm tắt các bài trình bày kỹ thuật.
* Xác định những nội dung cần tiếp tục nghiên cứu.

## 4. Phản hồi

Sự kiện cung cấp nhiều kiến thức hữu ích và được tổ chức tốt. Các diễn giả giải thích chủ đề rõ ràng và sử dụng những ví dụ thực tế.

Phần trình diễn về giám sát đặc biệt hữu ích vì cho thấy sự khác biệt giữa tình trạng hạ tầng và trải nghiệm thực tế của người dùng.

Các sự kiện trong tương lai có thể bổ sung thêm bài thực hành và dành nhiều thời gian hơn cho phần hỏi đáp.

## 5. Kỳ vọng

Sau Sự kiện 1, mình mong muốn sẽ tiếp tục cải thiện kiến thức về AWS và chuẩn bị cho các chứng chỉ AWS.

Mình cũng muốn áp dụng các khái niệm giám sát vào dự án thực tập bằng cách tạo các metric theo dõi lỗi đăng nhập, lỗi API, mức độ hoàn thành phiên học và các hành động quan trọng khác của người dùng.

Về bảo mật, mình kỳ vọng sẽ rà soát kiến trúc ứng dụng, các tệp infrastructure as code và mã nguồn sớm hơn trong quá trình phát triển.

Một số hoạt động hữu ích trong tương lai có thể bao gồm:

* Một bài thi thử AWS Cloud Practitioner.
* Một buổi thực hành Amazon CloudWatch.
* Một bài mô phỏng xử lý sự cố.
* Một buổi rà soát bảo mật dự án AWS SAM hoặc Terraform.
* Một bài so sánh giữa kiểm thử bảo mật tự động và thủ công.

Những hoạt động này sẽ giúp mình cải thiện kỹ năng về điện toán đám mây, giám sát, ứng phó sự cố và bảo mật ứng dụng.
