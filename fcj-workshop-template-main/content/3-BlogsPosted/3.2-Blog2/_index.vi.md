---

title: "Blog 2"
date: 2026-07-22
weight: 2
chapter: false
pre: " <b> 3.2. </b> "
---------------------

# Tìm Hiểu Amazon Textract: Dịch Vụ OCR Thông Minh Của AWS

|           |                                                       |
| --------- | ----------------------------------------------------- |
| Published | TODO: 22/07/2026                                |
| Platform  | AWS Study Group                                       |
| Link      | https://www.facebook.com/photo?fbid=4664462010543491&set=gm.2221408125290814&idorvanity=660548818043427 |                                        |
| Evidence  | {{TODO: /images/3-blogs/blog-03-amazon-textract.png}} |

---

## GIỚI THIỆU

Xin chào mọi người!

Mình hiện đang tìm hiểu về các dịch vụ trên nền tảng điện toán đám mây của AWS. Hôm nay, mình muốn giới thiệu đến mọi người một dịch vụ khá thú vị, được xây dựng để giải quyết bài toán số hóa và tự động xử lý tài liệu: **Amazon Textract**.

Trong nhiều hệ thống, dữ liệu quan trọng vẫn tồn tại dưới dạng tài liệu PDF, biểu mẫu được quét, hóa đơn, biên lai, hồ sơ y tế hoặc ảnh chụp giấy tờ. Con người có thể đọc những tài liệu này tương đối dễ dàng, nhưng để đưa dữ liệu vào phần mềm, doanh nghiệp thường phải nhập liệu thủ công hoặc sử dụng các công cụ OCR truyền thống.

Amazon Textract giúp tự động hóa quá trình này bằng cách sử dụng machine learning để nhận diện văn bản và cấu trúc của tài liệu.

## AMAZON TEXTRACT LÀ GÌ?

Amazon Textract là một dịch vụ machine learning của AWS, giúp tự động trích xuất:

* văn bản in;
* chữ viết tay;
* bảng biểu;
* cặp khóa và giá trị trong biểu mẫu;
* thành phần bố cục;
* ô lựa chọn như checkbox;
* chữ ký;
* dữ liệu từ hóa đơn và biên lai;
* câu trả lời cho các truy vấn cụ thể.

Điểm khác biệt lớn nhất của Amazon Textract là dịch vụ không chỉ thực hiện OCR theo cách truyền thống.

OCR thông thường chủ yếu chuyển các ký tự trong hình ảnh thành một chuỗi văn bản thô:

```text
Invoice Number: INV-2026-001
Invoice Date: 21/07/2026
Total: 1,250.00
```

Amazon Textract có thể đi xa hơn bằng cách xác định mối quan hệ giữa các thành phần trong tài liệu.

Ví dụ, dịch vụ có thể hiểu rằng:

```text
Invoice Number → INV-2026-001
Invoice Date   → 21/07/2026
Total          → 1,250.00
```

Textract cũng trả về vị trí của dữ liệu thông qua các tọa độ như `BoundingBox` và `Polygon`. Nhờ đó, ứng dụng có thể xác định chính xác đoạn văn bản, ô bảng hoặc trường dữ liệu nằm ở đâu trong tài liệu gốc.

![Quy trình xử lý tài liệu với Amazon Textract](/images/3-blogs/blog-03-amazon-textract.png)

## AMAZON TEXTRACT KHÁC GÌ OCR TRUYỀN THỐNG?

Có thể hình dung sự khác biệt thông qua hai quy trình sau.

### OCR truyền thống

```text
Tài liệu
   ↓
Nhận diện ký tự
   ↓
Văn bản thô
   ↓
Tự viết logic phân tích
   ↓
Dữ liệu có cấu trúc
```

### Amazon Textract

```text
Tài liệu
   ↓
Nhận diện văn bản và bố cục
   ↓
Phân tích bảng, biểu mẫu và mối quan hệ
   ↓
Dữ liệu có cấu trúc kèm tọa độ và độ tin cậy
```

