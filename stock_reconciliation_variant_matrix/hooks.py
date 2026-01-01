app_name = "stock_reconciliation_variant_matrix"
app_title = "Stock Reconciliation Variant Matrix"
app_publisher = "S"
app_description = "Variant matrix for Stock Reconciliation"
app_email = "dev@sunnetsarayi.com"
app_license = "mit"

doctype_js = {
    "Stock Reconciliation": "public/js/stock_reconciliation_variant_matrix.js"
}

doc_events = {
    "Stock Reconciliation": {
        "before_submit": "stock_reconciliation_variant_matrix.stock_hooks.set_incoming_rate_from_buying_price"
    }
}

