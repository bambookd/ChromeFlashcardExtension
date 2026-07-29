---

title: "Blog 3"
date: 2026-07-26
weight: 3
chapter: false
pre: " <b> 3.3 </b> "
---------------------

# Bảo mật dữ liệu trên Cloud: Tìm hiểu AWS Key Management Service (KMS)

|            |                                                                          |
| ---------- | ------------------------------------------------------------------------ |
| Ngày đăng  | 26/07/2026                                                         |
| Nền tảng   | AWS Study Group                                                          |
| Liên kết   | https://www.facebook.com/groups/awsstudygroupfcj/posts/2225146494916977/ |
| Minh chứng | ![](/images/3-BlogsPosted/3.3-Blog3/image.png)             |

Xin chào mọi người!

Khi xây dựng các hệ thống backend, chúng ta thường xuyên làm việc với cơ sở dữ
liệu, các dịch vụ lưu trữ và API. Bảo vệ dữ liệu luôn là một trong những ưu tiên
hàng đầu, đặc biệt khi ứng dụng ngày càng mở rộng.

Một câu hỏi phổ biến thường được đặt ra là:

> Làm thế nào để mã hóa dữ liệu một cách an toàn mà không phải tự thiết kế và
> vận hành toàn bộ hệ thống quản lý khóa mật mã?

Trong bài viết này, mình sẽ giới thiệu về **AWS Key Management Service
(AWS KMS)**, một dịch vụ mạnh mẽ của AWS được thiết kế để quản lý vòng đời của
các khóa mật mã.

## AWS KMS là gì?

AWS Key Management Service là một dịch vụ được quản lý hoàn toàn, cho phép bạn
tạo, kiểm soát và luân chuyển các khóa mật mã được sử dụng để mã hóa dữ liệu
hoặc tạo chữ ký số.

AWS KMS hỗ trợ nhiều loại khóa cho các use case khác nhau:

* Khóa mã hóa đối xứng sử dụng AES-256.
* Khóa bất đối xứng RSA và mật mã đường cong elliptic.
* Khóa HMAC để tạo và xác minh mã xác thực thông điệp.

Một trong những đặc điểm quan trọng nhất của AWS KMS là cách dịch vụ này bảo vệ
các khóa ở cấp độ phần cứng vật lý.

## Các tính năng chính của AWS KMS

### 1. Bảo mật ở cấp độ phần cứng

Các khóa AWS KMS không được lưu trữ trên những EC2 instance thông thường hoặc
trong các cơ sở dữ liệu tiêu chuẩn. Thay vào đó, chúng được tạo và quản lý bên
trong các **Hardware Security Module**, thường được gọi là HSM.

Đây là những thiết bị được thiết kế chuyên biệt để bảo vệ vật liệu mật mã và
được xác thực theo các yêu cầu bảo mật **FIPS 140 Level 3**.

Dạng plaintext của KMS key không bao giờ rời khỏi ranh giới phần cứng của AWS
KMS. Nhân viên AWS không thể xuất hoặc truy cập trực tiếp vào plaintext key
material.

Điều này giúp giảm đáng kể các rủi ro liên quan đến việc tự lưu trữ và quản lý
khóa mã hóa theo cách thủ công.

### 2. Tích hợp sâu với các dịch vụ AWS

Một trong những lý do AWS KMS được sử dụng rộng rãi là khả năng tích hợp liền
mạch với nhiều dịch vụ trong hệ sinh thái AWS.

#### Amazon S3

Amazon S3 có thể tự động mã hóa object trước khi lưu trữ bằng cơ chế mã hóa phía
máy chủ với AWS KMS key, còn được gọi là **SSE-KMS**.

#### Amazon RDS

Amazon RDS có thể sử dụng AWS KMS để mã hóa database instance, bản sao lưu tự
động, snapshot và read replica.

#### Amazon EBS

Amazon EBS có thể mã hóa các volume lưu trữ ảo được gắn vào Amazon EC2
instance.

#### AWS Lambda

AWS Lambda sử dụng mã hóa để bảo vệ environment variable khi dữ liệu được lưu
trữ. AWS KMS cũng có thể được sử dụng khi ứng dụng cần kiểm soát chặt chẽ hơn
cách các giá trị cấu hình nhạy cảm được mã hóa và giải mã.

Nhờ khả năng tích hợp trực tiếp với các dịch vụ này, ứng dụng có thể sử dụng một
hệ thống quản lý khóa tập trung mà không cần xây dựng một hạ tầng mã hóa riêng.

### 3. Kiểm soát quyền truy cập chi tiết và kiểm toán

Chỉ mã hóa dữ liệu là chưa đủ. Một hệ thống an toàn cũng phải kiểm soát được ai
hoặc thành phần nào có quyền sử dụng từng khóa mã hóa.

AWS KMS tích hợp chặt chẽ với AWS Identity and Access Management. Bạn có thể sử
dụng IAM policy và KMS key policy để xác định các quyền như:

* User hoặc service nào được phép mã hóa dữ liệu.
* Ứng dụng nào được phép giải mã dữ liệu.
* Ai có thể quản lý, vô hiệu hóa, luân chuyển hoặc xóa khóa.
* Tài nguyên AWS nào được phép sử dụng một khóa cụ thể.

