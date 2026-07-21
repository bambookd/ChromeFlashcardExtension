# Tài liệu LaTeX — Context Handoff cho ChromeFlashCardExtension

Folder này chứa một tài liệu LaTeX tổng hợp toàn bộ **ngữ cảnh dự án** để bạn bè / mentor
đọc và nắm được bức tranh lớn: sản phẩm là gì, kiến trúc, API, dữ liệu, cấu hình, trạng thái
hiện tại và cách chạy thử.

Nội dung được tổng hợp từ bộ tài liệu trong `docs/` (nhánh `test-aws`, snapshot 2026-07-14).

## Nội dung folder

| File | Vai trò |
|---|---|
| `main.tex` | Tài liệu chính, **tự chứa** (self-contained) — không cần file phụ, không cần ảnh ngoài. Sơ đồ kiến trúc vẽ bằng TikZ ngay trong file. |
| `README.md` | File bạn đang đọc. |

## Cách đưa lên Overleaf (chọn 1 trong 2)

**Cách A — Kéo-thả (nhanh nhất):**
1. Vào Overleaf → **New Project → Blank Project** (đặt tên bất kỳ).
2. Xoá file `main.tex` mặc định, rồi **kéo `main.tex` trong folder này** thả vào.
3. Bấm **Recompile**.

**Cách B — Upload cả project:**
1. Nén folder này thành `.zip` (hoặc dùng file zip kèm theo nếu có).
2. Overleaf → **New Project → Upload Project** → chọn file `.zip`.
3. Bấm **Recompile**.

## Trình biên dịch (compiler)

- **Mặc định của Overleaf là pdfLaTeX — chạy được ngay, không cần chỉnh gì.**
  Phần đầu `main.tex` đã cấu hình sẵn tiếng Việt qua `fontenc T5` + `babel`.
- Nếu vì lý do nào đó **tiếng Việt hiển thị sai dấu**, đổi sang XeLaTeX:
  **Menu (góc trên trái) → Settings → Compiler → XeLaTeX** → Recompile.
  Preamble đã viết để tương thích **cả hai** engine (tự dùng `fontspec` khi chạy XeLaTeX),
  nên không cần sửa gì trong file.

## Gói LaTeX sử dụng (Overleaf có sẵn hết)

`iftex`, `babel` (vietnamese), `fontenc`/`inputenc`/`lmodern` hoặc `fontspec`, `geometry`,
`xcolor`, `underscore`, `booktabs`, `tabularx`, `longtable`, `enumitem`, `listings`,
`titlesec`, `tcolorbox`, `fancyhdr`, `tikz`, `hyperref`.

Tất cả đều nằm trong bản TeX Live đầy đủ của Overleaf — **không cần cài thêm**.

## Muốn chỉnh sửa nhanh

- **Đổi màu chủ đạo:** sửa `\definecolor{accent}{HTML}{2F4BBD}` gần đầu file (đang khớp
  màu accent của chính ứng dụng).
- **Đổi tên/tác giả trang bìa:** phần `\begin{titlepage} ... \end{titlepage}`.
- **Thêm/bớt mục:** mỗi phần là một `\section{...}`; các hộp nhấn mạnh dùng môi trường
  `note`, `blocker`, `tip` đã định nghĩa sẵn.
- Sơ đồ kiến trúc: khối `tikzpicture` trong mục "Kiến trúc tổng thể". Nếu máy bạn compile lỗi
  TikZ (hiếm), có thể comment khối đó lại; phần còn lại vẫn build bình thường.