Với OCR truyền thống, developer thường phải tự viết biểu thức chính quy, logic nhận diện vị trí hoặc quy tắc riêng cho từng mẫu tài liệu.

Khi biểu mẫu thay đổi bố cục, những quy tắc này có thể không còn hoạt động chính xác.

Amazon Textract sử dụng mô hình machine learning đã được huấn luyện sẵn để nhận diện cấu trúc tài liệu, nhờ đó giảm số lượng quy tắc thủ công cần duy trì.

## CÁC TÍNH NĂNG CHÍNH

## 1. PHÁT HIỆN VĂN BẢN

Textract có thể phát hiện từ và dòng văn bản trong tài liệu.

Kết quả không chỉ chứa nội dung chữ mà còn có thêm các thông tin như:

* loại block;
* vị trí trên trang;
* chiều rộng và chiều cao;
* tọa độ polygon;
* độ tin cậy;
* mối quan hệ với các block khác.

Một phần kết quả đơn giản có thể có dạng:

```json
{
  "BlockType": "WORD",
  "Text": "Invoice",
  "Confidence": 99.7,
  "Geometry": {
    "BoundingBox": {
      "Width": 0.08,
      "Height": 0.02,
      "Left": 0.10,
      "Top": 0.12
    }
  }
}
```

Thông tin vị trí cho phép ứng dụng đánh dấu kết quả trên tài liệu gốc, xây dựng giao diện kiểm tra hoặc liên kết văn bản với các vùng cụ thể trên trang.

## 2. TRÍCH XUẤT BIỂU MẪU

Trong biểu mẫu, thông tin thường được tổ chức dưới dạng cặp khóa và giá trị.

Ví dụ:

| Khóa          | Giá trị      |
| ------------- | ------------ |
| Full Name     | Nguyen Van A |
| Date of Birth | 01/01/2000   |
| Customer ID   | CUS-00125    |

Textract có thể xác định mối quan hệ giữa phần nhãn và phần giá trị tương ứng.

Điều này hữu ích khi xử lý:

* đơn đăng ký;
* hồ sơ vay vốn;
* biểu mẫu bảo hiểm;
* hồ sơ bệnh nhân;
* biểu mẫu hành chính;
* tài liệu nhân sự.

## 3. TRÍCH XUẤT BẢNG BIỂU

Textract có thể nhận diện:

* bảng;
* hàng;
* cột;
* ô;
* tiêu đề bảng;
* ô được gộp;
* nội dung nằm trong từng ô.

Ví dụ, từ một bảng trong PDF, ứng dụng có thể tái tạo lại dữ liệu:

| Product  | Quantity | Price |
| -------- | -------: | ----: |
| Keyboard |        2 | 50.00 |
| Mouse    |        4 | 20.00 |

Đây là một điểm mạnh đáng chú ý vì bảng biểu thường khó xử lý bằng OCR truyền thống. Nếu chỉ nhận được văn bản thô, ứng dụng có thể không biết từ nào thuộc hàng hoặc cột nào.

## 4. PHÂN TÍCH BỐ CỤC

Tính năng Layout giúp nhận diện các thành phần ngữ nghĩa trong tài liệu, chẳng hạn:

* tiêu đề;
* đoạn văn;
* danh sách;
* header;
* footer;
* số trang;
* bảng;
* hình ảnh;
* section title.

Nhờ đó, ứng dụng có thể tái tạo thứ tự đọc và cấu trúc tài liệu tốt hơn thay vì chỉ nhận một danh sách từ rời rạc.

## 5. TÍNH NĂNG QUERIES

Queries cho phép ứng dụng đặt câu hỏi trực tiếp về nội dung tài liệu.

Thay vì trích xuất toàn bộ văn bản rồi tự tìm thông tin, developer có thể gửi những câu hỏi như:

```text
What is the invoice number?
What is the total amount?
Who is the customer?
When is the payment due?
```

Textract trả về:

