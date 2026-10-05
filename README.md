# Literature

Bộ slide Ngữ văn 12 · Nói và nghe — **So sánh & đánh giá hai tác phẩm truyện: *Vợ nhặt* (Kim Lân) và *Vợ chồng A Phủ* (Tô Hoài)**, Nhóm 4. Chạy bằng Electron (HTML/CSS/JS thuần), dựng trên khung DeckStarter: khung 16:10, điều hướng, stepper, móc chuyển slide, xuất PDF, quay video.

Giao diện "sách cổ": mỗi slide là một trang sách mở, bấm → là lật trang. Trang trái luôn là *Vợ nhặt* (màu rơm), trang phải luôn là *Vợ chồng A Phủ* (màu chàm); điểm chung của hai tác phẩm nằm trên dải băng đỏ vắt qua gáy sách.

## Chạy

```bash
npm install          # lần đầu
npm start            # mở app
npm run web          # xem trên trình duyệt → http://127.0.0.1:8766
npm run export       # dist/Literature-preview.pdf — mỗi click một trang
npm run record       # dist/Literature-walkthrough.mp4 — video chạy hết deck (CLICKS=5 để thử nhanh)
```

Hoặc double-click `Run-Literature.command` (macOS; lần đầu `chmod +x Run-Literature.command`) / `Run-Literature.bat` (Windows).

## Điều khiển

| Phím | Tác dụng |
| --- | --- |
| → · Space · PageDown · click | Bước / slide sau |
| ← · PageUp · click mép trái | Bước / slide trước |
| D / A | Nhảy ngay sang slide sau / trước, bỏ qua hiệu ứng |
| Home / End | Slide đầu / cuối |
| F | Toàn màn hình |
| `#5` trên URL | Nhảy tới slide 5 |

## Cấu trúc

- `index.html` — các slide (`<section class="slide">`)
- `css/deck.css` — khung 16:10, cơ chế slide và stepper, design tokens (màu, chữ, khoảng cách, thời gian hiệu ứng)
- `css/book.css` — giao diện "sách cổ": bìa da, trang mở, khung viền, ruy băng
- `css/fx.css` — chuyển slide: lật bìa (slide 1 → 2), lật trang, dải băng cuộn ra, sợi chỉ, gập sách ở bìa sau
- `js/deck.js` — điều hướng, stepper, chuyển slide · `js/book.js` — dựng tờ lật trang, bản sao các thứ vắt qua gáy, số trang · `js/erosion-glow.js` — viền ảnh cháy sáng
- `electron/` — cửa sổ app · `tools/export-pdf.js` — xuất PDF · `tools/record-video.js` — quay video · `fonts/` — Be Vietnam Pro + Literata + Cormorant Garamond (`npm run fonts`)

## Quy tắc

- Kích thước dùng `rem`, `var(--vw)` / `var(--vh)` hoặc `calc(N * var(--px))` — không dùng `vw` / `vh` trực tiếp.
- Không animate `opacity` / `visibility` trên `.slide`, không bật tắt `will-change` (Electron bị nháy đen).
- Không dùng `mix-blend-mode` cho lớp phủ toàn màn hình; hiệu ứng chạy liên tục chỉ animate `transform` / `opacity`.
- Canvas / WebGL: mật độ điểm ảnh tối đa 1.5×, chỉ vẽ khi slide đang hiện.

## Nội dung slide

33 slide, mỗi lần bấm → là một lần lật trang (riêng slide 5 có thêm 1 lần bấm để kể tiếp cốt truyện *Vợ chồng A Phủ*). Mỗi trang có số trang ở góc trên; dòng "Điểm chung" là dải băng đỏ ở chân trang.

### Mở đầu

#### Slide 1 · Bìa
Nhóm 4 · **Ngữ văn 12** · *Nói và nghe* · So sánh & đánh giá hai tác phẩm truyện · Trình bày: Lê Đức Đăng Khoa, Trần Hoàng Quân

#### Slide 2 · Hai tác phẩm (bìa lật mở)
- **Trái:** Kim Lân — *Vợ nhặt*, in trong tập *Con chó xấu xí*. "Một người được *nhặt* về làm vợ."
- **Phải:** Tô Hoài — *Vợ chồng A Phủ*, in trong tập *Truyện Tây Bắc*. "Một người bị *bắt* về làm vợ."
- Chạy ngang hai trang: "…và cả hai vẫn muốn sống."

