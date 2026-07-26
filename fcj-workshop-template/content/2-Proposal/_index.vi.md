---
title: "Bản đề xuất"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 2. </b> "
---
{{% notice warning %}}
⚠️ **Lưu ý:** Các thông tin dưới đây chỉ nhằm mục đích tham khảo, vui lòng **không sao chép nguyên văn** cho bài báo cáo của bạn kể cả warning này.
{{% /notice %}}

Phần này tóm tắt các nội dung chính trong workshop mà bạn **dự kiến** triển khai.

# IoT Weather Platform for Lab Research  
## Giải pháp AWS Serverless hợp nhất cho giám sát thời tiết thời gian thực  

### 1. Tóm tắt dự án  
Nền tảng IoT Weather Platform được thiết kế riêng cho phòng nghiên cứu *ITea Lab* tại TP. Hồ Chí Minh nhằm nâng cao khả năng thu thập và phân tích dữ liệu thời tiết. Hệ thống hiện hỗ trợ 5 trạm thời tiết và có khả năng mở rộng lên 10–15 trạm, sử dụng thiết bị biên Raspberry Pi kết hợp vi điều khiển ESP32 để truyền dữ liệu qua giao thức MQTT. Bằng việc ứng dụng các dịch vụ AWS Serverless, giải pháp mang lại khả năng giám sát theo thời gian thực, phân tích dự đoán và tiết kiệm chi phí vận hành, đồng thời phân quyền truy cập an toàn cho các thành viên phòng lab qua Amazon Cognito.  

### 2. Thực trạng & Giải pháp  
**Thực trạng & Khó khăn:**  
Việc thu thập dữ liệu tại các trạm thời tiết hiện vẫn thực hiện thủ công, gây khó khăn cho khâu quản lý khi số lượng trạm gia tăng. Hệ thống thiếu một nền tảng tập trung để lưu trữ cũng như phân tích dữ liệu theo thời gian thực. Bên cạnh đó, các giải pháp thương mại từ bên thứ ba thường đắt đỏ và phức tạp không cần thiết.  

**Giải pháp đề xuất:**  
Nền tảng ứng dụng AWS IoT Core để tiếp nhận dữ liệu MQTT từ các thiết bị, AWS Lambda kết hợp API Gateway đảm nhận xử lý logic, và Amazon S3 làm kho lưu trữ tập trung (Data Lake). Ngoài ra, AWS Glue Crawlers và các tác vụ ETL tự động trích xuất, chuyển đổi và nạp dữ liệu từ S3 Data Lake sang S3 bucket chuyên biệt cho phân tích. Giao diện web được phát triển bằng Next.js triển khai trên AWS Amplify, cùng Amazon Cognito quản lý xác thực an toàn. Tương tự như ThingsBoard hay CoreIoT, giải pháp cho phép đăng ký và quản lý kết nối thiết bị mới nhưng được tối ưu hóa gọn nhẹ cho nhu cầu nội bộ, nổi bật với bảng điều khiển thời gian thực, phân tích xu hướng và chi phí vận hành tối ưu.  

**Lợi ích & Hiệu quả đầu tư (ROI):**  
Dự án đặt nền móng vững chắc giúp phòng lab mở rộng hệ thống IoT trong tương lai, đồng thời cung cấp nguồn dữ liệu chuẩn hóa phục vụ huấn luyện các mô hình AI và phân tích chuyên sâu. Hệ thống tập trung giúp loại bỏ hoàn toàn quy trình báo cáo thủ công tại từng trạm, đơn giản hóa công tác quản lý - bảo trì và nâng cao độ tin cậy của dữ liệu. Chi phí vận hành ước tính rất thấp, chỉ khoảng 0.66 USD/tháng (tương đương 7.92 USD/năm theo AWS Pricing Calculator). Do tận dụng phần cứng có sẵn, dự án không phát sinh chi phí mua sắm thiết bị mới. Thời gian hoàn vốn dự kiến từ 6 đến 12 tháng nhờ tiết kiệm được đáng kể nhân lực và thời gian thao tác thủ công.  

### 3. Kiến trúc giải pháp  
Hệ thống được xây dựng trên kiến trúc AWS Serverless để quản lý dữ liệu từ các trạm thời tiết dựa trên Raspberry Pi (khả năng mở rộng từ 5 lên 15 trạm). Dữ liệu thu thập được gửi về AWS IoT Core, lưu trữ tại S3 Data Lake, sau đó được AWS Glue Crawlers và các tác vụ ETL tự động trích xuất, chuyển đổi và đưa vào S3 bucket phân tích. AWS Lambda và API Gateway đảm nhận xử lý các API nghiệp vụ, trong khi AWS Amplify hosting giao diện dashboard Next.js tích hợp xác thực Amazon Cognito.  