* câu hỏi;
* câu trả lời;
* độ tin cậy;
* vị trí của câu trả lời trong tài liệu.

Ví dụ:

```json
{
  "Query": "What is the total amount?",
  "Answer": "$1,250.00",
  "Confidence": 98.4
}
```

Queries đặc biệt hữu ích khi ứng dụng chỉ cần một số trường cụ thể và không muốn tự xây dựng toàn bộ logic phân tích tài liệu.

Tuy nhiên, hiện tại tính năng Query detection chỉ hỗ trợ tài liệu tiếng Anh.

## 6. XỬ LÝ HÓA ĐƠN VÀ BIÊN LAI

Textract cung cấp API chuyên biệt để phân tích hóa đơn và biên lai.

Dịch vụ có thể nhận diện các trường phổ biến như:

* tên nhà cung cấp;
* ngày lập hóa đơn;
* mã hóa đơn;
* tổng tiền;
* thuế;
* địa chỉ;
* danh sách mặt hàng;
* số lượng;
* đơn giá.

Các trường có thể được chuẩn hóa về những tên chung, giúp ứng dụng xử lý nhiều mẫu hóa đơn khác nhau mà không cần viết logic riêng cho từng nhà cung cấp.

## 7. PHÂN TÍCH GIẤY TỜ ĐỊNH DANH VÀ HỒ SƠ VAY

Ngoài API phân tích tài liệu tổng quát, Textract còn có những API chuyên biệt cho một số nhóm tài liệu.

`AnalyzeID` được thiết kế để trích xuất thông tin từ giấy tờ nhận dạng được hỗ trợ, chẳng hạn giấy phép lái xe và hộ chiếu Hoa Kỳ.

`AnalyzeLending` hỗ trợ phân loại và trích xuất dữ liệu từ các bộ hồ sơ liên quan đến quy trình cho vay thế chấp.

Các API chuyên biệt giúp giảm lượng logic hậu xử lý, nhưng phạm vi tài liệu và khu vực hỗ trợ có thể hẹp hơn so với API OCR tổng quát.

## TẠI SAO NÊN SỬ DỤNG AMAZON TEXTRACT?

## VƯỢT TRỘI HƠN OCR TRUYỀN THỐNG

Textract không chỉ trả về văn bản thô mà còn cung cấp:

* cấu trúc của tài liệu;
* vị trí của dữ liệu;
* mối quan hệ giữa khóa và giá trị;
* hàng, cột và ô trong bảng;
* điểm confidence cho kết quả.

Điều này giúp giảm đáng kể lượng code cần thiết để chuyển văn bản OCR thành dữ liệu có thể sử dụng.

## GIẢM CÔNG VIỆC NHẬP LIỆU THỦ CÔNG

Trong các quy trình truyền thống, nhân viên có thể phải mở từng tài liệu và nhập dữ liệu vào hệ thống.

Textract cho phép tự động hóa các bước:

```text
Upload tài liệu
    ↓
Phân tích bằng Textract
    ↓
Kiểm tra confidence
    ↓
Chuẩn hóa dữ liệu
    ↓
Lưu vào cơ sở dữ liệu
```

Con người chỉ cần kiểm tra những trường có confidence thấp hoặc những tài liệu không đạt yêu cầu.

## TỰ ĐỘNG HÓA VÀ TÍCH HỢP

Textract có thể được kết hợp với nhiều dịch vụ AWS khác.

Một kiến trúc xử lý tài liệu có thể gồm:

```text
Amazon S3
    ↓
AWS Lambda
    ↓
Amazon Textract
    ↓
Amazon DynamoDB
    ↓
Amazon OpenSearch Service hoặc ứng dụng nội bộ
```

Khi người dùng tải tài liệu lên Amazon S3, một Lambda function có thể tự động bắt đầu công việc phân tích.

Kết quả sau đó được chuẩn hóa và lưu vào cơ sở dữ liệu hoặc chuyển đến hệ thống tìm kiếm.

## KHẢ NĂNG MỞ RỘNG