### I · Giới thiệu & khái quát

#### Slide 3 · Giới thiệu vấn đề so sánh
- **Vợ nhặt:** viết về nạn đói năm 1945 và số phận người nông dân nghèo. Nổi bật: tình người · khát vọng sống · niềm tin vào tương lai. *(ảnh: Nạn đói Ất Dậu, Hà Nội 1945 · Võ An Ninh)*
- **Vợ chồng A Phủ:** viết về cuộc sống người dân miền núi dưới ách áp bức. Nổi bật: sức sống · khát vọng tự do · khả năng tự giải phóng. *(ảnh: Phụ nữ H'Mông phơi vải chàm · exfordy, CC BY)*
- Băng: So sánh điểm tương đồng và khác biệt về nội dung và nghệ thuật.

#### Slide 4 · Tác giả, hoàn cảnh sáng tác, đề tài
- **Kim Lân** (1920 – 2007), nhà văn của nông thôn và người nông dân. Hoàn cảnh: nạn đói năm 1945. Đề tài: cuộc sống của người dân nghèo trong nạn đói năm 1945.
- **Tô Hoài** (1920 – 2014), người đưa miền núi vào trang văn. Hoàn cảnh: năm 1952, sau chuyến đi thực tế ở Tây Bắc. Đề tài: cuộc sống và số phận người dân miền núi Tây Bắc dưới ách áp bức của thực dân.

#### Slide 5 · Cốt truyện, nhân vật (2 lần bấm)
- **Vợ nhặt:** giữa nạn đói khủng khiếp, Tràng – một người dân nghèo – "nhặt" được vợ. Nhân vật chính: Tràng, người vợ nhặt, bà cụ Tứ.
- **Vợ chồng A Phủ:** Mị bị bắt về làm con dâu gạt nợ nhà thống lí Pá Tra; A Phủ trở thành người ở trừ nợ. → *(bấm, trang cháy để kể tiếp)* Sau thời gian sống trong áp bức, Mị và A Phủ vùng lên tự giải thoát. Nhân vật chính: Mị, A Phủ, thống lí Pá Tra.

#### Slide 6 · Xác định phương diện so sánh
Bốn phương diện so sánh (la bàn I–IV):
1. Số phận và hoàn cảnh của người lao động nghèo
2. Vẻ đẹp phẩm chất của con người
3. Khát vọng sống và tương lai
4. Nghệ thuật xây dựng nhân vật và cách kể chuyện

Lộ trình: Tương đồng · Khác biệt · Lý giải · Đánh giá

### II · Điểm tương đồng

#### Slide 7 · Mở chương II — về nội dung và nghệ thuật
Trong chương này: 1. Đề tài, chủ đề · 2. Hình tượng, số phận, phẩm chất và vẻ đẹp nhân vật · 3. Giá trị hiện thực, giá trị nhân đạo · 4. Nghệ thuật *(sợi chỉ vàng nối hai trang)*

#### Slide 8 · Đề tài, chủ đề
- **Vợ nhặt:** người dân nghèo trong nạn đói năm 1945.
- **Vợ chồng A Phủ:** người dân miền núi Tây Bắc dưới ách áp bức.
- **Điểm chung:** Đề tài — cùng viết về người lao động nghèo trong xã hội cũ. Chủ đề — số phận đau khổ · sức sống tiềm tàng · khát vọng hạnh phúc, tự do.

#### Slide 9 · Hình tượng nhân vật, số phận
- **Vợ nhặt:** Tràng, người vợ nhặt, bà cụ Tứ. Cảnh nạn đói… "Người đói xanh xám như những bóng ma."
- **Vợ chồng A Phủ:** Mị, A Phủ. Mị sống… "lùi lũi như con rùa nuôi trong xó cửa."
- **Điểm chung:** người lao động nghèo — số phận bất hạnh nhưng giàu sức sống, phẩm chất tốt đẹp; chịu nhiều đau khổ, bị đẩy vào hoàn cảnh khốn cùng.

#### Slide 10 · Phẩm chất
- **Vợ nhặt:** bà cụ Tứ đón nhận nàng dâu giữa ngày đói: "U cũng mừng lòng."
- **Vợ chồng A Phủ:** Mị nhìn thấy nước mắt A Phủ và quyết định cắt dây trói cứu anh: "Mị cũng không sợ nữa."
- **Điểm chung:** giàu tình yêu thương, sức sống, khát vọng hạnh phúc.

#### Slide 11 · Vẻ đẹp nhân vật
- **Vợ nhặt:** bữa cơm ngày đói chỉ có nồi cháo cám… nhưng mọi người vẫn nói chuyện tương lai.
- **Vợ chồng A Phủ:** trạng thái tê liệt → hồi sinh trong đêm mùa xuân → cứu A Phủ → tự giải thoát.
- **Điểm chung:** vẻ đẹp tâm hồn, tình người và khát vọng vươn lên tới cuộc sống tốt đẹp hơn.

#### Slide 12 · Giá trị hiện thực, giá trị nhân đạo
- **Vợ nhặt:** hiện thực — "Người chết như ngả rạ." Nhân đạo — Tràng cưu mang vợ; bà cụ Tứ đón nhận nàng dâu; kết thúc hướng tới hy vọng.
- **Vợ chồng A Phủ:** hiện thực — A Phủ bị trói đứng nhiều ngày. Nhân đạo — Mị cắt dây trói cứu A Phủ và cùng anh chạy trốn.
- **Điểm chung:** giá trị hiện thực — tố cáo xã hội bất công, tàn bạo; giá trị nhân đạo — cảm thương số phận con người, trân trọng phẩm chất tốt đẹp.

#### Slide 13 · Nghệ thuật: cách kể, giọng điệu (cả hai tác phẩm)
- **Cách kể:** người kể chuyện giấu mình · ngôi kể thứ ba · kết hợp điểm nhìn bên ngoài và bên trong.
- **Giọng điệu:** kết hợp xót thương, cảm thông + trân trọng, ngợi ca… những phẩm chất tốt đẹp.

#### Slide 14 · Kết cấu truyện
- **Vợ nhặt:** bóng tối của nạn đói → tình người, mái ấm → hướng tới ánh sáng và tương lai. Dẫn chứng: hình ảnh lá cờ đỏ ở cuối truyện. *(ảnh: Phá kho thóc Nhật, 1945 · Võ An Ninh)*
- **Vợ chồng A Phủ:** kiếp sống nô lệ → thức tỉnh → phản kháng → tự giải phóng. Dẫn chứng: Mị và A Phủ rời khỏi Hồng Ngài.
- **Điểm chung:** từ hoàn cảnh đau khổ, éo le đến chuyển biến trong nhận thức, tâm trạng, số phận.

#### Slide 15 · Nghệ thuật xây dựng nhân vật
- **Vợ nhặt:** khắc họa qua ngoại hình, hành động, lời nói và đặc biệt là diễn biến tâm lí: Tràng, bà cụ Tứ.
- **Vợ chồng A Phủ:** đặc biệt thành công trong miêu tả tâm lí Mị qua những biến chuyển: cam chịu → hồi sinh → phản kháng → tự giải phóng.
- **Điểm chung:** khắc họa qua ngoại hình, hành động, lời nói, tâm lí và diễn biến nội tâm.

#### Slide 16 · Ngôn ngữ
- **Vợ nhặt:** đậm chất khẩu ngữ của người nông dân Bắc Bộ — "u – con", lời nói ngắn, dân dã.
- **Vợ chồng A Phủ:** giàu màu sắc dân tộc và miền núi Tây Bắc — "con dâu gạt nợ", "thống lí", "A Phủ", "Hồng Ngài"; đêm tình mùa xuân, tiếng sáo, phiên chợ.
- **Điểm chung:** giản dị, gần gũi với đời sống, đậm màu sắc của từng vùng miền.

### III · Điểm khác biệt

#### Slide 17 · Mở chương III — mỗi tác phẩm một con đường
Trong chương này: 1. Tư tưởng, chủ đề và cách nhìn con người · 2. Số phận và diễn biến tâm lí nhân vật · 3. Giá trị hiện thực và nhân đạo · 4. Đặc sắc nghệ thuật *(sợi chỉ tách làm hai)*

#### Slide 18 · Tư tưởng, chủ đề · số phận
- **Vợ nhặt:** tập trung vào nạn đói 1945. Số phận nhân vật: nạn nhân của cái đói.
- **Vợ chồng A Phủ:** tập trung vào xã hội phong kiến Tây Bắc. Số phận nhân vật: nạn nhân của cường quyền, thần quyền.

#### Slide 19 · Diễn biến tâm lí
- **Vợ nhặt:** hướng tới tương lai, mái ấm gia đình. Tràng: ngờ nghệch → có ý thức trụ cột. Người vợ: chao chát, liều lĩnh → hiền thục.
- **Vợ chồng A Phủ:** cam chịu → thức tỉnh → phản kháng. Mị: "như con rùa nuôi trong xó cửa" → bừng tỉnh trong đêm lạnh, cắt dây cởi trói A Phủ.

#### Slide 20 · Giá trị hiện thực và nhân đạo
- **Vợ nhặt:** hiện thực — bức tranh xóm ngụ cư ngột ngạt mùi tử khí, ranh giới sống chết mỏng manh. Nhân đạo — nâng niu hạnh phúc gia đình, ca ngợi sự cưu mang nhau lúc hoạn nạn.
- **Vợ chồng A Phủ:** hiện thực — luật lệ bóc lột, phạt vạ tàn bạo của chúa đất. Nhân đạo — sự đồng cảm giai cấp và con đường tìm kiếm tự do.

#### Slide 21 · Nghệ thuật: tình huống, điểm nhìn & tâm lí
- **Vợ nhặt:** tình huống bất ngờ, éo le, vừa bi vừa hài: Tràng nhặt vợ giữa nạn đói. Góc nhìn thứ ba, luân chuyển linh hoạt nội tâm cả ba nhân vật: Tràng, vợ nhặt, bà cụ Tứ.
- **Vợ chồng A Phủ:** chuỗi biến cố tích tụ dần thành cao trào (bị bắt làm dâu gạt nợ → đêm tình mùa xuân → A Phủ bị trói → cắt dây, cùng chạy trốn). Góc nhìn thứ ba, đi sâu vào điểm nhìn, dòng ý thức của Mị.

#### Slide 22 · Nghệ thuật: kết cấu, không gian & ngôn ngữ
- **Vợ nhặt:** kết cấu dồn nén, thời gian ngắn trong xóm ngụ cư chật hẹp. Ngôn ngữ đậm chất khẩu ngữ, mộc mạc của nông thôn đồng bằng Bắc Bộ.
- **Vợ chồng A Phủ:** kết cấu thời gian dài giữa núi rừng rộng lớn. Ngôn ngữ giàu chất thơ, nhịp điệu miên man phong vị Tây Bắc.

### IV · Lý giải

#### Slide 23 · Mở chương IV — sự tương đồng và khác biệt
Trong chương này: 1. Vì sao hai tác phẩm tương đồng (người lao động nghèo · hiện thực khắc nghiệt · cảm hứng nhân đạo) · 2. Vì sao mỗi tác phẩm một vẻ riêng (Kim Lân am hiểu nông thôn · Tô Hoài am hiểu miền núi) *(hai sợi chỉ lần ngược về một gốc)*

#### Slide 24 · Vì sao tương đồng
- **Kim Lân**, nhà văn của nông thôn: ngòi bút hướng về người nông dân nghèo · hiện thực khắc nghiệt: nạn đói năm 1945 · cảm hứng nhân đạo: trân trọng tình người.
- **Tô Hoài**, người đưa miền núi vào trang văn: ngòi bút hướng về người dân miền núi Tây Bắc · hiện thực khắc nghiệt: cường quyền, thần quyền · cảm hứng nhân đạo: trân trọng sức sống, khát vọng tự do.
- **Băng:** 1. Cùng hướng ngòi bút vào người lao động nghèo · 2. Cùng chịu ảnh hưởng từ hiện thực xã hội khắc nghiệt · 3. Cùng đề cao giá trị con người và cảm hứng nhân đạo.

#### Slide 25 · Vì sao khác biệt: vốn sống của mỗi nhà văn
- **Kim Lân:** am hiểu nông thôn; chú trọng tình người và mái ấm gia đình.
- **Tô Hoài:** am hiểu miền núi; nổi bật phong tục và quá trình con người tự giải phóng.

### V · Đánh giá

#### Slide 26 · Mở chương V — giá trị và đóng góp
Trong chương này: 1. Điểm gặp gỡ trong tư tưởng và cảm hứng sáng tác · 2. Nét độc đáo riêng của mỗi tác phẩm · 3. Giá trị và sức sống của hai tác phẩm · 4. Đóng góp của hai tác giả *(hai sợi chỉ đan vào nhau)*

#### Slide 27 · Điểm gặp gỡ trong tư tưởng, cảm hứng
- **Vợ nhặt:** hiện thực đau khổ → khát vọng hạnh phúc. Giữa nạn đói, con người vẫn khao khát hạnh phúc, mái ấm.
- **Vợ chồng A Phủ:** hiện thực đau khổ → khát vọng tự do. Từ kiếp nô lệ, con người vùng lên giành lấy tự do.
- **Băng:** cùng phản ánh hiện thực đau khổ, thể hiện giá trị nhân đạo sâu sắc; đều khẳng định phẩm giá, sức sống và khát vọng hạnh phúc, tự do.

#### Slide 28 · Nét độc đáo (1)
- **Vợ nhặt:** tình huống độc đáo — "nhặt vợ" giữa nạn đói. Nổi bật vẻ đẹp của tình người, tình gia đình, đặc biệt là sự cưu mang giữa những con người nghèo khổ.
- **Vợ chồng A Phủ:** khai thác cuộc sống người dân miền núi Tây Bắc dưới áp bức của cường quyền, thần quyền. Nổi bật quá trình thức tỉnh và tự giải phóng của Mị và A Phủ.

#### Slide 29 · Nét độc đáo (2)
- **Vợ nhặt:** niềm hy vọng — bữa cơm ngày đói · lá cờ đỏ · đoàn người phá kho thóc Nhật. Phong cách: mộc mạc, chân thực, gần gũi, giàu tình cảm.
- **Vợ chồng A Phủ:** gắn số phận cá nhân với con đường đến với cách mạng. Phong cách: giàu chất hiện thực, am hiểu phong tục miền núi, miêu tả tâm lí tinh tế.

#### Slide 30 · Giá trị và sức sống (cả hai tác phẩm)
- **Giá trị hiện thực — sâu sắc:** nạn đói năm 1945 + ách áp bức ở Tây Bắc. Giúp người đọc hiểu về những giai đoạn đau khổ của người lao động.
- **Giá trị nhân đạo — bền vững:** tình yêu, hạnh phúc + phẩm giá, khát vọng sống. Khẳng định phẩm giá, tình yêu, khát vọng sống và hạnh phúc của con người.

#### Slide 31 · Đóng góp của hai tác giả
- **Kim Lân:** cây bút xuất sắc viết về nông thôn và người nông dân; đem đến cách nhìn nhân hậu, sâu sắc về con người trong hoàn cảnh nghèo đói.
- **Tô Hoài:** đóng góp nổi bật là đưa đời sống và văn hóa miền núi vào văn học; thành công khi khám phá sức sống và quá trình thức tỉnh của con người.

### Kết

#### Slide 32 · Kết (gọi lại trang mở đầu)
- **Trái:** Kim Lân — *Vợ nhặt* · tình người · mái ấm · hy vọng. "Giữa nạn đói, *tình người* vẫn thắp lên hy vọng."
- **Phải:** Tô Hoài — *Vợ chồng A Phủ* · thức tỉnh · tự giải phóng · cách mạng. "Giữa áp bức, con người *tự giải phóng* chính mình."
- Chạy ngang hai trang: "Hai cảnh đời, một khát vọng sống."

#### Slide 33 · Bìa sau (sách khép lại)
**Cảm ơn** thầy cô và các bạn đã lắng nghe · *Vợ nhặt · Vợ chồng A Phủ* · Nhóm 4
