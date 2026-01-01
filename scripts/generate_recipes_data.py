from __future__ import annotations

import json
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

SOURCE_FILE = Path("src/食譜清單.xlsx")
OUTPUT_FILE = Path("src/data/recipes.js")

FIELDS = [
    "編號",
    "圖片",
    "料理食譜",
    "材料 1",
    "材料 2",
    "材料 3",
    "材料 4",
    "材料 5",
    "食譜+",
    "使用器具",
    "價格",
    "⭐️0.5",
    "⭐️1.0",
    "⭐️1.5",
    "⭐️2.0",
    "⭐️2.5",
    "⭐️3.0",
    "⭐️3.5",
    "⭐️4.0",
    "⭐️4.5",
    "⭐️5.0",
]


def column_index(cell_ref: str) -> int:
    letters = "".join(ch for ch in cell_ref if ch.isalpha()).upper()
    index = 0
    for char in letters:
        index = index * 26 + (ord(char) - ord("A") + 1)
    return index - 1


def parse_shared_strings(zf: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in zf.namelist():
        return []
    root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
    ns = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    strings: list[str] = []
    for si in root.findall("s:si", ns):
        text = "".join(t.text or "" for t in si.findall(".//s:t", ns))
        strings.append(text)
    return strings


def read_cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.get("t")
    value = cell.find("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v")
    if cell_type == "s" and value is not None:
        return shared_strings[int(value.text or 0)]
    if cell_type == "inlineStr":
        inline = cell.find(
            "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}is"
        )
        if inline is not None:
            text = "".join(
                t.text or ""
                for t in inline.findall(
                    ".//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t"
                )
            )
            return text
    if value is not None and value.text is not None:
        return value.text
    return ""


def load_sheet_rows(source: Path) -> list[list[str]]:
    with zipfile.ZipFile(source) as zf:
        shared_strings = parse_shared_strings(zf)
        sheet = ET.fromstring(zf.read("xl/worksheets/sheet1.xml"))
    ns = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    rows = []
    for row in sheet.findall("s:sheetData/s:row", ns):
        row_cells: dict[int, str] = {}
        for cell in row.findall("s:c", ns):
            ref = cell.get("r")
            if not ref:
                continue
            row_cells[column_index(ref)] = read_cell_value(cell, shared_strings)
        max_index = max(row_cells.keys(), default=-1)
        rows.append([row_cells.get(idx, "") for idx in range(max_index + 1)])
    return rows


def normalize_header(header: str) -> str:
    if header == "廚具":
        return "使用器具"
    return header


def build_recipe_entries(rows: list[list[str]]) -> list[dict[str, str]]:
    if not rows:
        return []
    headers = [normalize_header(h.strip()) for h in rows[0]]
    entries: list[dict[str, str]] = []
    for row in rows[1:]:
        if not any(cell.strip() for cell in row):
            continue
        data = {
            headers[idx]: (cell or "").strip()
            for idx, cell in enumerate(row)
            if idx < len(headers) and headers[idx]
        }
        entry = {field: data.get(field, "") for field in FIELDS}
        entries.append(entry)
    return entries


def write_output(entries: list[dict[str, str]]) -> None:
    payload = json.dumps(entries, ensure_ascii=False, indent=2)
    OUTPUT_FILE.write_text(f"export const recipes = {payload};\n", encoding="utf-8")


def main() -> None:
    rows = load_sheet_rows(SOURCE_FILE)
    entries = build_recipe_entries(rows)
    write_output(entries)


if __name__ == "__main__":
    main()