![IoT Weather Station Architecture](/images/2-Proposal/edge_architecture.jpeg)

![IoT Weather Platform Architecture](/images/2-Proposal/platform_architecture.jpeg)

**Các dịch vụ AWS sử dụng:**  
- **AWS IoT Core**: Tiếp nhận dữ liệu MQTT từ 5 trạm, có thể mở rộng lên 15 trạm.  
- **AWS Lambda**: Xử lý dữ liệu nghiệp vụ và kích hoạt các tác vụ AWS Glue (gồm 2 hàm Lambda).  
- **Amazon API Gateway**: Định tuyến và cung cấp cổng kết nối REST API cho ứng dụng web.  
- **Amazon S3**: Lưu trữ dữ liệu thô (Data Lake) và dữ liệu đã qua xử lý (gồm 2 S3 bucket).  
- **AWS Glue**: Crawlers lập chỉ mục sơ đồ dữ liệu, các tác vụ ETL thực hiện chuyển đổi và nạp dữ liệu.  
- **AWS Amplify**: Hosting ứng dụng web fullstack Next.js.  
- **Amazon Cognito**: Quản lý đăng nhập và phân quyền an toàn cho người dùng phòng lab.  

**Thiết kế chi tiết thành phần:**  
- **Thiết bị biên (Edge Device)**: Raspberry Pi thu thập, tiền xử lý và lọc dữ liệu từ cảm biến trước khi gửi về AWS IoT Core.  
- **Tiếp nhận dữ liệu**: AWS IoT Core tiếp nhận các thông điệp MQTT từ thiết bị biên.  
- **Lưu trữ dữ liệu**: Dữ liệu thô lưu tại S3 Data Lake; dữ liệu sau xử lý được lưu trữ tại S3 bucket riêng biệt.  
- **Xử lý dữ liệu**: AWS Glue Crawlers lập chỉ mục dữ liệu; các tác vụ ETL chuyển đổi dữ liệu phục vụ phân tích.  
- **Giao diện web**: AWS Amplify lưu trữ ứng dụng Next.js cung cấp bảng điều khiển thời gian thực và biểu đồ phân tích.  
- **Quản lý người dùng**: Amazon Cognito giới hạn và bảo vệ quyền truy cập cho 5 tài khoản phòng lab.  

### 4. Kế hoạch triển khai kỹ thuật  
**Các giai đoạn thực hiện:**  
Dự án chia làm 2 hợp phần chính (thiết lập trạm biên và phát triển nền tảng đám mây), mỗi hợp phần trải qua 4 giai đoạn:  
1. **Nghiên cứu & Thiết kế kiến trúc**: Nghiên cứu kết nối Raspberry Pi với cảm biến ESP32, thiết kế mô hình kiến trúc AWS Serverless (thực hiện 1 tháng trước kỳ thực tập).  
2. **Ước tính chi phí & Đánh giá tính khả thi**: Sử dụng công cụ AWS Pricing Calculator để tính toán và tối ưu ngân sách (Tháng 1).  
3. **Tối ưu hóa kiến trúc & giải pháp**: Tinh chỉnh các thành phần (như tối ưu hóa Lambda khi kết hợp Next.js) để đạt hiệu quả chi phí tốt nhất (Tháng 2).  
4. **Phát triển, Kiểm thử & Triển khai**: Lập trình phần cứng Raspberry Pi, cấu hình các dịch vụ AWS qua CDK/SDK và xây dựng ứng dụng Next.js; tiến hành kiểm thử toàn diện và đưa vào vận hành (Tháng 2–3).  

**Yêu cầu kỹ thuật:**  
- **Trạm thời tiết biên**: Cảm biến đo nhiệt độ, độ ẩm, lượng mưa, tốc độ gió; vi điều khiển ESP32 kết nối với thiết bị biên Raspberry Pi. Raspberry Pi chạy hệ điều hành Raspbian, sử dụng Docker để lọc dữ liệu và gửi khoảng 1 MB/ngày/trạm thông qua giao thức MQTT qua kết nối Wi-Fi.  
- **Nền tảng đám mây**: Ứng dụng thành thạo các dịch vụ AWS Amplify (hosting Next.js), Lambda, AWS Glue (ETL), Amazon S3 (2 bucket), AWS IoT Core (Rules & Gateway) và Amazon Cognito (phân quyền 5 tài khoản). Sử dụng AWS CDK/SDK để hạ tầng hóa mã nguồn (như định tuyến dữ liệu từ IoT Core sang S3). Việc tích hợp Next.js giúp giảm tải số lượng hàm Lambda cho ứng dụng fullstack.  

