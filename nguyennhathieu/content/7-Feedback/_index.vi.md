---
title: "Chia sẻ và phản hồi"
date: 2026-07-26
weight: 7
chapter: false
pre: " <b> 7. </b> "
---

# 7. Chia sẻ và phản hồi

## 1. Môi trường làm việc

Kỳ thực tập đã mang đến cho mình một môi trường làm việc kỹ thuật vô cùng thực tế, chuyên nghiệp và giàu tính thử thách, nơi mình có thể trực tiếp vận dụng các kiến thức học thuật vào một dự án phần mềm cloud quy mô thực tế.

Văn hóa làm việc tại đây đặc biệt khuyến khích khả năng tự học độc lập, tinh thần trách nhiệm kỹ thuật và sự hoàn thiện không ngừng. Mình được trao sự chủ động và tài nguyên cần thiết để tự nghiên cứu các công nghệ mới, đánh giá các phương án kiến trúc, ghi chép điểm đánh đổi kỹ thuật và từng bước phát triển sản phẩm cloud hoàn chỉnh từ ý tưởng ban đầu đến khi triển khai lên môi trường production.

Trong quá trình phát triển **ChromeFlashCardExtension — Nền tảng Flashcard Serverless**, mình đã được trải nghiệm toàn diện vòng đời kỹ thuật phần mềm. Điều này bao gồm phân tích yêu cầu, mô hình hóa kiến trúc hệ thống, phát triển API, kiểm thử tích hợp, triển khai cloud, giám sát hệ thống, kiểm tra bảo mật, ước tính chi phí, quản trị rủi ro và xây dựng tài liệu kỹ thuật chuẩn mực.

Nhìn chung, không khí làm việc luôn tích cực và vô cùng phù hợp cho sự phát triển nghề nghiệp. Đôi khi, việc cân bằng giữa tốc độ phát triển tính năng, xử lý lỗi trực tiếp, kiểm thử và viết tài liệu đặt ra nhiều áp lực. Tuy nhiên, thách thức này giúp mình nhận thức sâu sắc tầm quan trọng của việc sắp xếp ưu tiên công việc, quản lý thời gian hiệu quả và duy trì kỷ luật kỹ thuật nghiêm túc.

## 2. Sự Hỗ trợ từ Đội ngũ Kỹ thuật & Bộ phận Quản lý

Sự đồng hành và hướng dẫn từ đội ngũ kỹ thuật cũng như bộ phận quản lý là nhân tố quan trọng đóng góp vào thành công của kỳ thực tập.

Các anh chị trong đội ngũ kỹ thuật luôn kịp thời hỗ trợ khi mình gặp các trở ngại chẩn đoán lỗi phức tạp, đồng thời giúp định hình rõ ràng các kỳ vọng về mốc tiến độ và sản phẩm bàn giao. Những phản hồi mang tính xây dựng từ mọi người giúp mình nhận diện chính xác các khía cạnh cần hoàn thiện trong tư duy kiến trúc, giao tiếp kỹ thuật, chuẩn mực tài liệu và quy trình quản lý công việc.

Mình đặc biệt trân trọng sự hỗ trợ từ đội ngũ khi làm việc với các cấu hình dịch vụ AWS chuyên sâu và quy trình triển khai IaC. Dù được khuyến khích tự lực nghiên cứu và xử lý vấn đề, những lời khuyên đúng lúc từ các kỹ sư giàu kinh nghiệm đã giúp mình tránh được các anti-pattern phổ biến và đưa ra các quyết định kiến trúc chuẩn xác.

Song song đó, bộ phận quản lý đã hỗ trợ truyền đạt rõ ràng các quy định thực tập, quy trình tuân thủ và các mốc thời gian báo cáo quan trọng, giúp mình luôn chủ động và hoàn thành đúng tiến độ trong từng giai đoạn.