Textract là dịch vụ được AWS quản lý. Developer không phải tự triển khai hoặc vận hành máy chủ OCR.

Hệ thống có thể xử lý từ một số lượng nhỏ tài liệu đến các quy trình lớn hơn, miễn là ứng dụng tuân thủ service quota và triển khai cơ chế retry, queue và kiểm soát tốc độ phù hợp.

Textract cung cấp cả API đồng bộ và bất đồng bộ. Các tác vụ bất đồng bộ phù hợp hơn với PDF hoặc TIFF nhiều trang.

## THANH TOÁN THEO MỨC SỬ DỤNG

Textract không yêu cầu mua giấy phép OCR hoặc vận hành cụm máy chủ riêng.

Chi phí phụ thuộc vào:

* số trang được xử lý;
* loại API;
* loại tính năng phân tích;
* Region AWS;
* việc sử dụng adapter hoặc tính năng chuyên biệt.

Mỗi tính năng như text detection, forms, tables hoặc queries có thể có cách tính phí khác nhau. Vì vậy, cần ước tính chi phí dựa trên loại tài liệu và số trang thực tế.

## CÁC USE CASE NỔI BẬT

## DỊCH VỤ TÀI CHÍNH

Các tổ chức tài chính thường xử lý nhiều loại tài liệu như:

* đơn xin vay;
* sao kê;
* biểu mẫu thế chấp;
* hóa đơn;
* giấy tờ xác minh;
* hồ sơ thu nhập.

Textract có thể trích xuất các dữ liệu quan trọng như:

* tên người đăng ký;
* số tiền vay;
* giá trị hóa đơn;
* ngày lập hồ sơ;
* số tài khoản;
* thông tin liên hệ.

Dữ liệu sau khi trích xuất có thể được đưa vào hệ thống xét duyệt hoặc kiểm tra tự động.

## CHĂM SÓC SỨC KHỎE

Trong lĩnh vực chăm sóc sức khỏe, Textract có thể hỗ trợ số hóa:

* biểu mẫu tiếp nhận bệnh nhân;
* hồ sơ y tế;
* yêu cầu bồi thường bảo hiểm;
* hóa đơn y tế;
* biểu mẫu đồng ý;
* kết quả kiểm tra được quét.

Dịch vụ giúp giảm công việc nhập liệu thủ công, nhưng hệ thống vẫn cần triển khai các biện pháp bảo vệ dữ liệu, kiểm soát truy cập và tuân thủ quy định phù hợp.

## KHU VỰC CÔNG

Cơ quan nhà nước có thể sử dụng xử lý tài liệu tự động cho:

* biểu mẫu hành chính;
* tờ khai thuế;
* đơn đăng ký;
* giấy phép;
* hồ sơ khoản vay cho doanh nghiệp nhỏ;
* tài liệu lưu trữ đã được quét.

Việc chuyển dữ liệu từ tài liệu giấy sang dạng có cấu trúc giúp tăng khả năng tìm kiếm và giảm thời gian xử lý hồ sơ.

## BẢO HIỂM

Doanh nghiệp bảo hiểm có thể sử dụng Textract để xử lý:

* biểu mẫu yêu cầu bồi thường;
* báo cáo thiệt hại;
* hóa đơn sửa chữa;
* giấy tờ khách hàng;
* tài liệu giám định.

Các trường có confidence cao có thể được tự động xử lý, trong khi các trường có confidence thấp được chuyển cho nhân viên kiểm tra.

## NHÂN SỰ VÀ TUYỂN DỤNG

Textract có thể hỗ trợ trích xuất dữ liệu từ:

* sơ yếu lý lịch;
* đơn ứng tuyển;
* biểu mẫu nhân sự;
* bảng chấm công;
* tài liệu onboarding.

Tuy nhiên, kết quả OCR không nên được xem là quyết định tuyển dụng. Dịch vụ chỉ đóng vai trò hỗ trợ số hóa và tổ chức dữ liệu.

