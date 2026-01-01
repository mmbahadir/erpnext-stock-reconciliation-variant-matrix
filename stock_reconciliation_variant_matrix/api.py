import frappe


@frappe.whitelist()
def get_variant_matrix(item_template: str):
    """
    Renk ve Beden değerlerini,
    Item Attribute Value tablosundaki idx (Sr) sırasına göre döner.
    """

    rows = frappe.db.sql(
        """
        SELECT
            iva.attribute,
            iva.attribute_value,
            iav.idx
        FROM `tabItem Variant Attribute` iva
        INNER JOIN `tabItem` i
            ON i.name = iva.parent
        INNER JOIN `tabItem Attribute Value` iav
            ON iav.attribute_value = iva.attribute_value
           AND iav.parent = iva.attribute
        WHERE i.variant_of = %s
          AND iva.attribute IN ('Renk', 'Beden')
        ORDER BY
            CASE
                WHEN iva.attribute = 'Renk' THEN 1
                WHEN iva.attribute = 'Beden' THEN 2
            END,
            iav.idx
        """,
        (item_template,),
        as_dict=True,
    )

    colors = []
    sizes = []

    for r in rows:
        if r["attribute"] == "Renk" and r["attribute_value"] not in colors:
            colors.append(r["attribute_value"])
        elif r["attribute"] == "Beden" and r["attribute_value"] not in sizes:
            sizes.append(r["attribute_value"])

    return {
        "colors": colors,
        "sizes": sizes,
    }


@frappe.whitelist()
def get_variant_item(template: str, renk: str, beden: str):
    """
    Template + Renk + Beden → gerçek varyant item_code
    """

    res = frappe.db.sql(
        """
        SELECT iva.parent
        FROM `tabItem Variant Attribute` iva
        INNER JOIN `tabItem` i
            ON i.name = iva.parent
        WHERE i.variant_of = %s
          AND (
                (iva.attribute = 'Renk'  AND iva.attribute_value = %s)
             OR (iva.attribute = 'Beden' AND iva.attribute_value = %s)
          )
        GROUP BY iva.parent
        HAVING COUNT(DISTINCT iva.attribute) = 2
        LIMIT 1
        """,
        (template, renk, beden),
        as_dict=True,
    )

    return res[0]["parent"] if res else None


@frappe.whitelist()
def get_buying_price(item_code: str, price_list: str = "Alış Fiyatı"):
    """
    Item Price → Alış Fiyatı
    """
    val = frappe.db.get_value(
        "Item Price",
        {"item_code": item_code, "price_list": price_list},
        "price_list_rate",
    )
    return float(val or 0)

