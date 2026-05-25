/*
 * Bulk attendance row selector — bookmarklet source.
 *
 * Adds a small floating panel to the Money Forward "bulk_attendances" page with:
 *   - 休日スキップ          -> when checked, holiday rows (休日) are excluded
 *                              from weekday selection and from invert
 *   - 日 月 火 水 木 金 土  -> toggle selection of all rows for that weekday
 *   - 反転                 -> invert the current selection
 *   - クリア               -> clear the current selection
 *   - <pattern dropdown> 変更 -> set every selected row's work pattern to the
 *                                chosen value (options are copied from the
 *                                page's own attendance-select-field).
 *
 * Selection is shown as a blue outline on each row's work-status <select>.
 *
 * If you edit this, you'll need to regenerate the bookmarklet href in
 * `install.html` (collapse to one line, URL-encode, prefix `javascript:`).
 */
(function () {
    const STYLE_ID = "baul-style";
    const PANEL_ID = "baul-panel";
    const HL_CLASS = "baul-hl";

    if (!document.getElementById(STYLE_ID)) {
        const s = document.createElement("style");
        s.id = STYLE_ID;
        s.textContent = "." + HL_CLASS + "{outline:2px solid #007bff;outline-offset:-2px}";
        document.head.appendChild(s);
    }

    const getRows = () => document.querySelectorAll(".attendance-table-contents tr.v3");
    const getStatus = (row) => row.querySelector(".column-pattern .attendance-select-field");
    const getDay = (row) => row.querySelector(".column-day");
    const getDayType = (row) => row.querySelector(".column-classification");
    const isHoliday = (row) => {
        const t = getDayType(row);
        return !!t && t.textContent.includes("休日");
    };

    const selected = new Set();
    const highlight = (el) => {
        selected.add(el);
        el.classList.add(HL_CLASS);
    };
    const unhighlight = (el) => {
        selected.delete(el);
        el.classList.remove(HL_CLASS);
    };

    const toggleByDay = (day, skipHolidays) => {
        getRows().forEach((row) => {
            if (skipHolidays && isHoliday(row)) return;
            const dayEl = getDay(row);
            if (!dayEl || !dayEl.textContent.includes(day)) return;
            const status = getStatus(row);
            if (!status) return;
            selected.has(status) ? unhighlight(status) : highlight(status);
        });
    };

    const invert = (skipHolidays) => {
        getRows().forEach((row) => {
            if (skipHolidays && isHoliday(row)) return;
            const status = getStatus(row);
            if (!status) return;
            selected.has(status) ? unhighlight(status) : highlight(status);
        });
    };

    const clearSelection = () => {
        Array.from(selected).forEach(unhighlight);
    };

    const applyValue = (value) => {
        if (selected.size === 0) {
            alert("何も選択されていません");
            return;
        }
        selected.forEach((dropdown) => {
            const opts = dropdown.options;
            for (let i = 0; i < opts.length; i++) {
                if (opts[i].value === value) {
                    dropdown.selectedIndex = i;
                    dropdown.dispatchEvent(new Event("change", { bubbles: true }));
                    break;
                }
            }
        });
    };

    const buildPatternSelect = () => {
        const source = document.querySelector(".attendance-select-field");
        if (!source) return null;
        const sel = document.createElement("select");
        sel.style.marginRight = "4px";
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "-- 選択 --";
        sel.appendChild(placeholder);
        const reset = document.createElement("option");
        reset.value = "";
        reset.textContent = "【リセット】";
        sel.appendChild(reset);
        Array.from(source.options).forEach((opt) => {
            if (!opt.value) return;
            const o = document.createElement("option");
            o.value = opt.value;
            o.textContent = opt.textContent;
            sel.appendChild(o);
        });
        return sel;
    };

    const existing = document.getElementById(PANEL_ID);
    if (existing) existing.remove();

    const panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.style.cssText =
        "position:fixed;top:10px;right:10px;z-index:99999;background:#fff;" +
        "border:1px solid #ccc;padding:8px;border-radius:6px;" +
        "box-shadow:0 2px 8px rgba(0,0,0,.15);font:12px sans-serif";

    const skipLabel = document.createElement("label");
    skipLabel.style.cssText = "display:block;margin-bottom:6px";
    const skipCb = document.createElement("input");
    skipCb.type = "checkbox";
    skipCb.checked = true;
    skipLabel.appendChild(skipCb);
    skipLabel.appendChild(document.createTextNode(" 休日スキップ"));
    panel.appendChild(skipLabel);

    const days = ["日", "月", "火", "水", "木", "金", "土"];
    const dayRow = document.createElement("div");
    dayRow.style.cssText = "margin-bottom:6px";
    days.forEach((d) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = d;
        b.style.marginRight = "2px";
        b.onclick = () => toggleByDay(d, skipCb.checked);
        dayRow.appendChild(b);
    });
    panel.appendChild(dayRow);

    const mkBtn = (text, handler, marginLeft) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = text;
        if (marginLeft) b.style.marginLeft = marginLeft;
        b.onclick = handler;
        return b;
    };

    const actionRow = document.createElement("div");
    actionRow.style.cssText = "margin-bottom:6px";
    actionRow.appendChild(mkBtn("反転", () => invert(skipCb.checked)));
    actionRow.appendChild(mkBtn("クリア", clearSelection, "4px"));
    actionRow.appendChild(
        mkBtn("×", () => {
            clearSelection();
            panel.remove();
        }, "4px")
    );
    panel.appendChild(actionRow);

    const applyRow = document.createElement("div");
    const patternSelect = buildPatternSelect();
    if (patternSelect) {
        applyRow.appendChild(patternSelect);
        applyRow.appendChild(
            mkBtn("変更", () => {
                if (!patternSelect.value && patternSelect.selectedIndex === 0) {
                    alert("値を選択してください");
                    return;
                }
                applyValue(patternSelect.value);
            })
        );
    } else {
        applyRow.textContent = "(勤務パターン取得失敗。日次勤怠ページでブックマークバーから開けて)";
        applyRow.style.cssText =
            "font:13px 'Hiragino Sans','Yu Gothic','Meiryo',sans-serif;color:#000;" +
            "-webkit-font-smoothing:antialiased";
    }
    panel.appendChild(applyRow);

    document.body.appendChild(panel);
})();