## QUY TRÌNH HOẠT ĐỘNG

Một quy trình Textract cơ bản có thể gồm các bước sau:

1. Người dùng tải PDF hoặc hình ảnh lên Amazon S3.
2. Ứng dụng kiểm tra định dạng và chất lượng tài liệu.
3. Backend gọi API Textract phù hợp.
4. Textract phân tích văn bản và cấu trúc.
5. Ứng dụng nhận kết quả dưới dạng JSON.
6. Dữ liệu được chuẩn hóa thành mô hình nghiệp vụ.
7. Các trường có confidence thấp được gửi đi kiểm tra thủ công.
8. Kết quả cuối cùng được lưu vào cơ sở dữ liệu.

```text
Document
    ↓
Amazon S3
    ↓
Amazon Textract
    ↓
Raw JSON response
    ↓
Post-processing
    ↓
Structured business data
```

## ƯU ĐIỂM VÀ HẠN CHẾ TỪ TRẢI NGHIỆM THỰC TẾ

Các đánh giá cộng đồng có thể cung cấp góc nhìn thực tế, nhưng không nên được xem là benchmark chính thức. Hiệu quả của Textract phụ thuộc đáng kể vào loại tài liệu, chất lượng ảnh và cấu trúc dữ liệu.

## ƯU ĐIỂM

### XỬ LÝ TỐT PDF VÀ BẢNG BIỂU

Một số người dùng đánh giá Textract hoạt động tốt với PDF và trích xuất bảng biểu.

Khả năng trả về cấu trúc, vị trí và mối quan hệ giữa các ô giúp Textract hữu ích hơn các công cụ chỉ trả về văn bản thô.

### PHÙ HỢP VỚI HÓA ĐƠN VÀ BIỂU MẪU

Textract được thiết kế cho những loại tài liệu có cấu trúc phổ biến như:

* hóa đơn;
* biên lai;
* đơn đăng ký;
* bảng biểu;
* hồ sơ tài chính.

Các API chuyên biệt có thể giảm đáng kể lượng logic cần viết cho những trường dữ liệu thông dụng.

### DỄ TÍCH HỢP VỚI HỆ SINH THÁI AWS

Textract có thể kết hợp tự nhiên với S3, Lambda, Step Functions, SNS, SQS và DynamoDB.

Điều này thuận tiện khi xây dựng pipeline xử lý tài liệu theo hướng event-driven.

## NHƯỢC ĐIỂM VÀ HẠN CHẾ

### KẾT QUẢ JSON CÓ THỂ PHỨC TẠP

Kết quả Textract được tổ chức dưới dạng tập hợp các `Block`.

Mỗi block có thể đại diện cho:

* trang;
* dòng;
* từ;
* bảng;
* ô;
* key;
* value;
* query;
* query result;
* thành phần layout.

Các block được liên kết với nhau thông qua ID và `Relationships`.

Với tài liệu nhiều trang, kết quả có thể trở nên lớn và khó sử dụng trực tiếp. Developer thường cần một lớp post-processing để:

* duyệt quan hệ giữa các block;
* tái tạo bảng;
* ghép key với value;
* chuyển tọa độ;
* lọc theo confidence;
* chuẩn hóa dữ liệu;
* xử lý trường bị thiếu.

Textract cung cấp kết quả phân tích, nhưng không tự động biến mọi tài liệu thành mô hình dữ liệu nghiệp vụ hoàn chỉnh.

### PHỤ THUỘC VÀO CHẤT LƯỢNG TÀI LIỆU

Kết quả OCR có thể giảm chất lượng khi tài liệu:

* bị mờ;
* có độ phân giải thấp;
* bị nghiêng;
* thiếu sáng;
* có nhiều nhiễu;
* bị gấp hoặc che khuất;
* sử dụng font quá nhỏ;
* có chữ viết tay khó đọc.

AWS khuyến nghị sử dụng hình ảnh chất lượng cao, lý tưởng là từ khoảng 150 DPI trở lên.