### 5. Lộ trình & Các mốc triển khai  
- **Giai đoạn chuẩn bị (Tháng 0)**: 1 tháng lập kế hoạch và khảo sát đánh giá hệ thống trạm hiện tại.  
- **Kỳ thực tập (Tháng 1–3)**:  
    - Tháng 1: Tìm hiểu sâu các dịch vụ AWS và nâng cấp phần cứng trạm biên.  
    - Tháng 2: Thiết kế chi tiết và hoàn thiện kiến trúc hệ thống.  
    - Tháng 3: Triển khai hạ tầng, kiểm thử tích hợp và đưa hệ thống vào vận hành.  
- **Sau triển khai**: Tiếp tục vận hành và mở rộng nghiên cứu trong vòng 1 năm.  

### 6. Ước tính ngân sách & Chi phí  
Chi tiết dự toán chi phí có thể tham khảo trực tiếp trên [AWS Pricing Calculator](https://calculator.aws/#/estimate?id=621f38b12a1ef026842ba2ddfe46ff936ed4ab01) hoặc tải [bảng ước tính ngân sách PDF](../attachments/budget_estimation.pdf).  

**Dự toán chi phí hạ tầng AWS:**  
- AWS Lambda: 0.00 USD/tháng (1,000 yêu cầu, 512 MB lưu trữ).  
- Amazon S3 Standard: 0.15 USD/tháng (6 GB lưu trữ, 2,100 yêu cầu, 1 GB quét dữ liệu).  
- Truyền dữ liệu (Data Transfer): 0.02 USD/tháng (1 GB vào, 1 GB ra).  
- AWS Amplify: 0.35 USD/tháng (256 MB, thời gian phản hồi 500 ms).  
- Amazon API Gateway: 0.01 USD/tháng (2,000 yêu cầu).  
- AWS Glue ETL Jobs: 0.02 USD/tháng (2 DPU).  
- AWS Glue Crawlers: 0.07 USD/tháng (1 crawler).  
- AWS IoT Core (MQTT): 0.08 USD/tháng (5 thiết bị, 45,000 thông điệp).  

**Tổng chi phí hạ tầng AWS:** ~0.70 USD/tháng (~8.40 USD/năm).  
- **Chi phí phần cứng**: ~265 USD (đầu tư một lần cho Raspberry Pi 5 và các cảm biến).  

### 7. Phân tích rủi ro & Kế hoạch ứng phó  
**Ma trận rủi ro:**  
- **Sự cố mất kết nối mạng**: Mức độ ảnh hưởng: Trung bình | Xác suất xảy ra: Trung bình.  
- **Hỏng hóc cảm biến**: Mức độ ảnh hưởng: Cao | Xác suất xảy ra: Thấp.  
- **Phát sinh vượt ngân sách**: Mức độ ảnh hưởng: Trung bình | Xác suất xảy ra: Thấp.  

**Chiến lược giảm thiểu rủi ro:**  
- **Mạng kết nối**: Cấu hình lưu trữ dữ liệu tạm thời cục bộ (buffer) trên Raspberry Pi sử dụng container Docker.  
- **Cảm biến**: Thực hiện bảo trì, kiểm tra định kỳ và chuẩn bị sẵn linh kiện dự phòng.  
- **Chi phí**: Thiết lập cảnh báo ngân sách (AWS Budgets) và liên tục theo dõi, tối ưu tài nguyên.  

**Kế hoạch dự phòng:**  
- Chuyển sang chế độ thu thập thủ công tạm thời nếu hệ thống AWS gặp sự cố gián đoạn.  
- Triển khai lại hạ tầng chuẩn xác bằng AWS CloudFormation / SAM nếu cần khôi phục trạng thái ban đầu.  

### 8. Kết quả kỳ vọng & Giá trị mang lại  
- **Cải tiến kỹ thuật**: Tự động hóa toàn bộ quy trình thu thập và phân tích dữ liệu theo thời gian thực thay cho phương pháp thủ công, sẵn sàng mở rộng lên 10–15 trạm.  
- **Giá trị dài hạn**: Xây dựng kho dữ liệu thời tiết chuẩn hóa trong 1 năm phục vụ các bài toán nghiên cứu AI và có thể tái sử dụng hạ tầng cho các dự án tiếp theo.