# ERPNext Stock Reconciliation Variant Matrix

ERPNext için **Stock Reconciliation** ekranında  
**Nebim tarzı (Renk × Beden)** varyant matrisi ile hızlı stok girişi sağlar.

## ✨ Özellikler

- Renk × Beden matris görünümü
- Ok tuşları ile hücreler arası gezinme
- Ctrl + Enter ile satırlara aktarma
- Aynı ürüne tekrar ekleme (qty üzerine ekler)
- Matris aktarıldıktan sonra:
  - Matris kapanmaz
  - Hücreler temizlenir
  - Yeni ürün girilebilir
- Responsive tablo (dar ekranda taşma yapmaz)
- ERPNext Stock Reconciliation ile **tam uyumlu**

## 🧩 Kullanım Senaryosu

- Tek tek varyant seçmeden
- Çok sayıda beden / renk için
- Hızlı ve hatasız stok sayımı

Özellikle:
- Tekstil
- Ayakkabı
- Çocuk giyim
- Nebim’den ERPNext’e geçen işletmeler

## 📦 Kurulum

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app https://github.com/mmbahadir/erpnext-stock-reconciliation-variant-matrix.git
bench install-app stock_reconciliation_variant_matrix