*Đề xuất cho các chương trình tiếp theo*: Việc tổ chức các buổi check-in định kỳ hàng tuần để đánh giá ngắn gọn về ưu tiên, ưu điểm, điểm cần cải thiện và mục tiêu tiếp theo sẽ cung cấp một lộ trình trực quan giúp thực tập sinh theo dõi sự trưởng thành của bản thân hiệu quả hơn.

## 3. Kiến thức & Năng lực Tích lũy

Trong suốt kỳ thực tập, mình đã phát triển toàn diện cả năng lực kỹ thuật chuyên sâu lẫn các kỹ năng làm việc thực tế.

### Năng lực Kỹ thuật & Kiến trúc Cloud

Sự trưởng thành kỹ thuật lớn nhất của mình nằm ở mảng **Kiến trúc Cloud Serverless**. Mình đã nắm vững cách thức phối hợp các dịch vụ AWS chuyên biệt để tạo thành một hệ thống đồng bộ, an toàn, có khả năng mở rộng cao và tối ưu chi phí.

Các kỹ năng kỹ thuật thực hành cốt lõi đã làm chủ bao gồm:

* **AWS Lambda**: Thực thi các microservice backend theo cơ chế event-driven không cần quản lý máy chủ.
* **Amazon API Gateway**: Khởi tạo các HTTPS REST endpoint an toàn tích hợp sẵn chính sách CORS allowlist và kiểm soát tần suất request (throttling).
* **Amazon DynamoDB**: Thiết kế mô hình NoSQL single-table vận hành ở chế độ `PAY_PER_REQUEST` On-Demand.
* **Amazon S3**: Lưu trữ tài nguyên web tĩnh và bảo mật các file xuất dữ liệu JSON bằng pre-signed GET URL có thời hạn 15 phút.
* **Amazon CloudWatch**: Thiết lập ghi log tập trung, cấu hình cảnh báo metric tùy chỉnh và giám sát vận hành thời gian thực.
* **AWS IAM**: Cấu hình chi tiết key policy và thực thi Nguyên tắc Đặc quyền Tối thiểu (Principle of Least Privilege).
* **AWS SAM & CloudFormation**: Xây dựng tài liệu Infrastructure as Code (IaC) để tự động hóa triển khai hạ tầng.
* **GitHub Actions**: Xây dựng pipeline triển khai tự động phục vụ tích hợp và giao hàng liên tục (CI/CD).
* **Xác thực JWT Token**: Bảo mật các tuyến route API và quản lý phiên làm việc stateless của client.
* **Bảo mật & Quản trị API**: Thực thi giới hạn lưu lượng (20 req/s, burst 40 req/s), kiểm tra dữ liệu đầu vào và cấu hình security header CORS (`https://www.axiza.net`).
* **Quản trị Chi phí Cloud**: Cấu hình cảnh báo ngân sách AWS Cost Explorer và lifecycle policy trên S3 để duy trì hiệu quả chi phí.

Ngoài ra, mình đã nâng cao khả năng đánh giá kỹ thuật, biết cách cân bằng giữa chi phí tài chính, cấp độ bảo mật, khả năng mở rộng, công sức vận hành và rào cản nghiệp vụ khi lựa chọn giải pháp cloud.

### Phương pháp Kỹ thuật & Chẩn đoán Sự cố

Kỳ thực tập đã rèn luyện cho mình tư duy chẩn đoán lỗi hệ thống một cách có phương pháp. Khi đối mặt với các sự cố thực tế—như lỗi CORS preflight, sai lệch cấu hình deployment stack, ngoại lệ ủy quyền, giới hạn quyền IAM hay vượt ngưỡng service quota—mình đã áp dụng quy trình chẩn đoán dựa trên bằng chứng thực nghiệm:

1. **Xác định Vấn đề**: Đưa ra giả thuyết nguyên nhân chính xác.
2. **Thu thập Bằng chứng**: Phân tích log chi tiết trên CloudWatch, phản hồi API và dấu vết runtime.
3. **Phân tích Nguyên nhân Gốc rễ**: Cô lập điểm thất bại upstream.
4. **Đánh giá Phương án**: So sánh các giải pháp khắc phục khác nhau.
5. **Kiểm thử Kiểm soát**: Thử nghiệm phương án sửa lỗi trong môi trường cô lập.
6. **Cập nhật Tài liệu**: Ghi nhận kết quả thực nghiệm và cập nhật tài liệu kỹ thuật.