Mọi request đến AWS KMS API cũng có thể được ghi lại thông qua AWS CloudTrail,
bao gồm các thao tác như:

* Tạo khóa.
* Mã hóa và giải mã dữ liệu.
* Tạo data key.
* Cập nhật policy.
* Lên lịch xóa khóa.

Các audit log này hỗ trợ quá trình giám sát, điều tra bảo mật và đáp ứng các yêu
cầu tuân thủ.

## Khái niệm cốt lõi: Envelope Encryption

Giả sử bạn đang xây dựng một backend API bằng FastAPI hoặc Spring Boot để xử lý
hàng trăm gigabyte dữ liệu video.

API `Encrypt` của AWS KMS chỉ hỗ trợ một lượng plaintext giới hạn trong mỗi
request trực tiếp. Đối với các tệp hoặc tập dữ liệu lớn, ứng dụng thường sử dụng
một phương pháp gọi là **envelope encryption**.

Envelope encryption sử dụng hai cấp độ khóa:

* Một KMS key dùng để bảo vệ các khóa mã hóa khác.
* Một data key dùng để mã hóa trực tiếp dữ liệu của ứng dụng.

Quy trình hoạt động như sau.

### Bước 1: Tạo data key

Ứng dụng backend gửi request đến AWS KMS để tạo một data key.

AWS KMS trả về hai phiên bản của khóa:

1. Một plaintext data key.
2. Một data key đã được mã hóa, còn gọi là ciphertext data key.

Ciphertext data key được bảo vệ bởi KMS key.

### Bước 2: Mã hóa dữ liệu cục bộ

Ứng dụng sử dụng plaintext data key để mã hóa tệp hoặc dữ liệu thực tế ngay
trong môi trường ứng dụng.

Thao tác này có thể được thực hiện bằng các công cụ như:

* AWS Encryption SDK.
* OpenSSL.
* Các thư viện mật mã được cung cấp bởi ngôn ngữ lập trình của ứng dụng.

Đối tượng dữ liệu lớn không cần được gửi đến AWS KMS.

### Bước 3: Xóa plaintext data key

Sau khi quá trình mã hóa hoàn tất, ứng dụng nên ngay lập tức xóa plaintext data
key khỏi bộ nhớ.

Phiên bản plaintext không nên được lưu trữ lâu dài.

### Bước 4: Lưu trữ dữ liệu đã mã hóa

Ứng dụng lưu trữ hai thành phần cùng nhau:

* Tệp hoặc dữ liệu đã được mã hóa.
* Ciphertext data key.

Ví dụ, cả hai thành phần có thể được lưu trong Amazon S3 hoặc cơ sở dữ liệu.

Khi ứng dụng cần giải mã dữ liệu, nó gửi ciphertext data key đến AWS KMS. Sau
khi KMS giải mã data key, ứng dụng tạm thời sử dụng phiên bản plaintext để giải
mã tệp ở môi trường local.

{{% notice info %}}
**Điểm quan trọng:** Envelope encryption giúp cải thiện hiệu năng và giảm độ trễ
mạng vì các tập dữ liệu lớn không cần truyền qua AWS KMS. Ứng dụng thực hiện mã
hóa và giải mã dữ liệu cục bộ, trong khi KMS key gốc vẫn tiếp tục bảo vệ các data
key.
{{% /notice %}}

## AWS KMS và AWS Secrets Manager

AWS KMS và AWS Secrets Manager giải quyết những vấn đề bảo mật có liên quan
nhưng khác nhau.

**AWS KMS** quản lý các khóa mật mã được sử dụng cho quá trình mã hóa, giải mã,
tạo chữ ký số và xác thực thông điệp.

**AWS Secrets Manager** lưu trữ và quản lý các giá trị bí mật như:

* Mật khẩu cơ sở dữ liệu.
* API token.
* Thông tin xác thực của ứng dụng.
* Khóa truy cập dịch vụ bên thứ ba.

Secrets Manager có thể sử dụng AWS KMS để mã hóa các secret được lưu trữ, nhưng
bản thân AWS KMS không thể thay thế một dịch vụ quản lý secret.

## Kết luận

AWS KMS giúp việc bảo vệ dữ liệu nhạy cảm trở nên dễ dàng hơn mà không cần xây
dựng và vận hành một hạ tầng quản lý khóa phức tạp.

Dù bạn đang phát triển microservice, ứng dụng container, backend API hay quy
trình CI/CD, AWS KMS đều cung cấp một nền tảng tập trung và an toàn để quản lý
các khóa mật mã.

Những ưu điểm chính của dịch vụ bao gồm:

* Bảo vệ khóa bằng phần cứng.
* Tích hợp với nhiều dịch vụ AWS.
* Kiểm soát quyền truy cập chi tiết thông qua IAM và key policy.
* Ghi log kiểm toán chi tiết thông qua AWS CloudTrail.
* Mã hóa hiệu quả các tập dữ liệu lớn bằng envelope encryption.

Bằng cách hiểu cách AWS KMS hoạt động và sự khác biệt giữa KMS với AWS Secrets
Manager, lập trình viên có thể thiết kế các hệ thống cloud bảo vệ thông tin nhạy
cảm hiệu quả hơn.

## Tài liệu tham khảo

* [Giới thiệu AWS KMS](https://awscoban.com/2025/12/03/kms)
* [AWS Key Management Service Developer Guide](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html)