Ngay cả với tài liệu tốt, ứng dụng vẫn nên sử dụng `Confidence` để quyết định trường nào có thể xử lý tự động và trường nào cần con người kiểm tra.

### CÓ THỂ SAI KÝ TỰ VÀ DẤU CÂU

OCR không đảm bảo độ chính xác tuyệt đối.

Một số ký tự có hình dạng tương tự có thể bị nhầm, chẳng hạn:

```text
0 ↔ O
1 ↔ I ↔ l
5 ↔ S
8 ↔ B
```

Khoảng trắng, dấu câu, ký hiệu tiền tệ và định dạng số cũng có thể bị nhận diện sai trong tài liệu chất lượng thấp.

Vì vậy, những trường quan trọng như số tài khoản, số hóa đơn hoặc số tiền cần có thêm bước kiểm tra và validation.

### KHÔNG HỖ TRỢ TIẾNG VIỆT

Đây là một hạn chế quan trọng đối với các dự án tại Việt Nam.

Hiện tại, Amazon Textract hỗ trợ text detection cho:

* tiếng Anh;
* tiếng Pháp;
* tiếng Đức;
* tiếng Ý;
* tiếng Bồ Đào Nha;
* tiếng Tây Ban Nha.

Tiếng Việt chưa nằm trong danh sách ngôn ngữ được hỗ trợ chính thức.

Ngoài ra, Textract không trả về ngôn ngữ mà dịch vụ đã phát hiện trong kết quả.

Tính năng Query detection hiện chỉ hỗ trợ tài liệu tiếng Anh. Một số API chuyên biệt cũng chỉ áp dụng cho những loại tài liệu hoặc thị trường cụ thể.

Điều này có nghĩa là Textract không phải lựa chọn phù hợp cho quy trình OCR tiếng Việt yêu cầu độ chính xác cao và được AWS hỗ trợ chính thức.

### CẦN QUẢN LÝ CONFIDENCE

Textract trả về confidence score, nhưng ứng dụng phải tự quyết định ngưỡng chấp nhận.

Ví dụ:

```text
Confidence ≥ 98% → Tự động chấp nhận
90%–98%         → Kiểm tra thêm bằng rule
< 90%           → Chuyển cho con người xác minh
```

Ngưỡng thực tế cần được xác định bằng cách thử nghiệm trên chính tập tài liệu của dự án, không nên sử dụng một con số chung cho mọi trường hợp.

### CHI PHÍ CÓ THỂ TĂNG THEO SỐ TRANG

Mô hình thanh toán theo mức sử dụng thuận tiện khi bắt đầu, nhưng chi phí có thể tăng khi hệ thống xử lý hàng triệu trang.

Trước khi triển khai production, nên đánh giá:

* số tài liệu mỗi tháng;
* số trang trung bình;
* loại API được sử dụng;
* số lần tài liệu phải xử lý lại;
* tỷ lệ tài liệu cần post-processing;
* chi phí lưu trữ và xử lý bổ sung.

## CÓ NÊN KẾT HỢP TEXTRACT VỚI LLM?

Large Language Model có thể hỗ trợ xử lý kết quả Textract, chẳng hạn:

* chuẩn hóa tên trường;
* ánh xạ nhiều định dạng về một schema;
* tóm tắt nội dung;
* phân loại tài liệu;
* phát hiện dữ liệu bị thiếu;
* chuyển văn bản thành cấu trúc dễ sử dụng.

Một kiến trúc có thể được xây dựng như sau:

```text
Document
    ↓
Amazon Textract
    ↓
Extracted text and structure
    ↓
Validation and business rules
    ↓
LLM
    ↓
Normalized output
```

Tuy nhiên, không nên chuyển toàn bộ JSON Textract rất lớn trực tiếp vào LLM.

Ứng dụng nên:

1. Chỉ lấy những block cần thiết.
2. Tái tạo văn bản hoặc bảng trước.
3. Loại bỏ metadata không cần thiết.
4. Chia nhỏ tài liệu dài.
5. Kiểm tra kết quả LLM trước khi lưu.
6. Không để LLM tự sửa những dữ liệu quan trọng mà không có validation.