### Kỹ năng Nghề nghiệp & Vận hành

Bên cạnh kiến thức chuyên môn, mình đã rèn luyện các thói quen kỹ thuật chuyên nghiệp:

* Phân rã các epic phức tạp thành các nhiệm vụ nhỏ có thể theo dõi và thực thi.
* Viết tài liệu kỹ thuật và báo cáo kiến trúc rõ ràng, dễ bảo trì.
* Trình bày các trở ngại kỹ thuật và chỉ số tiến độ một cách súc tích.
* Tiếp thu các phản hồi xây dựng để liên tục nâng cao chất lượng sản phẩm bàn giao.
* Quản lý thời gian cá nhân và ưu tiên các hạng mục có tác động lớn.
* Tự chịu trách nhiệm về chất lượng toàn diện, bảo mật và hiệu năng phần mềm.

## 4. Phản hồi về Hợp tác Đội nhóm

Các thành viên trong nhóm luôn thể hiện sự chuyên nghiệp, năng lực kỹ thuật vững vàng và tinh thần sẵn sàng chia sẻ tri thức. Sự hướng dẫn của mọi người đã giúp mình nhanh chóng vượt qua các trở ngại kỹ thuật và hiểu rõ chuẩn mực làm việc nhóm trong môi trường doanh nghiệp.

Qua quá trình hợp tác, mình nhận ra cần chủ động trao đổi sớm hơn khi gặp trở ngại, đặt các câu hỏi kỹ thuật tập trung hơn và cung cấp các bản cập nhật tiến độ định kỳ rõ ràng hơn.

## 5. Các Câu hỏi Thường gặp

### Điều gì khiến bạn cảm thấy hài lòng nhất trong kỳ thực tập?

Việc phát triển và triển khai thành công một nền tảng flashcard serverless hoàn chỉnh lên hạ tầng AWS live là trải nghiệm vô cùng tự hào. Dự án cho phép mình tổng hòa kiến thức kiến trúc cloud, bảo mật, lập trình backend, IaC và tài liệu kỹ thuật vào một sản phẩm thực tế đạt chuẩn production.

### Bạn có đề xuất gì để công ty cải thiện cho các khóa thực tập sinh tiếp theo?

Công ty có thể bổ sung lộ trình định hướng bài bản hơn từ đầu, duy trì các buổi kiểm tra tiến độ kỹ thuật định kỳ 2 tuần/lần, và tạo điều kiện cho thực tập sinh quan sát các phiên rà soát kiến trúc thực tế của các kỹ sư cấp cao.

### Bạn có sẵn sàng giới thiệu chương trình thực tập này cho bạn bè không?

**Chắc chắn có.** Mình rất khuyến khích các bạn sinh viên có định hướng theo đuổi điện toán đám mây và phát triển phần mềm tham gia chương trình này. Kỳ thực tập mang đến những trải nghiệm dự án thực tế vô giá và rèn luyện tinh thần tự chủ kỹ thuật mạnh mẽ.

## 6. Đề xuất Cập nhật Tài liệu Học tập

Một số tài nguyên đào tạo sẽ đạt hiệu quả cao hơn nếu được cập nhật theo các thay đổi mới nhất của AWS. Ví dụ, một số bài lab hướng dẫn vẫn tham chiếu đến AWS Cloud9—dịch vụ hiện không còn hỗ trợ cho các tài khoản mới. Việc cập nhật nội dung đào tạo sang các công cụ phát triển hiện hành và khuyến nghị mới nhất từ AWS sẽ giúp các khóa thực tập sinh tiếp theo có trải nghiệm học tập mượt mà và sát với thực tế hơn.