frappe.ui.form.on("Stock Reconciliation", {
  refresh(frm) {

    frm.remove_custom_button("Variant Tablosu");

    frm.add_custom_button("Variant Tablosu", () => {

      if (!frm.doc.set_warehouse) {
        frappe.msgprint("Önce depo seçmelisiniz");
        return;
      }

      let d = new frappe.ui.Dialog({
        title: "Varyant Tablosu",
        size: "extra-large",
        fields: [
          {
            fieldname: "item_template",
            fieldtype: "Link",
            options: "Item",
            label: "Ürün Template",
            reqd: 1,
            get_query() {
              return { filters: { has_variants: 1 } };
            },
          },
          {
            fieldname: "incoming_rate",
            fieldtype: "Currency",
            label: "Valuation Rate (Birim Fiyat)",
            reqd: 1,
          },
          { fieldname: "matrix_html", fieldtype: "HTML" },
        ],
      });

      d.show();

      d.fields_dict.item_template.$input.on(
        "awesomplete-selectcomplete",
        function () {

          let template = d.get_value("item_template");
          if (!template) return;

          frappe.call({
            method: "stock_reconciliation_variant_matrix.api.get_variant_matrix",
            args: { item_template: template },
            callback(r) {

              let data = r.message;
              if (!data) return;

              let html = `
<style>
.variant-matrix-wrapper {
  max-width: 1200px;
  width: 100%;
  overflow-x: auto;
  margin: 0 auto;
}

.variant-matrix-table {
  border-collapse: collapse;
  min-width: max-content;
}

.variant-matrix-table th,
.variant-matrix-table td {
  padding: 4px;
  text-align: center;
  white-space: nowrap;
  font-size: 12px;
}

.variant-matrix-table th {
  background: #f7f7f7;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 2;
}

.variant-matrix-table th:first-child,
.variant-matrix-table td:first-child {
  position: sticky;
  left: 0;
  background: #ffffff;
  z-index: 3;
  font-weight: 600;
  min-width: 140px;
}

.variant-matrix-table td input {
  width: 70px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #d1d8dd;
  text-align: center;
}
</style>

<div class="variant-matrix-wrapper">
<table class="table table-bordered variant-matrix-table">
<thead>
<tr>
<th>Renk \\ Beden</th>`;

              data.sizes.forEach(s => {
                html += `<th>${frappe.utils.escape_html(s)}</th>`;
              });

              html += `</tr></thead><tbody>`;

              data.colors.forEach(c => {
                html += `<tr><td><b>${frappe.utils.escape_html(c)}</b></td>`;
                data.sizes.forEach(s => {
                  html += `
<td>
  <input type="text"
    placeholder="Adet"
    data-renk="${frappe.utils.escape_html(c)}"
    data-beden="${frappe.utils.escape_html(s)}">
</td>`;
                });
                html += `</tr>`;
              });

              html += `
</tbody></table>
</div>

<div style="text-align:right;margin-top:10px">
<button class="btn btn-primary" id="apply_matrix">
Satırlara Aktar (Ctrl+Enter)
</button>
</div>`;

              d.fields_dict.matrix_html.$wrapper.html(html);

              /* ⬅️➡️⬆️⬇️ OK TUŞLARI – SADECE EKLENEN KISIM */
              const inputs = d.$wrapper.find(".variant-matrix-table input");

              inputs.on("keydown", function (e) {
                const index = inputs.index(this);
                const cols = data.sizes.length;

                let targetIndex = null;

                if (e.key === "ArrowRight") targetIndex = index + 1;
                if (e.key === "ArrowLeft")  targetIndex = index - 1;
                if (e.key === "ArrowDown")  targetIndex = index + cols;
                if (e.key === "ArrowUp")    targetIndex = index - cols;

                if (targetIndex !== null && inputs[targetIndex]) {
                  e.preventDefault();
                  inputs[targetIndex].focus();
                }
              });
              /* ⬅️➡️⬆️⬇️ BİTTİ */

              function apply_to_rows() {

                let warehouse = frm.doc.set_warehouse;
                let rate = flt(d.get_value("incoming_rate"));

                if (!rate || rate <= 0) {
                  frappe.msgprint("Birim fiyat girilmelidir");
                  return;
                }

                let existing = {};
                (frm.doc.items || []).forEach(r => {
                  if (r.item_code) existing[r.item_code] = r;
                });

                d.$wrapper.find(".variant-matrix-table input").each(function () {

                  let qty = flt(String(this.value || "").replace(",", "."));
                  if (!qty || qty <= 0) return;

                  let renk = this.dataset.renk;
                  let beden = this.dataset.beden;

                  frappe.call({
                    method: "stock_reconciliation_variant_matrix.api.get_variant_item",
                    args: { template, renk, beden },
                    callback(rr) {

                      let code = rr.message;
                      if (!code) return;

                      let row = existing[code] || frm.add_child("items");
                      existing[code] = row;

                      let new_qty = flt(row.qty || 0) + qty;

                      frappe.run_serially([
                        () => frappe.model.set_value(row.doctype, row.name, "item_code", code),
                        () => frappe.model.set_value(row.doctype, row.name, "warehouse", warehouse),
                        () => frappe.model.set_value(row.doctype, row.name, "qty", new_qty),
                        () => frappe.model.set_value(row.doctype, row.name, "valuation_rate", rate),
                      ]).then(() => frm.refresh_field("items"));
                    }
                  });
                });

                d.$wrapper.find(".variant-matrix-table input").val("");
                d.set_value("item_template", null);
                d.set_value("incoming_rate", null);
              }

              d.$wrapper.find("#apply_matrix").on("click", apply_to_rows);

              d.$wrapper.on("keydown", function (e) {
                if (e.ctrlKey && e.key === "Enter") {
                  e.preventDefault();
                  apply_to_rows();
                }
              });
            }
          });
        }
      );
    });
  }
});

