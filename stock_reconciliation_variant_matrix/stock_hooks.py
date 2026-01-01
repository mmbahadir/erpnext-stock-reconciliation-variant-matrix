import frappe

PRICE_LIST = "Alış Fiyatı"

def set_incoming_rate_from_buying_price(doc, method):
    if doc.doctype != "Stock Reconciliation":
        return

    for row in doc.items:
        # Zaten valuation varsa dokunma
        if row.valuation_rate:
            continue

        if not row.item_code:
            continue

        price = frappe.db.get_value(
            "Item Price",
            {
                "item_code": row.item_code,
                "price_list": PRICE_LIST,
                "buying": 1
            },
            "price_list_rate"
        )

        # Alış fiyatı varsa incoming_rate set et
        if price:
            row.incoming_rate = price