Textract chịu trách nhiệm đọc tài liệu. LLM có thể hỗ trợ diễn giải và chuẩn hóa, nhưng không thay thế bước kiểm tra dữ liệu.

## KHI NÀO NÊN SỬ DỤNG TEXTRACT?

Amazon Textract phù hợp khi:

* tài liệu sử dụng ngôn ngữ được hỗ trợ;
* phần lớn dữ liệu nằm trong PDF, biểu mẫu hoặc bảng;
* hệ thống cần xử lý số lượng tài liệu lớn;
* dự án đã sử dụng hệ sinh thái AWS;
* cần lấy vị trí của dữ liệu trong tài liệu;
* cần tự động trích xuất hóa đơn hoặc biên lai;
* chấp nhận xây dựng lớp post-processing;
* có quy trình kiểm tra các trường confidence thấp.

## KHI NÀO KHÔNG NÊN SỬ DỤNG TEXTRACT?

Textract có thể không phù hợp khi:

* tài liệu chủ yếu sử dụng tiếng Việt;
* chỉ cần OCR một lượng rất nhỏ tài liệu;
* không muốn xử lý JSON hoặc quan hệ giữa các block;
* tài liệu có chất lượng đầu vào rất thấp;
* dự án yêu cầu độ chính xác tuyệt đối mà không có human review;
* chi phí theo số trang không phù hợp với quy mô hệ thống;
* dữ liệu phải được xử lý hoàn toàn ngoài AWS.

## KẾT LUẬN

Amazon Textract là một dịch vụ OCR và document analysis mạnh mẽ của AWS.

Dịch vụ không chỉ chuyển hình ảnh thành văn bản mà còn có thể nhận diện:

* cấu trúc tài liệu;
* bảng biểu;
* biểu mẫu;
* khóa và giá trị;
* thành phần bố cục;
* câu trả lời cho truy vấn;
* dữ liệu chuyên biệt từ hóa đơn và biên lai.

Textract đặc biệt phù hợp với những dự án cần xử lý khối lượng lớn tài liệu tiếng Anh, PDF, bảng biểu, hóa đơn hoặc biểu mẫu trong hệ sinh thái AWS.

Tuy nhiên, developer cần chuẩn bị cho quá trình hậu xử lý kết quả JSON, kiểm tra confidence và xử lý những tài liệu có chất lượng thấp.

Hạn chế lớn đối với các dự án tại Việt Nam là Textract hiện chưa hỗ trợ tiếng Việt chính thức. Queries cũng chỉ hỗ trợ tài liệu tiếng Anh.

Vì vậy, trước khi lựa chọn Textract, nên thử nghiệm với một tập tài liệu thực tế của dự án để đánh giá:

* độ chính xác;
* khả năng trích xuất trường;
* độ phức tạp của post-processing;
* chi phí;
* tỷ lệ cần con người kiểm tra.

Textract có thể xử lý phần đọc và phân tích tài liệu. Nhưng để xây dựng một hệ thống document processing hoàn chỉnh, ứng dụng vẫn cần thêm validation, business rules, monitoring và human review.

## NGUỒN THAM KHẢO

* [Amazon Textract](https://aws.amazon.com/textract/)
* [Amazon Textract FAQs](https://aws.amazon.com/textract/faqs/)
* [Amazon Textract Documentation](https://docs.aws.amazon.com/textract/)
* [What is Amazon Textract?](https://docs.aws.amazon.com/textract/latest/dg/what-is.html)
* [Amazon Textract best practices](https://docs.aws.amazon.com/textract/latest/dg/textract-best-practices.html)
* [Amazon Textract service limits](https://docs.aws.amazon.com/textract/latest/dg/limits-document.html)
* [Amazon Textract Queries](https://docs.aws.amazon.com/textract/latest/dg/queryresponse.html)

---

