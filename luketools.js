// LukeTools v2.8.10 + Bridge - by lukeo25
// https://github.com/lukeo25/WickTools
(function () {
    "use strict";


    var LT_GITHUB_RAW_BASE = "https://raw.githubusercontent.com/lukeo25/WickTools/main/"; // FIX
    var LT_CONFIG_URL = LT_GITHUB_RAW_BASE + "Config.json"; // FIX

    var GUARD = "LukeToolsLocalPanelBridgeLoaded_282";
    if (window[GUARD]) return;
    window[GUARD] = true;

    var PANEL_ID = "luke_tools_panel_271";
    var LAUNCHER_ID = "luke_tools_launcher_271";
    var GAMESPRITE_LAUNCHER_ID = "luke_tools_gamesprite_launcher_271"; // FIX
    var GAMESPRITE_PANEL_ID = "luke_tools_gamesprite_panel_271"; // FIX
    var GAMESPRITE_PANEL_IFRAME_ID = "luke_tools_gamesprite_panel_iframe_271"; // FIX
    var OVERLAY_ID = "luke_tools_fullscreen_overlay_271";
    var OVERLAY_IFRAME_ID = "luke_tools_fullscreen_iframe_271";
    var PANEL_IFRAME_ID = "luke_tools_panel_iframe_271";

    var STORAGE_X = "LukeToolsPanelPosX_271";
    var STORAGE_Y = "LukeToolsPanelPosY_271";
    var STORAGE_PANEL_JSON = "LukeToolsPanelConfigJSON_271"; // FIX: JSON config for icon buttons
    var DEFAULT_PANEL_JSON_URL = LT_GITHUB_RAW_BASE + "scripts/config.json"; // FIX: default config location in public/scripts // FIX: default resolves to config.json beside this script // FIX: auto load panel config from public scripts
    var ICON_PANEL_ONLY = true; // FIX: hide legacy picker UI and show JSON icon panel only

    var DEFAULT_PANEL_W = 300; // FIX: default panel width
    var DEFAULT_PANEL_H = 600; // FIX: default panel height

    function resetPanelSizeToDefault() { // FIX
        try {
            var panel = document.getElementById(PANEL_ID);
            if (!panel) return;
            panel.style.width = DEFAULT_PANEL_W + "px";
            panel.style.height = DEFAULT_PANEL_H + "px";
            panel.style.maxHeight = DEFAULT_PANEL_H + "px";
        } catch (e) { }
    }

    function applyPanelSizeFromMessage(msg) { // FIX
        try {
            var panel = document.getElementById(PANEL_ID);
            if (!panel) return;
            var pw = msg && (msg.panelWidth !== undefined && msg.panelWidth !== null) ? parseInt(String(msg.panelWidth), 10) : NaN;
            var ph = msg && (msg.panelHeight !== undefined && msg.panelHeight !== null) ? parseInt(String(msg.panelHeight), 10) : NaN;
            if (isNaN(pw) || pw <= 0) pw = DEFAULT_PANEL_W;
            if (isNaN(ph) || ph <= 0) ph = DEFAULT_PANEL_H;
            panel.style.width = pw + "px";
            panel.style.height = ph + "px";
            panel.style.maxHeight = ph + "px";
        } catch (e) { }
    }
    function computePanelConfigUrlSameFolder() { // FIX
        // Only use the GitHub config URL. Never resolve relative to the host site.
        return LT_CONFIG_URL; // FIX
    }

    var STORAGE_SEL_NAME = "LukeToolsSelectedClipName";
    var STORAGE_SEL_UUID = "LukeToolsSelectedClipUUID";
    var STORAGE_SEL_IDENTIFIER = "LukeToolsSelectedClipIdentifier";



    var RUNTIME_KEY = "LukeToolsRuntime";

    function ensureRuntime() {
        var rt = null;
        try { rt = window[RUNTIME_KEY] || null; } catch (e0) { rt = null; }

        if (rt && rt.ok) return rt;

        rt = {
            ok: true,
            version: "2.8.9",
            killed: false,
            kill: function () {
                try { this.killed = true; } catch (e1) { }
            }
        };

        try { window[RUNTIME_KEY] = rt; } catch (e2) { }
        return rt;
    }

    function isKilled() {
        try {
            var rt = window[RUNTIME_KEY] || null;
            return !!(rt && rt.killed);
        } catch (e) {
            return false;
        }
    }

    ensureRuntime();
    var BRAND_ICON_URL = LT_GITHUB_RAW_BASE + "scripts/Panel_SVG/LukeTools.svg"; // FIX

    function log() {
        try { console.log.apply(console, arguments); } catch (e) { }
    }

    function s(v) {
        if (v === null || v === undefined) return "";
        return String(v);
    }

    function escapeAttr(v) { // FIX
        try {
            return s(v)
                .replace(/&/g, "&amp;")
                .replace(/"/g, "&quot;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        } catch (e) {
            return s(v);
        }
    }


    function safeGet(obj, path) {
        var cur = obj;
        for (var i = 0; i < path.length; i += 1) {
            if (!cur) return null;
            cur = cur[path[i]];
        }
        return cur || null;
    }

    function nowMs() {
        try { return Date.now(); } catch (e) { return 0; }
    }

    function normalizeText(v) {
        return s(v).replace(/\s+/g, " ").trim();
    }

    function isFn(fn) {
        return typeof fn === "function";
    }

    function tryCall(obj, fnNames, args) {
        if (!obj) return { ok: false, reason: "obj missing" };
        for (var i = 0; i < fnNames.length; i += 1) {
            var name = fnNames[i];
            try {
                if (isFn(obj[name])) {
                    var out = obj[name].apply(obj, args || []);
                    return { ok: true, name: name, out: out };
                }
            } catch (e) {
                return { ok: false, reason: "call failed " + name, error: s(e && e.message ? e.message : e) };
            }
        }
        return { ok: false, reason: "no matching function" };
    }

    function getEditor() {
        try { if (window.wickEditor) return window.wickEditor; } catch (e1) { }
        try { if (window.WickEditor && window.WickEditor.editor) return window.WickEditor.editor; } catch (e2) { }
        try { if (window.editor) return window.editor; } catch (e3) { }
        try { if (window.app) return window.app; } catch (e4) { }
        return null;
    }

    function getProject() {
        var ed = getEditor();
        try { if (ed && ed.project) return ed.project; } catch (e1) { }
        return null;
    }

    function getSelectionApi(ed) {
        if (!ed) ed = getEditor();
        var p = null;
        try { p = ed && ed.project ? ed.project : null; } catch (e0) { p = null; }
        if (p && p.selection) return p.selection;
        if (ed && ed.selection) return ed.selection;
        return null;
    }

    function getSelectedObjects(ed) {
        var sel = getSelectionApi(ed);
        if (!sel) return [];
        try {
            if (isFn(sel.getSelectedObjects)) {
                var list = sel.getSelectedObjects();
                return list && list.length ? list : [];
            }
        } catch (e1) { }
        return [];
    }

    function getSelectedObject(ed) {
        var list = getSelectedObjects(ed);
        return list && list.length ? (list[0] || null) : null;
    }

    function getObjName(obj) {
        if (!obj) return "";
        if (typeof obj.name === "string") return obj.name.trim();
        if (isFn(obj.getName)) {
            try { return s(obj.getName()).trim(); } catch (e) { return ""; }
        }
        return "";
    }

    function getObjUUID(obj) {
        if (!obj) return "";
        if (typeof obj.uuid === "string") return obj.uuid.trim();
        if (typeof obj.UUID === "string") return obj.UUID.trim();
        if (typeof obj.id === "string") return obj.id.trim();
        return "";
    }

    function getObjIdentifier(obj) {
        if (!obj) return "";
        try { if (typeof obj._identifier === "string" && obj._identifier.trim()) return obj._identifier.trim(); } catch (e1) { }
        try { if (typeof obj.identifier === "string" && obj.identifier.trim()) return obj.identifier.trim(); } catch (e2) { }
        var nm = getObjName(obj);
        if (nm) return nm;
        var uu = getObjUUID(obj);
        if (uu) return uu;
        return "";
    }

    function markDirty(ed) {
        try {
            if (ed && ed.project && isFn(ed.project.markAsModified)) ed.project.markAsModified();
        } catch (e1) { }
        try {
            if (ed && ed.project) ed.project.unsavedChanges = true;
        } catch (e2) { }
        try {
            if (ed && ed.canvas && isFn(ed.canvas.render)) ed.canvas.render();
        } catch (e3) { }
        try {
            window.dispatchEvent(new Event("resize"));
        } catch (e4) { }
    }

    function findInputNearLabelText(labelLower) {
        var nodes = document.querySelectorAll("div, span, label, p, strong, b");
        for (var i = 0; i < nodes.length; i += 1) {
            var t = normalizeText(nodes[i].textContent).toLowerCase();
            if (t === labelLower) {
                var container = nodes[i].parentElement;
                if (!container) continue;

                var input1 = container.querySelector("input, textarea");
                if (input1) return input1;

                var sib = nodes[i].nextElementSibling;
                if (sib) {
                    var tag = (sib.tagName || "").toLowerCase();
                    if (tag === "input" || tag === "textarea") return sib;
                    var input2 = sib.querySelector && sib.querySelector("input, textarea");
                    if (input2) return input2;
                }

                var parent = container.parentElement;
                if (parent) {
                    var input3 = parent.querySelector("input, textarea");
                    if (input3) return input3;
                }
            }
        }
        return null;
    }

    function setInspectorNumber(labelLower, valueNumber) {
        var input = findInputNearLabelText(labelLower);
        if (!input) return { ok: false, reason: "inspector input not found for " + labelLower };

        try {
            input.focus();
            input.value = String(valueNumber);

            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));

            try { input.blur(); } catch (e0) { }

            try {
                input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
                input.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
            } catch (e1) { }

            return { ok: true };
        } catch (e) {
            return { ok: false, reason: "inspector write error", error: s(e && e.message ? e.message : e) };
        }
    }

    function tryRefreshSelectionWithoutDeselect(ed) {
        try {
            var sel = getSelectionApi(ed);
            if (!sel || !isFn(sel.getSelectedObjects)) return false;

            var list = sel.getSelectedObjects();
            if (!list || !list.length) return false;

            var selectFns = ["selectObjects", "setSelectedObjects", "select"];
            for (var j = 0; j < selectFns.length; j += 1) {
                var fn2 = sel[selectFns[j]];
                if (isFn(fn2)) {
                    try { fn2.call(sel, list); return true; } catch (e2) { }
                }
            }

            return false;
        } catch (e3) {
            return false;
        }
    }

    function tryEnsureKeyframe(ed) {
        try {
            if (!ed || !ed.project) return false;
            var p = ed.project;

            var frame = 1;
            try { if (typeof p.currentFrameNumber === "number") frame = p.currentFrameNumber; } catch (e0) { }

            var tl = p.timeline || p.activeTimeline || null;
            if (!tl) return false;

            var candidates = [
                "addKeyframe",
                "insertKeyframe",
                "createKeyframe",
                "makeKeyframe",
                "convertToKeyframe",
                "splitFrame",
                "splitFrames"
            ];

            for (var i = 0; i < candidates.length; i += 1) {
                var fn = tl[candidates[i]];
                if (isFn(fn)) {
                    try { fn.call(tl, frame); return true; } catch (e1) { }
                }
            }

            return false;
        } catch (e2) {
            return false;
        }
    }

    function selectionInfo() {
        var ed = getEditor();
        var obj = getSelectedObject(ed);
        if (!obj) return { ok: false, reason: "nothing selected" };

        return {
            ok: true,
            name: getObjName(obj),
            uuid: getObjUUID(obj),
            identifier: getObjIdentifier(obj)
        };
    }

    function walkProjectChildren(visitor) {
        var ed = getEditor();
        var project = ed ? ed.project : null;
        if (!project) return { ok: false, reason: "project missing" };

        var rootTimeline = project.timeline || project.activeTimeline || null;

        function visitTimeline(tl) {
            if (!tl || !tl.layers) return;
            for (var i = 0; i < tl.layers.length; i += 1) {
                var layer = tl.layers[i];
                if (!layer || !layer.frames) continue;
                for (var j = 0; j < layer.frames.length; j += 1) {
                    var fr = layer.frames[j];
                    if (!fr || !fr.children) continue;
                    for (var k = 0; k < fr.children.length; k += 1) {
                        var child = fr.children[k];
                        if (!child) continue;
                        try { visitor(child); } catch (e0) { }
                    }
                }
            }
        }

        function visitClipAsset(obj) {
            var ca = null;
            try { ca = obj && obj.clipAsset ? obj.clipAsset : null; } catch (e1) { ca = null; }
            if (!ca) return;
            var tl = null;
            try { tl = ca.timeline ? ca.timeline : null; } catch (e2) { tl = null; }
            if (!tl) return;
            visitTimeline(tl);
        }

        if (rootTimeline) {
            visitTimeline(rootTimeline);
        }

        var visited = 0;
        var visitedMax = 20000;

        walkSelectionAndClips();

        function walkSelectionAndClips() {
            var seen = {};
            function keyFor(o) {
                var uu = getObjUUID(o);
                var id = getObjIdentifier(o);
                return (uu ? uu : "nouu") + "|" + (id ? id : "noid");
            }

            function walkObj(o, depth) {
                if (!o) return;
                if (depth > 40) return;
                var key = keyFor(o);
                if (seen[key]) return;
                seen[key] = true;

                visited += 1;
                if (visited > visitedMax) return;

                try { visitor(o); } catch (e0) { }

                var tl = null;
                try { tl = (o.clipAsset && o.clipAsset.timeline) ? o.clipAsset.timeline : o.timeline; } catch (e1) { tl = null; }
                if (tl && tl.layers) {
                    for (var i = 0; i < tl.layers.length; i += 1) {
                        var layer = tl.layers[i];
                        if (!layer || !layer.frames) continue;
                        for (var j = 0; j < layer.frames.length; j += 1) {
                            var fr = layer.frames[j];
                            if (!fr || !fr.children) continue;
                            for (var k = 0; k < fr.children.length; k += 1) {
                                var child = fr.children[k];
                                if (!child) continue;
                                walkObj(child, depth + 1);
                            }
                        }
                    }
                }

                if (o.clipAsset) visitClipAsset(o);
            }

            var sel = getSelectedObjects(ed);
            for (var i = 0; i < sel.length; i += 1) walkObj(sel[i], 0);
        }

        return { ok: true, visited: visited };
    }

    function findObjectByUUID(uuid) {
        var want = s(uuid).trim();
        if (!want) return null;
        var found = null;

        walkProjectChildren(function (o) {
            if (found) return;
            var uu = getObjUUID(o);
            if (uu && uu === want) found = o;
        });

        return found;
    }

    function findObjectByIdentifier(identifier) {
        var want = s(identifier).trim();
        if (!want) return null;
        var found = null;

        walkProjectChildren(function (o) {
            if (found) return;
            var id = getObjIdentifier(o);
            if (id && id === want) found = o;
        });

        return found;
    }

    function findObjectByInfo(info) {
        if (!info) return null;
        var uu = s(info.uuid).trim();
        var id = s(info.identifier || info.name).trim();

        if (uu) {
            var byU = findObjectByUUID(uu);
            if (byU) return byU;
        }

        if (id) {
            var byI = findObjectByIdentifier(id);
            if (byI) return byI;
        }

        return null;
    }

    function selectObjects(ed, objs) {
        var sel = getSelectionApi(ed);
        if (!sel) return { ok: false, reason: "selection api missing" };

        var arr = objs && objs.length ? objs : [];
        var out = tryCall(sel, ["selectObjects", "setSelectedObjects", "select"], [arr]);
        if (out.ok) return { ok: true, via: out.name };
        return { ok: false, reason: "no selection setter found" };
    }

    function withTemporarySelection(targetObj, fn) {
        var ed = getEditor();
        if (!ed) return { ok: false, reason: "editor missing" };

        var sel = getSelectionApi(ed);
        if (!sel || !isFn(sel.getSelectedObjects)) return { ok: false, reason: "selection api missing" };

        var prev = [];
        try { prev = sel.getSelectedObjects() || []; } catch (e0) { prev = []; }

        var selRes = selectObjects(ed, [targetObj]);
        if (!selRes.ok) return { ok: false, reason: "could not select target", detail: selRes };

        var result = null;
        try { result = fn(); } catch (e1) { result = { ok: false, reason: "fn threw", error: s(e1 && e1.message ? e1.message : e1) }; }

        try { selectObjects(ed, prev); } catch (e2) { }

        return result;
    }

    function editPropertyOnSelection(prop, value, opts) {
        var ed = getEditor();
        var obj = getSelectedObject(ed);
        if (!ed || !obj) return { ok: false, reason: "nothing selected" };

        var opt = opts || {};
        if (opt.viaInspector && prop === "rotation") {
            var nextR = Number(value);
            if (!isFinite(nextR)) nextR = 0;

            var r = setInspectorNumber("rotation", nextR);
            if (!r.ok) return { ok: false, reason: "inspector failed", detail: r };

            if (opt.keyframe) tryEnsureKeyframe(ed);
            markDirty(ed);
            tryRefreshSelectionWithoutDeselect(ed);

            return { ok: true, mode: "inspector", prop: prop, value: nextR, uuid: getObjUUID(obj), identifier: getObjIdentifier(obj) };
        }

        try { obj[prop] = value; } catch (e1) { return { ok: false, reason: "write failed", error: s(e1 && e1.message ? e1.message : e1) }; }

        if (prop === "rotation" && opt.keyframe) tryEnsureKeyframe(ed);
        markDirty(ed);
        tryRefreshSelectionWithoutDeselect(ed);

        return { ok: true, mode: "direct", prop: prop, value: value, uuid: getObjUUID(obj), identifier: getObjIdentifier(obj) };
    }

    function editPropertyByInfo(info, prop, value, opts) {
        var target = findObjectByInfo(info);
        if (!target) return { ok: false, reason: "target not found", info: info };

        return withTemporarySelection(target, function () {
            return editPropertyOnSelection(prop, value, opts);
        });
    }

    function rotateSelection(deltaDegrees, opts) {
        var ed = getEditor();
        var obj = getSelectedObject(ed);
        if (!ed || !obj) return { ok: false, reason: "nothing selected" };

        var cur = 0;
        try { if (typeof obj.rotation === "number") cur = obj.rotation; } catch (e0) { cur = 0; }

        var next = cur + Number(deltaDegrees || 0);
        if (!isFinite(next)) next = cur;

        var opt = opts || {};
        if (opt.viaInspector) {
            var r = setInspectorNumber("rotation", next);
            if (!r.ok) return { ok: false, reason: "inspector failed", detail: r };

            if (opt.keyframe) tryEnsureKeyframe(ed);
            markDirty(ed);
            tryRefreshSelectionWithoutDeselect(ed);

            return { ok: true, mode: "inspector", value: next, uuid: getObjUUID(obj), identifier: getObjIdentifier(obj) };
        }

        try { obj.rotation = next; } catch (e1) { return { ok: false, reason: "write failed", error: s(e1 && e1.message ? e1.message : e1) }; }

        if (opt.keyframe) tryEnsureKeyframe(ed);
        markDirty(ed);
        tryRefreshSelectionWithoutDeselect(ed);

        return { ok: true, mode: "direct", value: next, uuid: getObjUUID(obj), identifier: getObjIdentifier(obj) };
    }

    function rotateByInfo(info, deltaDegrees, opts) {
        var target = findObjectByInfo(info);
        if (!target) return { ok: false, reason: "target not found", info: info };
        return withTemporarySelection(target, function () {
            return rotateSelection(deltaDegrees, opts);
        });
    }

    function getSelectedClipAsset() {
        var ed = getEditor();
        var obj = getSelectedObject(ed);
        if (!obj) return null;
        try { if (obj.clipAsset) return obj.clipAsset; } catch (e1) { }
        return null;
    }

    function getSelectedTimeline() {
        var ed = getEditor();
        var project = ed ? ed.project : null;
        if (!project) return null;
        try { if (project.timeline) return project.timeline; } catch (e1) { }
        try { if (project.activeTimeline) return project.activeTimeline; } catch (e2) { }
        return null;
    }

    function isScriptable(obj) {
        if (!obj) return false;
        if (isFn(obj.addScript)) return true;
        if (isFn(obj.getScript)) return true;
        if (obj.scripts && typeof obj.scripts === "object") return true;
        return false;
    }

    function resolveScriptTarget(obj) {
        var cur = obj;
        var guard = 0;
        while (cur && guard < 80) {
            if (isScriptable(cur)) return cur;
            try { if (cur.clipAsset && isScriptable(cur.clipAsset)) return cur.clipAsset; } catch (e1) { }
            cur = cur.parentClip || cur.parent || cur._parent || null;
            guard += 1;
        }
        return null;
    }

    function readDefaultScriptFromTarget(target) {
        if (!target) return "";
        try {
            if (isFn(target.getScript)) {
                var gs = target.getScript("default");
                if (typeof gs === "string") return gs;
                if (gs && typeof gs === "object") {
                    if (typeof gs.source === "string") return gs.source;
                    if (typeof gs.code === "string") return gs.code;
                    if (typeof gs.text === "string") return gs.text;
                    if (typeof gs.src === "string") return gs.src;
                }
            }
        } catch (e1) { }

        try {
            var sc = target.scripts;
            if (typeof sc === "string") return sc;
            if (sc && typeof sc === "object") {
                if (typeof sc.default === "string") return sc.default;
                if (sc.default && typeof sc.default === "object") {
                    if (typeof sc.default.source === "string") return sc.default.source;
                    if (typeof sc.default.code === "string") return sc.default.code;
                    if (typeof sc.default.text === "string") return sc.default.text;
                    if (typeof sc.default.src === "string") return sc.default.src;
                }
                if (Array.isArray(sc)) {
                    for (var i = 0; i < sc.length; i += 1) {
                        var item = sc[i];
                        if (!item) continue;
                        if (item.name === "default") {
                            if (typeof item.source === "string") return item.source;
                            if (typeof item.code === "string") return item.code;
                            if (typeof item.text === "string") return item.text;
                            if (typeof item.src === "string") return item.src;
                        }
                    }
                }
            }
        } catch (e2) { }

        try {
            if (typeof target.defaultScript === "string") return target.defaultScript;
            if (typeof target.script === "string") return target.script;
        } catch (e3) { }

        return "";
    }

    function writeDefaultScriptToTarget(target, source, ed) {
        var src = s(source);
        if (!target) return { ok: false, reason: "target missing" };

        try { if (isFn(target.removeScript)) target.removeScript("default"); } catch (e1) { }

        try {
            if (isFn(target.addScript)) {
                target.addScript("default", src);
                markDirty(ed);
                return { ok: true, mode: "addScript" };
            }
        } catch (e2) { return { ok: false, reason: "addScript failed", error: s(e2 && e2.message ? e2.message : e2) }; }

        try {
            if (target.scripts && typeof target.scripts === "object") {
                target.scripts.default = src;
                markDirty(ed);
                return { ok: true, mode: "scripts.default" };
            }
        } catch (e3) { return { ok: false, reason: "scripts.default failed", error: s(e3 && e3.message ? e3.message : e3) }; }

        try {
            target.defaultScript = src;
            markDirty(ed);
            return { ok: true, mode: "defaultScript" };
        } catch (e4) { }

        return { ok: false, reason: "no supported script api" };
    }

    function getDefaultScriptOnSelection() {
        var ed = getEditor();
        var obj = getSelectedObject(ed);
        if (!ed || !obj) return "";
        var target = resolveScriptTarget(obj);
        if (!target) return "";
        return s(readDefaultScriptFromTarget(target));
    }

    function setDefaultScriptOnSelection(source) {
        var ed = getEditor();
        var obj = getSelectedObject(ed);
        if (!ed || !obj) return { ok: false, reason: "nothing selected" };
        var target = resolveScriptTarget(obj);
        if (!target) return { ok: false, reason: "selection not scriptable" };
        return writeDefaultScriptToTarget(target, source, ed);
    }

    function getDefaultScriptByInfo(info) {
        var targetObj = findObjectByInfo(info);
        if (!targetObj) return "";
        var target = resolveScriptTarget(targetObj);
        if (!target) return "";
        return s(readDefaultScriptFromTarget(target));
    }

    function setDefaultScriptByInfo(info, source) {
        var targetObj = findObjectByInfo(info);
        if (!targetObj) return { ok: false, reason: "target not found", info: info };
        var ed = getEditor();
        var target = resolveScriptTarget(targetObj);
        if (!target) return { ok: false, reason: "target not scriptable" };
        return writeDefaultScriptToTarget(target, source, ed);
    }

    
    // FIX: Added Update Script support (read/write "update" script type)
    function readUpdateScriptFromTarget(target) {
        if (!target) return "";
        // 1) Preferred API: getScript("update")
        try {
            if (isFn(target.getScript)) {
                var gs = target.getScript("update");
                if (typeof gs === "string") return gs;
                if (gs && typeof gs === "object") {
                    if (typeof gs.source === "string") return gs.source;
                    if (typeof gs.code === "string") return gs.code;
                    if (typeof gs.text === "string") return gs.text;
                    if (typeof gs.src === "string") return gs.src;
                }
            }
        } catch (e1) { }

        // 2) Direct property access
        try {
            var sc = target.scripts;
            if (sc && typeof sc === "object") {
                if (typeof sc.update === "string") return sc.update;
                if (sc.update && typeof sc.update === "object") {
                    if (typeof sc.update.source === "string") return sc.update.source;
                    if (typeof sc.update.code === "string") return sc.update.code;
                    if (typeof sc.update.text === "string") return sc.update.text;
                    if (typeof sc.update.src === "string") return sc.update.src;
                }
                if (Array.isArray(sc)) {
                    for (var i = 0; i < sc.length; i += 1) {
                        var item = sc[i];
                        if (!item) continue;
                        if (item.name === "update") {
                            if (typeof item.source === "string") return item.source;
                            if (typeof item.code === "string") return item.code;
                            if (typeof item.text === "string") return item.text;
                            if (typeof item.src === "string") return item.src;
                        }
                    }
                }
            }
        } catch (e2) { }

        try {
            if (typeof target.updateScript === "string") return target.updateScript;
        } catch (e3) { }

        return "";
    }

    function writeUpdateScriptToTarget(target, source, ed) {
        var src = s(source);
        if (!target) return { ok: false, reason: "target missing" };

        // Remove existing update script if supported
        try { if (isFn(target.removeScript)) target.removeScript("update"); } catch (e0) { }

        // 1) Signature: addScript("update", source)
        try {
            if (isFn(target.addScript)) {
                try {
                    target.addScript("update", src);
                    markDirty(ed);
                    return { ok: true, mode: "addScript(name,src)" };
                } catch (e1) { }
                // 2) Signature: addScript({ name:"update", source:"..." })
                try {
                    target.addScript({ name: "update", source: src });
                    markDirty(ed);
                    return { ok: true, mode: "addScript(obj)" };
                } catch (e2) { }
                // 3) Signature: addScript({ name:"update", code:"..." })
                try {
                    target.addScript({ name: "update", code: src });
                    markDirty(ed);
                    return { ok: true, mode: "addScript(objCode)" };
                } catch (e3) { }
            }
        } catch (e4) { }

        // 4) Signature: setScript("update", src)
        try {
            if (isFn(target.setScript)) {
                target.setScript("update", src);
                markDirty(ed);
                return { ok: true, mode: "setScript(update)" };
            }
        } catch (e5) { }

        // 5) Property set
        try {
            if (target.scripts && typeof target.scripts === "object") {
                target.scripts.update = src;
                markDirty(ed);
                return { ok: true, mode: "scripts.update" };
            }
        } catch (e6) { }

        try {
            target.updateScript = src;
            markDirty(ed);
            return { ok: true, mode: "updateScript" };
        } catch (e7) { }

        return { ok: false, reason: "no supported update script api" };
    }

    function getUpdateScriptOnSelection() {
        var ed = getEditor();
        var obj = getSelectedObject(ed);
        if (!ed || !obj) return "";
        var target = resolveScriptTarget(obj);
        if (!target) return "";
        return s(readUpdateScriptFromTarget(target));
    }

    function setUpdateScriptOnSelection(source) {
        var ed = getEditor();
        var obj = getSelectedObject(ed);
        if (!ed || !obj) return { ok: false, reason: "nothing selected" };
        var target = resolveScriptTarget(obj);
        if (!target) return { ok: false, reason: "selection not scriptable" };
        return writeUpdateScriptToTarget(target, source, ed);
    }

    function getUpdateScriptByInfo(info) {
        var targetObj = findObjectByInfo(info);
        if (!targetObj) return "";
        var target = resolveScriptTarget(targetObj);
        if (!target) return "";
        return s(readUpdateScriptFromTarget(target));
    }

    function setUpdateScriptByInfo(info, source) {
        var targetObj = findObjectByInfo(info);
        if (!targetObj) return { ok: false, reason: "target not found", info: info };
        var ed = getEditor();
        var target = resolveScriptTarget(targetObj);
        if (!target) return { ok: false, reason: "target not scriptable" };
        return writeUpdateScriptToTarget(target, source, ed);
    }


function createClipFromSelection(name) {
        var ed = getEditor();
        var project = ed ? ed.project : null;
        if (!ed || !project) return { ok: false, reason: "editor or project missing" };

        var label = s(name).trim();
        if (!label) label = "Clip";

        // 1) Best: Wick engine signature (expects args object)
        try {
            if (project && typeof project.createClipFromSelection === "function") {
                project.createClipFromSelection({ identifier: label, type: "Clip" });
                markDirty(ed);
                return { ok: true, via: "project.createClipFromSelection(args)" };
            }
        } catch (e1) { }

        // 2) Editor wrappers (varies by build)
        try {
            if (ed && typeof ed.createClipFromSelection === "function") {
                // Some builds accept (identifier, toggleExisting=true)
                ed.createClipFromSelection(label, true);
                markDirty(ed);
                return { ok: true, via: "ed.createClipFromSelection" };
            }
        } catch (e2) { }

        // 3) Older names
        try {
            if (ed && typeof ed.convertSelectionToClip === "function") {
                ed.convertSelectionToClip(label);
                markDirty(ed);
                return { ok: true, via: "ed.convertSelectionToClip" };
            }
        } catch (e3) { }
        try {
            if (project && typeof project.convertSelectionToClip === "function") {
                project.convertSelectionToClip(label);
                markDirty(ed);
                return { ok: true, via: "project.convertSelectionToClip" };
            }
        } catch (e4) { }
        try {
            if (ed && typeof ed.groupSelectionIntoClip === "function") {
                ed.groupSelectionIntoClip(label);
                markDirty(ed);
                return { ok: true, via: "ed.groupSelectionIntoClip" };
            }
        } catch (e5) { }
        try {
            if (project && typeof project.groupSelectionIntoClip === "function") {
                project.groupSelectionIntoClip(label);
                markDirty(ed);
                return { ok: true, via: "project.groupSelectionIntoClip" };
            }
        } catch (e6) { }

        // 4) Action manager (React editor)
        try {
            if (ed && ed.actionManager && typeof ed.actionManager.doAction === "function") {
                // Newer builds
                try {
                    ed.actionManager.doAction(["createClipFromSelection"], [label]);
                    markDirty(ed);
                    return { ok: true, via: "actionManager.createClipFromSelection" };
                } catch (e7) { }
                // Older builds
                try {
                    ed.actionManager.doAction(["convertSelectionIntoClip"], [label]);
                    markDirty(ed);
                    return { ok: true, via: "actionManager.convertSelectionIntoClip" };
                } catch (e8) { }
            }
        } catch (e9) { }

        return { ok: false, reason: "no clip creation api found" };
    }

    function listKeys(obj, limit) {
        var out = [];
        try {
            var keys = Object.keys(obj || {});
            for (var i = 0; i < keys.length && i < (limit || 80); i += 1) out.push(keys[i]);
        } catch (e) { }
        return out;
    }

    function getEditorInfo() {
        var ed = getEditor();
        var project = getProject();
        var tl = getSelectedTimeline();
        return {
            ok: !!ed,
            hasProject: !!project,
            editorKeys: ed ? listKeys(ed, 60) : [],
            projectKeys: project ? listKeys(project, 60) : [],
            timelineKeys: tl ? listKeys(tl, 60) : []
        };
    }

    var Bridge = window.LukeToolsBridge || {};
    window.LukeToolsBridge = Bridge;

    Bridge.getEditor = getEditor;
        Bridge.clearSelectionNow = clearSelectionNow; // FIX
        Bridge.openGameSpritePanel = openGameSpritePanel; // FIX
        Bridge.closeGameSpritePanel = closeGameSpritePanel; // FIX

    Bridge.getProject = getProject;
    Bridge.getEditorInfo = getEditorInfo;

    Bridge.getSelectionInfo = selectionInfo;

    Bridge.captureSelectionNow = function () {
        try {
            var info = selectionInfo();
            if (!info || !info.ok) {
                try { localStorage.removeItem(STORAGE_SEL_NAME); } catch (e1) { }
                try { localStorage.removeItem(STORAGE_SEL_UUID); } catch (e2) { }
                try { localStorage.removeItem(STORAGE_SEL_IDENTIFIER); } catch (e3) { }
                return { ok: false, reason: "nothing selected" };
            }

            try { localStorage.setItem(STORAGE_SEL_NAME, s(info.name)); } catch (e4) { }
            try { localStorage.setItem(STORAGE_SEL_UUID, s(info.uuid)); } catch (e5) { }
            try { localStorage.setItem(STORAGE_SEL_IDENTIFIER, s(info.identifier)); } catch (e6) { }

            return { ok: true, name: s(info.name), uuid: s(info.uuid), identifier: s(info.identifier) };
        } catch (e7) {
            return { ok: false, reason: "capture failed", error: s(e7 && e7.message ? e7.message : e7) };
        }
    };

    Bridge.getSelectedClipName = function () {
        try { return s(localStorage.getItem(STORAGE_SEL_NAME)); } catch (e1) { return ""; }
    };

    Bridge.getSelectedClipUUID = function () {
        try { return s(localStorage.getItem(STORAGE_SEL_UUID)); } catch (e2) { return ""; }
    };

    Bridge.getSelectedClipIdentifier = function () {
        try { return s(localStorage.getItem(STORAGE_SEL_IDENTIFIER)); } catch (e3) { return ""; }
    };

    Bridge.getSelectedObject = function () { return getSelectedObject(getEditor()); };
    Bridge.getSelectedObjects = function () { return getSelectedObjects(getEditor()); };
    Bridge.findObjectByUUID = findObjectByUUID;
    Bridge.findObjectByIdentifier = findObjectByIdentifier;
    Bridge.findObjectByInfo = findObjectByInfo;
    Bridge.selectObjectByInfo = function (info) {
        var ed = getEditor();
        var o = findObjectByInfo(info);
        if (!o) return { ok: false, reason: "target not found", info: info };
        return selectObjects(ed, [o]);
    };

    Bridge.editPropertyOnSelection = editPropertyOnSelection;
    Bridge.editPropertyByInfo = editPropertyByInfo;

    Bridge.rotateSelection = rotateSelection;
    Bridge.rotateByInfo = rotateByInfo;

    Bridge.getSelectedClipAsset = getSelectedClipAsset;
    Bridge.getSelectedTimeline = getSelectedTimeline;

    Bridge.getDefaultScriptOnSelection = getDefaultScriptOnSelection;
    Bridge.setDefaultScriptOnSelection = function (source) {
        return setDefaultScriptOnSelection(source);
    };

    Bridge.getDefaultScriptByInfo = getDefaultScriptByInfo;
    Bridge.setDefaultScriptByInfo = setDefaultScriptByInfo;

    Bridge.getUpdateScriptOnSelection = getUpdateScriptOnSelection; // FIX
    Bridge.setUpdateScriptOnSelection = function (source) { // FIX
        return setUpdateScriptOnSelection(source); // FIX
    }; // FIX

    Bridge.getUpdateScriptByInfo = getUpdateScriptByInfo; // FIX
    Bridge.setUpdateScriptByInfo = setUpdateScriptByInfo; // FIX


    Bridge.createClipFromSelection = createClipFromSelection;


    // Added bridge functions for the full Luke Tools feature set

    function getObjXYLoose(obj) {
        if (!obj) return { ok: false, x: 0, y: 0 };
        try { if (typeof obj.x === "number" && typeof obj.y === "number") return { ok: true, x: obj.x, y: obj.y }; } catch (e1) { }
        try { if (obj.position && typeof obj.position.x === "number" && typeof obj.position.y === "number") return { ok: true, x: obj.position.x, y: obj.position.y }; } catch (e2) { }
        try { if (obj.translation && typeof obj.translation.x === "number" && typeof obj.translation.y === "number") return { ok: true, x: obj.translation.x, y: obj.translation.y }; } catch (e3) { }
        return { ok: false, x: 0, y: 0 };
    }

    function setObjXYLoose(obj, x, y) {
        if (!obj) return false;
        var nx = Number(x || 0);
        var ny = Number(y || 0);
        if (!isFinite(nx) || !isFinite(ny)) return false;

        var did = false;
        try {
            if (typeof obj.x === "number" && typeof obj.y === "number") {
                obj.x = nx;
                obj.y = ny;
                did = true;
            }
        } catch (e1) { }

        try {
            if (!did && obj.position && typeof obj.position.x === "number" && typeof obj.position.y === "number") {
                obj.position.x = nx;
                obj.position.y = ny;
                did = true;
            }
        } catch (e2) { }

        try {
            if (!did && obj.translation && typeof obj.translation.x === "number" && typeof obj.translation.y === "number") {
                obj.translation.x = nx;
                obj.translation.y = ny;
                did = true;
            }
        } catch (e3) { }

        return did;
    }

    function iterateClipAssetChildrenAllFrames(clipAsset, visitor) {
        if (!clipAsset || !clipAsset.timeline || !clipAsset.timeline.layers) return;
        var layers = clipAsset.timeline.layers;
        for (var i = 0; i < layers.length; i += 1) {
            var layer = layers[i];
            if (!layer || !layer.frames) continue;
            for (var j = 0; j < layer.frames.length; j += 1) {
                var fr = layer.frames[j];
                if (!fr || !fr.children) continue;
                for (var k = 0; k < fr.children.length; k += 1) {
                    var child = fr.children[k];
                    if (!child) continue;
                    visitor(child, fr, layer, clipAsset);
                }
            }
        }
    }

    function getApproxBoundsLoose(obj) {
        if (!obj) return null;

        try {
            if (obj.bounds && typeof obj.bounds.x === "number") {
                return { x: obj.bounds.x, y: obj.bounds.y, w: obj.bounds.width || 0, h: obj.bounds.height || 0 };
            }
        } catch (e1) { }

        try {
            if (typeof obj.getBounds === "function") {
                var b = obj.getBounds();
                if (b && typeof b.x === "number") {
                    return { x: b.x, y: b.y, w: b.width || 0, h: b.height || 0 };
                }
            }
        } catch (e2) { }

        try {
            if (typeof obj.getBoundingBox === "function") {
                var bb = obj.getBoundingBox();
                if (bb && typeof bb.x === "number") {
                    return { x: bb.x, y: bb.y, w: bb.width || 0, h: bb.height || 0 };
                }
            }
        } catch (e3) { }

        var xy = getObjXYLoose(obj);
        if (xy.ok) return { x: xy.x, y: xy.y, w: 0, h: 0 };
        return null;
    }

    function computePivotForClipAsset(clipAsset) {
        if (!clipAsset) return { ok: false, x: 0, y: 0, mode: "none" };

        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        var any = false;

        iterateClipAssetChildrenAllFrames(clipAsset, function (o) {
            var b = getApproxBoundsLoose(o);
            if (!b) return;
            any = true;
            var x1 = b.x;
            var y1 = b.y;
            var x2 = b.x + (b.w || 0);
            var y2 = b.y + (b.h || 0);
            if (x1 < minX) minX = x1;
            if (y1 < minY) minY = y1;
            if (x2 > maxX) maxX = x2;
            if (y2 > maxY) maxY = y2;
        });

        if (!any) return { ok: false, x: 0, y: 0, mode: "empty" };

        // A rig friendly pivot: left edge, vertical center
        var cx = minX;
        var cy = (minY + maxY) / 2;

        if (!isFinite(cx)) cx = 0;
        if (!isFinite(cy)) cy = 0;

        return { ok: true, x: cx, y: cy, mode: "bounds_left_center" };
    }

    function offsetClipAssetAllFrames(clipAsset, dx, dy) {
        if (!clipAsset) return { ok: false, reason: "no clipAsset" };
        var odx = Number(dx || 0);
        var ody = Number(dy || 0);
        if (!isFinite(odx) || !isFinite(ody)) return { ok: false, reason: "bad delta" };

        var moved = 0;
        iterateClipAssetChildrenAllFrames(clipAsset, function (o) {
            var xy = getObjXYLoose(o);
            if (!xy.ok) return;
            if (setObjXYLoose(o, xy.x + odx, xy.y + ody)) moved += 1;
        });

        return { ok: true, moved: moved, dx: odx, dy: ody };
    }

    function recenterClipInstanceToPivot(instance, pivotInfo) {
        if (!instance) return { ok: false, reason: "no instance" };
        var clipAsset = null;
        try { clipAsset = instance.clipAsset || null; } catch (e1) { clipAsset = null; }
        if (!clipAsset) return { ok: false, reason: "instance has no clipAsset" };

        var p = pivotInfo || computePivotForClipAsset(clipAsset);
        if (!p || !p.ok) return { ok: false, reason: "pivot not found" };

        var inner = offsetClipAssetAllFrames(clipAsset, -p.x, -p.y);

        var ixy = getObjXYLoose(instance);
        if (ixy.ok) setObjXYLoose(instance, ixy.x + p.x, ixy.y + p.y);

        return { ok: true, pivot: p, inner: inner };
    }

    function findFirstByIdentifierInClipAsset(clipAsset, wantIdentifier) {
        var want = s(wantIdentifier).trim();
        if (!want) return null;
        var found = null;

        iterateClipAssetChildrenAllFrames(clipAsset, function (o) {
            if (found) return;
            var id = "";
            try { id = getObjIdentifier(o); } catch (e1) { id = ""; }
            if (id && id === want) found = o;
        });

        return found;
    }

    function resetLukeTools() {
        try {
            var rt = ensureRuntime();
            if (rt && typeof rt.kill === "function") rt.kill();
            else if (rt) rt.killed = true;
        } catch (e0) { }

        // Remove UI
        var ids = [PANEL_ID, LAUNCHER_ID, OVERLAY_ID];
        for (var i = 0; i < ids.length; i += 1) {
            var el = document.getElementById(ids[i]);
            if (el && el.parentNode) {
                try { el.parentNode.removeChild(el); } catch (e1) { }
            }
        }

        // Clear LukeTools localStorage keys
        try {
            var killKeys = [];
            for (var j = 0; j < localStorage.length; j += 1) {
                var k = localStorage.key(j);
                if (!k) continue;
                if (String(k).indexOf("LukeTools") === 0) killKeys.push(k);
            }
            for (var m = 0; m < killKeys.length; m += 1) {
                try { localStorage.removeItem(killKeys[m]); } catch (e2) { }
            }
        } catch (e3) { }

        // Clear guard flags that might block reinit
        try {
            for (var n = 0; n < 40; n += 1) {
                var g = "LukeToolsLocalPanelBridgeLoaded_" + String(n);
                try { delete window[g]; } catch (e4) { }
            }
        } catch (e5) { }

        // Remove bridge references
        try { delete window.LukeToolsBridge; } catch (e6) { }
        try { delete window[RUNTIME_KEY]; } catch (e7) { }

        return { ok: true };
    }

    Bridge.closeFullscreenTool = function () {
        closeFullscreen();
        return { ok: true };
    };

    Bridge.openToolFromUrl = function (url, opts) {
        return openToolFromUrl(url, opts);
    };

    Bridge.openToolFromUrlInPanel = function (url) {
        return openToolFromUrl(url, { target: "panel" });
    };

    Bridge.openToolFromUrlFullscreen = function (url) {
        return openToolFromUrl(url, { target: "fullscreen" });
    };

    Bridge.resetLukeTools = function () {
        return resetLukeTools();
    };

    // Repair broken scripts across the whole project (most importantly "default")
    // This is a recovery tool for when a clip/frame script gets polluted with invalid JS.
    Bridge.repairProjectDefaultScripts = function (opts) {
        opts = opts || {};

        var onlyDefault = (opts.onlyDefault !== false); // default true
        var clearBroken = (opts.clearBroken !== false); // default true
        var reportOnly = !!opts.reportOnly; // default false
        var doBackup = (opts.backup !== false); // default true
        var backupPrefix = String(opts.backupPrefix || "LukeToolsBrokenScriptBackup");
        var maxOwners = (typeof opts.maxOwners === "number") ? opts.maxOwners : 200000;

        var ed = null;
        var project = null;

        try { ed = Bridge.getEditor(); } catch (e1) { ed = null; }
        try { project = Bridge.getProject(); } catch (e2) { project = null; }

        if (!project) {
            return { ok: false, reason: "No project available" };
        }

        function z(n) { return (n < 10 ? "0" : "") + String(n); }
        function stamp() {
            try {
                var d = new Date();
                return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate()) + "_" + z(d.getHours()) + "-" + z(d.getMinutes()) + "-" + z(d.getSeconds());
            } catch (e) {
                return String(Date.now());
            }
        }

        function ownerKey(owner, idx) {
            try {
                if (owner && (owner.uuid || owner.id)) return String(owner.uuid || owner.id);
            } catch (e) { }
            try {
                return String((owner && owner.classname) ? owner.classname : "obj") + ":" +
                    String((owner && (owner.identifier || owner.name)) ? (owner.identifier || owner.name) : "") + ":" +
                    String(idx);
            } catch (e2) { }
            return "obj:" + String(idx);
        }

        function safeGetScripts(owner) {
            try {
                if (owner && owner.scripts && Array.isArray(owner.scripts)) return owner.scripts;
            } catch (e1) { }
            try {
                if (owner && typeof owner.getScripts === "function") return owner.getScripts();
            } catch (e2) { }
            return null;
        }

        function tryCompile(src) {
            try {
                /* eslint-disable no-new-func */
                new Function(String(src || ""));
                /* eslint-enable no-new-func */
                return { ok: true };
            } catch (err) {
                return { ok: false, err: err };
            }
        }

        function backupScript(owner, scriptName, src) {
            if (!doBackup) return false;
            try {
                var key = backupPrefix + "_" + stamp() + "_" + ownerKey(owner, 0) + "_" + String(scriptName || "default");
                localStorage.setItem(key, String(src || ""));
                return true;
            } catch (e) {
                return false;
            }
        }

        function clearScript(scriptObj) {
            try {
                scriptObj.src = "";
                return true;
            } catch (e) {
                return false;
            }
        }

        // --- Collect candidates (DEEP) ---
        var owners = [];
        try { owners.push(project); } catch (e0) { }
        try { if (project.root) owners.push(project.root); } catch (e1) { }

        try {
            if (typeof project.getAllFrames === "function") {
                owners = owners.concat(project.getAllFrames());
            }
        } catch (e2) { }

        try {
            if (typeof project.getChildrenRecursive === "function") {
                var kids = project.getChildrenRecursive(0, true);
                if (kids && kids.length) owners = owners.concat(kids);
            }
        } catch (e3) { }

        // Deduplicate
        var seen = {};
        var uniq = [];
        for (var i = 0; i < owners.length && uniq.length < maxOwners; i++) {
            var o = owners[i];
            if (!o) continue;
            var k = ownerKey(o, i);
            if (seen[k]) continue;
            seen[k] = true;
            uniq.push(o);
        }
        owners = uniq;

        var result = {
            ok: true,
            owners: owners.length,
            scriptsChecked: 0,
            badScripts: 0,
            cleared: 0,
            backedUp: 0,
            details: []
        };

        // --- Scan + fix ---
        for (var oi = 0; oi < owners.length; oi++) {
            var owner = owners[oi];
            var scripts = safeGetScripts(owner);
            if (!scripts || !scripts.length) continue;

            for (var si = 0; si < scripts.length; si++) {
                var sc = scripts[si];
                if (!sc) continue;
                if (onlyDefault && sc.name !== "default") continue;

                var src = "";
                try { src = String(sc.src || ""); } catch (eS) { src = ""; }
                if (!src.trim()) continue;

                result.scriptsChecked++;

                var compiled = tryCompile(src);
                if (compiled.ok) continue;

                result.badScripts++;

                var ownerName = "";
                try { ownerName = String(owner.identifier || owner.name || owner.classname || ""); } catch (eN) { ownerName = ""; }

                var info = {
                    owner: ownerName,
                    ownerUUID: (owner && (owner.uuid || owner.id)) ? String(owner.uuid || owner.id) : "",
                    script: String(sc.name || "default"),
                    message: (compiled.err && compiled.err.message) ? String(compiled.err.message) : "Unknown error"
                };

                if (clearBroken && !reportOnly) {
                    if (backupScript(owner, sc.name, src)) result.backedUp++;
                    if (clearScript(sc)) result.cleared++;
                    info.action = "cleared";
                } else {
                    info.action = "reported";
                }

                result.details.push(info);
            }
        }

        // Refresh editor UI
        try { if (ed && typeof ed.projectDidChange === "function") ed.projectDidChange(); } catch (e4) { }
        try { if (ed && typeof ed.syncInterfaces === "function") ed.syncInterfaces(); } catch (e5) { }
        try { if (ed && typeof ed.updateUI === "function") ed.updateUI(); } catch (e6) { }
        try { if (ed && typeof ed.refresh === "function") ed.refresh(); } catch (e7) { }

        return result;
    };


    Bridge.recenterClipContentsOnSelection = function () {
        var ed = getEditor();
        var obj = getSelectedObject(ed);
        if (!obj) return { ok: false, reason: "nothing selected" };

        var r = recenterClipInstanceToPivot(obj, null);
        if (!r.ok) return r;

        markDirty(ed);
        tryRefreshSelectionWithoutDeselect(ed);

        return r;
    };

    Bridge.arrangeArmRigOnSelection = function () {
        var ed = getEditor();
        var selected = getSelectedObject(ed);
        if (!selected) return { ok: false, reason: "nothing selected" };

        var arm = null;
        var selId = getObjIdentifier(selected);
        if (selId === "Arm_R") arm = selected;

        if (!arm) {
            try {
                if (selected.clipAsset) arm = findFirstByIdentifierInClipAsset(selected.clipAsset, "Arm_R");
            } catch (e1) { }
        }

        if (!arm) {
            arm = findObjectByIdentifier("Arm_R");
            if (!arm) arm = findObjectByInfo({ identifier: "Arm_R" });
        }

        if (!arm) return { ok: false, reason: "Arm_R not found" };

        var shoulder = null;
        var elbow = null;

        try {
            if (arm.clipAsset) shoulder = findFirstByIdentifierInClipAsset(arm.clipAsset, "Shoulder_R");
            if (shoulder && shoulder.clipAsset) elbow = findFirstByIdentifierInClipAsset(shoulder.clipAsset, "Elbow_R");
        } catch (e2) { }

        var out = { ok: true, steps: [] };

        if (elbow) out.steps.push({ name: "Elbow_R", result: recenterClipInstanceToPivot(elbow, null) });
        if (shoulder) out.steps.push({ name: "Shoulder_R", result: recenterClipInstanceToPivot(shoulder, null) });
        out.steps.push({ name: "Arm_R", result: recenterClipInstanceToPivot(arm, null) });

        markDirty(ed);
        tryRefreshSelectionWithoutDeselect(ed);

        return out;
    };

    Bridge._debug = {
        walkProjectChildren: walkProjectChildren,
        listKeys: listKeys,
        nowMs: nowMs
    };

    function toolCssAndBridgeInject() {
        var css =
            "<style>" +
            "html,body{margin:0;padding:0;background:transparent;font-family:Arial, sans serif;}" +
            "body{color:#eaeaea;}" +
            "</style>";

        var script =
            "<script>" +
            "try{window.LukeToolsBridge=parent.LukeToolsBridge;}catch(e1){}try{window.LukeToolsRuntime=parent.LukeToolsRuntime;}catch(e2){}" +
            "(function(){function h(){try{var d=document.documentElement;var b=document.body;" +
            "var v=Math.max(d?d.scrollHeight:0,b?b.scrollHeight:0,d?d.offsetHeight:0,b?b.offsetHeight:0);" +
            "parent.postMessage({type:'LukeToolsToolHeight',h:v},'*');}catch(e){}}" +
            "window.addEventListener('load',h);" +
            "try{new ResizeObserver(h).observe(document.documentElement);}catch(e){}" +
            "setInterval(h,300);" +
"})();" +
            "</script>";

        return css + script;
    }

    function ensureHtmlDocument(htmlText) {
        var txt = s(htmlText);
        var inject = toolCssAndBridgeInject();

        if (/<html[\s>]/i.test(txt)) {
            if (/<head[\s>]/i.test(txt)) {
                txt = txt.replace(/<head[^>]*>/i, function (m) {
                    return m + "<meta charset=\"utf-8\">" + inject;
                });
            } else {
                txt = txt.replace(/<html[^>]*>/i, function (m) {
                    return m + "<head><meta charset=\"utf-8\">" + inject + "</head>";
                });
            }
            return txt;
        }

        return (
            "<!doctype html>" +
            "<html>" +
            "<head>" +
            "<meta charset=\"utf-8\">" +
            inject +
            "</head>" +
            "<body>" +
            txt +
            "</body>" +
            "</html>"
        );
    }

    function __LT_wrapJsToolAsHtml(jsText) { // FIX: sandbox import JS runner
        var js = s(jsText || "");
        // Prevent accidental closing of the script tag
        try { js = js.replace(/<\/script/gi, "<\\/script"); } catch (e) { }
        return "<!doctype html><html><head><meta charset=\"utf-8\"></head><body style=\"margin:0;background:#111;color:#eee;font-family:Arial,sans-serif\">"
            + "<script>\n" + js + "\n<\/script></body></html>";
    }



    function getDockNode() { // FIX: dock launcher inside wick-canvas-container to remove gap and prevent drifting
        try {
            var c = document.getElementById("wick-canvas-container"); // FIX
            if (c) return c; // FIX
        } catch (e0) { }
        try { return document.body; } catch (e1) { return null; }
    }

    function __LT_getOutlinerToggleButton() { // FIX: locate the Outliner toggle so Luke Tools can stack directly under it
        // FIX: Prefer id based lookup first to avoid matching the Luke Tools launcher which shares the same class names
        try {
            var byId = document.getElementById("action-button-tooltip-outliner-toggle"); // FIX
            if (byId && String(byId.tagName || "").toLowerCase() === "button" && byId.getBoundingClientRect) { // FIX
                var ir = byId.getBoundingClientRect(); // FIX
                if (ir && ir.width > 0 && ir.height > 0) return byId; // FIX
            }
        } catch (e0) { }

        // Prefer the actual Outliner expand button in the canvas UI, but never return the Luke Tools launcher
        try {
            var exactAll = document.querySelectorAll("button.wick-button.action-button-tool.action-button.outliner-expand-button"); // FIX
            for (var ei = 0; ei < exactAll.length; ei++) { // FIX
                var exact = exactAll[ei]; // FIX
                if (!exact) continue; // FIX
                if (exact.id && exact.id === LAUNCHER_ID) continue; // FIX
                if (exact.getAttribute && exact.getAttribute("data-lt-launcher") === "1") continue; // FIX
                if (exact.getBoundingClientRect) { // FIX
                    var er = exact.getBoundingClientRect(); // FIX
                    if (er && er.width > 0 && er.height > 0) return exact; // FIX
                }
            }
        } catch (e00) { }

        // Fallback: scan candidates and pick the first visible button
        try {
            var buttons = document.querySelectorAll("button.outliner-expand-button"); // FIX
            for (var i = 0; i < buttons.length; i++) {
                var b = buttons[i];
                if (!b) continue;
                if (b.id && b.id === LAUNCHER_ID) continue;
                if (b.getAttribute && b.getAttribute("data-lt-launcher") === "1") continue; // FIX
                if (!b.getBoundingClientRect) continue;
                var r = b.getBoundingClientRect();
                if (!r || r.width <= 0 || r.height <= 0) continue; // FIX: skip hidden
                // Prefer the one that actually contains the outliner icon
                try {
                    var img = b.querySelector && b.querySelector("img.outliner-toggle-icon");
                    if (img) return b;
                } catch (e2) { }
                return b; // FIX: visible candidate
            }
        } catch (e) { }
        return null;
    }

    function __LT_getVisibleSplashZIndex() { // FIX: keep LT toggle behind any splash or modal overlay when present
        try {
            var candidates = [];
            var overlayCandidates = [];

            // ---- Splash candidates (existing behavior) ----
            try { var a = document.getElementById("splash-screen"); if (a) candidates.push(a); } catch (e0) { }
            try { var b = document.getElementById("wick-splash-screen"); if (b) candidates.push(b); } catch (e1) { }
            try { var c = document.getElementById("wick-editor-splash"); if (c) candidates.push(c); } catch (e2) { }

            try {
                var list = document.querySelectorAll("[class*='splash'], [id*='splash']");
                for (var i = 0; i < list.length; i++) candidates.push(list[i]);
            } catch (e3) { }

            // ---- Modal and overlay candidates (new) ----
            try {
                var ol = document.querySelectorAll(
                    ".ReactModal__Overlay, [class*='modal-backdrop'], [class*='modal-overlay'], [class*='overlay'], [id*='overlay'], [class*='backdrop']"
                );
                for (var j = 0; j < ol.length; j++) overlayCandidates.push(ol[j]);
            } catch (e4) { }

            try {
                var dlg = document.querySelectorAll(
                    ".ReactModal__Content, [role='dialog'], [class*='modal'], [class*='dialog']"
                );
                for (var k = 0; k < dlg.length; k++) candidates.push(dlg[k]);
            } catch (e5) { }

            function isVisibleBlocking(el) {
                try {
                    if (!el) return false;
                    // Never treat the LT launcher as a blocker
                    try {
                        if (el.getAttribute && el.getAttribute("data-lt-launcher") === "1") return false;
                    } catch (eA) { }

                    if (el === document.body || el === document.documentElement) return false;

                    var cs = getComputedStyle(el);
                    if (!cs) return false;
                    if (cs.display === "none" || cs.visibility === "hidden") return false;
                    if (parseFloat(cs.opacity || "1") === 0) return false;

                    // Must be positioned overlay-like, or be a ReactModal overlay/content
                    var pos = String(cs.position || "");
                    var looksOverlay = (pos === "fixed" || pos === "absolute");
                    var cls = "";
                    try { cls = (el.className && String(el.className)) ? String(el.className) : ""; } catch (eB) { cls = ""; }
                    if (!looksOverlay && cls.indexOf("ReactModal") === -1) return false;

                    // Must have real size (avoid tiny icons)
                    var r = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
                    if (!r) return false;
                    if (r.width < 50 || r.height < 50) return false;

                    // If it's an overlay/backdrop, it should cover a big portion of the viewport
                    if (cls.indexOf("Overlay") !== -1 || cls.indexOf("backdrop") !== -1 || cls.indexOf("overlay") !== -1) {
                        if (r.width < (window.innerWidth * 0.4) || r.height < (window.innerHeight * 0.4)) return false;
                    }

                    return true;
                } catch (e) {
                    return false;
                }
            }

            function bestZ(list) {
                var best = null;
                for (var i = 0; i < list.length; i++) {
                    var el = list[i];
                    if (!isVisibleBlocking(el)) continue;
                    try {
                        var cs = getComputedStyle(el);
                        var z = parseInt(cs && cs.zIndex ? cs.zIndex : "", 10);
                        if (!isFinite(z)) continue;
                        if (best === null || z > best) best = z;
                    } catch (e) { }
                }
                return best;
            }

            var bestOverlay = bestZ(overlayCandidates);
            var bestAny = bestZ(candidates);

            // Prefer overlay/backdrop z-index when available so we go under the greyed-out layer
            if (bestOverlay !== null && bestOverlay !== undefined) return bestOverlay;
            return bestAny;
        } catch (e) {
            return null;
        }
    }



    function __LT_isBlockingOverlayVisible() { // FIX: detect greyed-out modal overlay even if z-index is 'auto'
        try {
            var ol = document.querySelectorAll(
                ".ReactModal__Overlay, [class*='modal-backdrop'], [class*='modal-overlay'], [class*='overlay'], [id*='overlay'], [class*='backdrop']"
            );
            for (var i = 0; i < ol.length; i++) {
                var el = ol[i];
                if (!el) continue;
                try {
                    if (el.getAttribute && el.getAttribute("data-lt-launcher") === "1") continue;
                } catch (eA) { }
                var cs = getComputedStyle(el);
                if (!cs) continue;
                if (cs.display === "none" || cs.visibility === "hidden") continue;
                if (parseFloat(cs.opacity || "1") === 0) continue;
                var r = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
                if (!r) continue;
                if (r.width < (window.innerWidth * 0.4) || r.height < (window.innerHeight * 0.4)) continue;
                var pos = String(cs.position || "");
                if (pos !== "fixed" && pos !== "absolute") continue;
                return true;
            }
        } catch (e) { }
        return false;
    }



    // --- NEW: launcher layout from JSON (same folder as script) ---
    var LAUNCHER_CONFIG_FILENAME = "launcher-config.json";
    var LAUNCHER_CONFIG_LS_KEY = "LukeToolsLauncherLayoutJSON";

    function computeFileUrlSameFolder(filename) {
        try {
            var cs = document.currentScript;
            if (cs && cs.src) return new URL(filename, cs.src).href;
        } catch (e1) { }

        try {
            var scripts = document.getElementsByTagName("script");
            var bestSrc = "";
            for (var i = 0; i < scripts.length; i += 1) {
                var src = "";
                try { src = scripts[i] && scripts[i].src ? String(scripts[i].src) : ""; } catch (e2) { src = ""; }
                if (!src) continue;
                if (src.indexOf("BridgeTool") !== -1) { bestSrc = src; break; }
                if (!bestSrc && src.indexOf("LukeTools") !== -1) bestSrc = src;
            }
            if (bestSrc) return new URL(filename, bestSrc).href;
        } catch (e3) { }

        return LT_GITHUB_RAW_BASE + filename.replace(/^\//, ""); // FIX
    }

    function loadLauncherLayoutConfig() { // FIX
        // Never fetch launcher config from the host site. Only use cached JSON if present.
        return new Promise(function (resolve) {
            try {
                var ls = localStorage.getItem(LAUNCHER_CONFIG_LS_KEY);
                if (ls) {
                    try {
                        var j = JSON.parse(ls);
                        window.__LT_launcherLayoutCfg = j;
                        return resolve(j);
                    } catch (e1) { }
                }
            } catch (e2) { }
            resolve(null); // FIX
        });
    }

    // computeFileUrlSameFolder remains for other callers, but loadLauncherLayoutConfig will not use it. // FIX

function applyLauncherLayout(btn, cfg) {
        cfg = cfg || window.__LT_launcherLayoutCfg || {};
        try {
            var absLeft = (typeof cfg.left === "number") ? cfg.left : null;
            var absRight = (typeof cfg.right === "number") ? cfg.right : null;
            var absTop = (typeof cfg.top === "number") ? cfg.top : null;

            if (absLeft !== null || absRight !== null) {
                if (absLeft !== null) {
                    btn.style.left = Math.max(0, Math.round(absLeft)) + "px";
                    btn.style.right = "auto";
                } else {
                    btn.style.right = Math.max(0, Math.round(absRight)) + "px";
                    btn.style.left = "auto";
                }
                if (absTop !== null) btn.style.top = Math.max(0, Math.round(absTop)) + "px";
                return;
            }

            var align = (cfg.alignToOutliner === undefined) ? true : !!cfg.alignToOutliner;
            if (!align) {
                btn.style.left = (typeof cfg.offsetX === "number" ? cfg.offsetX : 8) + "px";
                btn.style.top = (typeof cfg.offsetY === "number" ? cfg.offsetY : 8) + "px";
                return;
            }

            try {
                var outBtn = __LT_getOutlinerToggleButton();
                if (!outBtn) {
                    btn.style.left = (typeof cfg.offsetX === "number" ? cfg.offsetX : 8) + "px";
                    btn.style.top = (typeof cfg.offsetY === "number" ? cfg.offsetY : 8) + "px";
                    return;
                }

                var r = outBtn.getBoundingClientRect();
                if (!r) {
                    btn.style.left = (typeof cfg.offsetX === "number" ? cfg.offsetX : 8) + "px";
                    btn.style.top = (typeof cfg.offsetY === "number" ? cfg.offsetY : 8) + "px";
                    return;
                }

                var anchor = String(cfg.anchor || "left").toLowerCase();
                var offsetX = Number(cfg.offsetX || 0);
                var offsetY = Number(cfg.offsetY || 6);

                // FIX: compute positioning relative to wick-canvas-container when docked
                var dock = getDockNode(); // FIX
                var dockRect = null; // FIX
                try { if (dock && dock.getBoundingClientRect) dockRect = dock.getBoundingClientRect(); } catch (eDock) { dockRect = null; } // FIX
                var docked = !!(dock && dockRect && dock.id === "wick-canvas-container" && dock.contains(outBtn)); // FIX: only use container relative coords when the anchor is inside the container

                var left = 0; // FIX
                var top = 0;  // FIX

                if (docked) { // FIX
                    left = Math.max(0, Math.round((r.left - dockRect.left) + (anchor === "left" ? 0 : (r.width - (btn.offsetWidth || 24))) + offsetX)); // FIX
                    top = Math.max(0, Math.round((r.top - dockRect.top) + r.height + offsetY)); // FIX
                    btn.style.position = "absolute"; // FIX
                } else {
                    left = Math.max(0, Math.round(r.left + (anchor === "left" ? 0 : (r.width - (btn.offsetWidth || 24))) + offsetX));
                    top = Math.max(0, Math.round(r.top + r.height + offsetY));
                    btn.style.position = "fixed"; // FIX
                }
// FIX: clamp launcher inside wick-canvas-container so it never goes offscreen
            if (docked) { // FIX
                try {
                    var bw = btn.offsetWidth || 36;
                    var bh = btn.offsetHeight || 36;
                    var maxLeft = Math.max(0, Math.round(dockRect.width - bw));
                    var maxTop = Math.max(0, Math.round(dockRect.height - bh));
                    if (left > maxLeft) left = maxLeft;
                    if (top > maxTop) top = maxTop;
                    if (left < 0) left = 0;
                    if (top < 0) top = 0;
                } catch (eClamp) { }
            }
            btn.style.left = left + "px";
                btn.style.right = "auto";
                btn.style.top = top + "px";
            } catch (e) {
                // ignore and use defaults
            }
        } catch (e) { }
    }

    // --- REPLACED: __LT_syncLauncherPosition to consult config offsets if present ---
    function __LT_syncLauncherPosition(btn) { // FIX: keep launcher aligned under Outliner toggle with no gap
        try {
            var cfg = window.__LT_launcherLayoutCfg || {};
            var outBtn = __LT_getOutlinerToggleButton();
            if (!outBtn) {
                if (cfg && (typeof cfg.left === "number" || typeof cfg.top === "number")) {
                    applyLauncherLayout(btn, cfg);
                }
                return;
            }

            var r = outBtn.getBoundingClientRect();
            if (!r) return;
            try {
                var splashZ = __LT_getVisibleSplashZIndex(); // FIX
                var overlayVisible = __LT_isBlockingOverlayVisible(); // FIX
                if (overlayVisible && (splashZ === null || splashZ === undefined)) { // FIX: overlay present but no numeric z-index found
                    btn.style.zIndex = "0"; // FIX: keep it under overlay that uses z-index 'auto'
                    btn.style.pointerEvents = "none"; // FIX
                    btn.style.opacity = "1"; // FIX
                } else if (splashZ !== null && splashZ !== undefined) {
                    var zBelow = splashZ - 1;
                    if (zBelow < 1) zBelow = 1;
                    btn.style.zIndex = String(zBelow);
                    btn.style.pointerEvents = overlayVisible ? "none" : "auto"; // FIX
                    btn.style.opacity = "1"; // FIX
                } else {
                    btn.style.zIndex = "2000"; // FIX: normal LT toggle z-index below panels, above canvas, but not extreme
                    btn.style.pointerEvents = "auto"; // FIX
                    btn.style.opacity = "1"; // FIX
                }
// FIX: removed stray brace that broke try/catch
            } catch (eZ) { }


            var dock = getDockNode(); // FIX
            var dockRect = null; // FIX
            try { if (dock && dock.getBoundingClientRect) dockRect = dock.getBoundingClientRect(); } catch (e0) { dockRect = null; } // FIX
            var docked = !!(dock && dockRect && dock.id === "wick-canvas-container" && dock.contains(outBtn)); // FIX: only use container relative coords when the anchor is inside the container

            var offX = (typeof cfg.offsetX === "number") ? cfg.offsetX : 0;
            var offY = (typeof cfg.offsetY === "number") ? cfg.offsetY : 0; // FIX: default no gap

            var left = 0;
            var top = 0;

            if (docked) { // FIX
                // Position relative to wick-canvas-container
                left = Math.max(0, Math.round((r.left - dockRect.left) + offX)); // FIX
                top = Math.max(0, Math.round((r.top - dockRect.top) + r.height + offY)); // FIX
                btn.style.position = "absolute"; // FIX
            } else {
                // Fallback to viewport positioning
                left = Math.max(0, Math.round(r.left + offX));
                top = Math.max(0, Math.round(r.top + r.height + offY));
                btn.style.position = "fixed"; // FIX
            }

            if (cfg && String(cfg.anchor || "left").toLowerCase() === "right") {
                if (docked) { // FIX
                    left = Math.max(0, Math.round((r.left - dockRect.left) + r.width - (btn.offsetWidth || 36) + offX)); // FIX
                } else {
                    left = Math.max(0, Math.round(r.left + r.width - (btn.offsetWidth || 36) + offX));
                }
            }

            btn.style.left = left + "px";
            btn.style.top = top + "px";
        } catch (e) { }
    }


    function __LT_syncGameSpriteLauncherPosition(btn) { // FIX
        try {
            var main = document.getElementById(LAUNCHER_ID);
            if (!main || !btn) return;

            var r = main.getBoundingClientRect();
            if (!r) return;

            // FIX: compute the gap above LT (Outliner -> LT) by sampling the element directly above LT on screen
            var gap = 6; // FIX fallback
            try {
                var cx = Math.round(r.left + (r.width / 2));
                var sampleY = Math.round(r.top - 2);
                var el = null;
                try { el = document.elementFromPoint(cx, sampleY); } catch (eP0) { el = null; }

                // walk up to a clickable-ish container
                var steps = 0;
                while (el && steps < 6) {
                    if (el === main) { el = null; break; }
                    if (el.tagName === "BUTTON") break;
                    var cs = null;
                    try { cs = window.getComputedStyle(el); } catch (eP1) { cs = null; }
                    if (cs && cs.cursor === "pointer") break;
                    el = el.parentElement;
                    steps += 1;
                }

                if (el) {
                    var er = el.getBoundingClientRect();
                    if (er && er.height > 0 && er.width > 0 && er.bottom <= r.top + 2) {
                        var g = Math.round(r.top - er.bottom);
                        if (g >= 0 && g <= 40) gap = g; // FIX
                    }
                }
            } catch (eP2) { }

            // FIX: always position relative to viewport so it never docks into left toolbar
            var left = Math.max(0, Math.round(r.left));
            var top = Math.max(0, Math.round(r.top + r.height + gap)); // FIX

            btn.style.position = "fixed"; // FIX
            btn.style.left = left + "px"; // FIX
            btn.style.top = top + "px"; // FIX
        } catch (e) { }
    }

    function __LT_projectHasGameSprite() { // FIX
        try {
            var found = false;
            walkProjectChildren(function (child) {
                if (found) return;
                try {
                    var t = resolveScriptTarget(child);
                    if (!t) return;
                    var src = s(readUpdateScriptFromTarget(t));
                    if (!src) return;
                    if (src.indexOf("LT_GAME_SPRITE") !== -1) { found = true; return; } // FIX
                } catch (e1) { }
            });
            return found;
        } catch (e0) { }
        return false;
    }

    function __LT_updateGameSpriteToggleVisibility() { // FIX
        try {
            var btn = document.getElementById(GAMESPRITE_LAUNCHER_ID);
            if (!btn) return;

            var show = false;

            // Show for ANY clip that has an update script with variables
            try {
                var ed = getEditor();
                var so = getSelectedObject(ed);
                if (so) {
                    var t = resolveScriptTarget(so);
                    var ds = t ? s(readUpdateScriptFromTarget(t)) : "";
                    if (ds && ds.trim()) {
                        // Show if the script has any var/let/const declarations
                        if (/(?:^|\n)\s*(?:var|let|const)\s+[a-zA-Z_$]/.test(ds)) show = true;
                    }
                }
            } catch (e0) { }

            if (show) {
                try { __LT_syncLauncherPosition(document.getElementById(LAUNCHER_ID)); } catch (eS0) { } // FIX
                try { __LT_syncGameSpriteLauncherPosition(btn); } catch (eS1) { } // FIX
                try { __LT_updateGameSpriteToggleIcon(); } catch (eS2) { } // FIX
                if (btn.style.display !== "") btn.style.display = "";
            } else {
                if (btn.style.display !== "none") btn.style.display = "none";
                try { closeGameSpritePanel(); } catch (e1) { } // FIX: hide panel if selection is not a game element
                try {
                    var img0 = __LT_getGameSpriteToggleImg();
                    if (img0) { img0.setAttribute("data-lt-src", LT_GITHUB_RAW_BASE + "scripts/Panel_SVG/GameCharacter.svg"); // FIX
                        img0.src = LT_GITHUB_RAW_BASE + "scripts/Panel_SVG/GameCharacter.svg"; // FIX
                    } // FIX
                } catch (e2) { } // FIX
            }
        } catch (e) { }
    }



    
    function __LT_getGameSpriteToggleImg() { // FIX
        try {
            var btn = document.getElementById(GAMESPRITE_LAUNCHER_ID);
            if (!btn) return null;
            var imgs = btn.getElementsByTagName("img");
            return (imgs && imgs.length) ? imgs[0] : null;
        } catch (e) { }
        return null;
    }

    
    function __LT_getPanelConfigObjSync() { // FIX
        try {
            if (window.__LT_panelCfgObj && typeof window.__LT_panelCfgObj === "object") return window.__LT_panelCfgObj;
            var raw = "";
            try { raw = localStorage.getItem(STORAGE_PANEL_JSON) || ""; } catch (e0) { raw = ""; }
            if (!raw.trim()) return null;
            try { window.__LT_panelCfgObj = JSON.parse(raw); } catch (e1) { window.__LT_panelCfgObj = null; return null; }
            return window.__LT_panelCfgObj;
        } catch (e) { }
        return null;
    }

    function __LT_tryFetchPanelConfigOnce() { // FIX
        try {
            if (window.__LT_panelCfgFetchStarted) return;
            window.__LT_panelCfgFetchStarted = true;

            try {
                fetchText(DEFAULT_PANEL_JSON_URL).then(function (t) {
                    try { if (t && t.trim()) localStorage.setItem(STORAGE_PANEL_JSON, t); } catch (e2) { }
                    try { window.__LT_panelCfgObj = null; } catch (e3) { }
                    try { __LT_updateGameSpriteToggleIcon(); } catch (e4) { }
                }).catch(function () { });
            } catch (e1) { }
        } catch (e) { }
    }

    function __LT_svgToDataUrl(svgText) { // FIX
        try {
            var s0 = String(svgText || "");
            if (!s0.trim()) return "";
            return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s0);
        } catch (e) { }
        return "";
    }

    function __LT_findIconFromPanelConfig(keys) { // FIX
        try {
            var cfg = __LT_getPanelConfigObjSync();
            if (!cfg) {
                __LT_tryFetchPanelConfigOnce(); // FIX
                return "";
            }

            var groups = [];
            if (cfg.groups && Array.isArray(cfg.groups)) groups = cfg.groups;
            else if (cfg.tabs && Array.isArray(cfg.tabs)) groups = cfg.tabs;
            else if (cfg.items && Array.isArray(cfg.items)) groups = [{ items: cfg.items }];

            var want = [];
            for (var i = 0; i < (keys ? keys.length : 0); i += 1) want.push(String(keys[i] || "").toLowerCase());

            function matchItem(item) {
                if (!item) return false;
                var id = String(item.id || item.key || item.name || "").toLowerCase();
                var label = String(item.label || item.title || "").toLowerCase();
                for (var k = 0; k < want.length; k += 1) {
                    if (!want[k]) continue;
                    if (id === want[k] || label === want[k]) return true;
                    if (id.indexOf(want[k]) !== -1 || label.indexOf(want[k]) !== -1) return true;
                }
                return false;
            }

            for (var g = 0; g < groups.length; g += 1) {
                var items = (groups[g] && groups[g].items && Array.isArray(groups[g].items)) ? groups[g].items : [];
                for (var j = 0; j < items.length; j += 1) {
                    var it = items[j];
                    if (!matchItem(it)) continue;

                    var url = String(it.iconUrl || "").trim();
                    if (url) return url;

                    var svg = String(it.iconSvg || "").trim();
                    if (svg) {
                        var du = __LT_svgToDataUrl(svg);
                        if (du) return du;
                    }
                }
            }
        } catch (e) { }
        return "";
    }

function __LT_iconForSelectedType() { // FIX
        try {
            var ed = getEditor();
            var so = getSelectedObject(ed);
            if (!so) return LT_GITHUB_RAW_BASE + "scripts/Panel_SVG/GameCharacter.svg"; // FIX
            var t = resolveScriptTarget(so);
            if (!t) return LT_GITHUB_RAW_BASE + "scripts/Panel_SVG/GameCharacter.svg"; // FIX

            var src = s(readUpdateScriptFromTarget(t));
            if (!src) return LT_GITHUB_RAW_BASE + "scripts/Panel_SVG/GameCharacter.svg"; // FIX

            // FIX: only switch icon if this selection is a game element
            var isSolid = (src.indexOf("LT_SOLID") !== -1);
            var isJump = (src.indexOf("LT_JUMPTHROUGH") !== -1);
            var isSprite = (src.indexOf("LT_GAME_SPRITE") !== -1);

            if (!(isSolid || isJump || isSprite)) return LT_GITHUB_RAW_BASE + "scripts/Panel_SVG/GameCharacter.svg"; // FIX

            // FIX: try to resolve icon from LukeTools panel config first (same config that drives the LT icon panel)
            try {
                var keyList = [];
                if (isSolid) keyList = ["Solid", "LT_SOLID", "solid"];
                else if (isJump) keyList = ["JumpThrough", "Jump Through", "LT_JUMPTHROUGH", "jumpthrough"];
                else if (isSprite) keyList = ["SideRunner", "Side Runner", "GameCharacter", "LT_GAME_SPRITE"];

                var icon = __LT_findIconFromPanelConfig(keyList);
                if (icon) return icon;
            } catch (e0) { }

            // FIX: fallback hard map
            if (isSolid) return LT_GITHUB_RAW_BASE + "scripts/Panel_SVG/Solid.svg"; // FIX
            if (isJump) return LT_GITHUB_RAW_BASE + "scripts/Panel_SVG/JumpThrough.svg"; // FIX
            return LT_GITHUB_RAW_BASE + "scripts/Panel_SVG/GameCharacter.svg"; // FIX
        } catch (e) { }
        return LT_GITHUB_RAW_BASE + "scripts/Panel_SVG/GameCharacter.svg"; // FIX
    }

    function __LT_updateGameSpriteToggleIcon() { // FIX
        try {
            var img = __LT_getGameSpriteToggleImg();
            if (!img) return;
            var desired = __LT_iconForSelectedType();
            if (img.getAttribute("data-lt-src") !== desired) {
                img.setAttribute("data-lt-src", desired);
                img.src = desired;
                img.onerror = function () { // FIX
                    try { img.onerror = null; } catch (e0) { }
                    try { img.src = desired.replace(/^\//, ""); } catch (e1) { }
                };
            }
        } catch (e) { }
    }

    function clearSelectionNow() { // FIX
        try {
            var ed = getEditor();
            var sel = getSelectionApi(ed);
            if (!sel) return false;

            var fns = ["clear", "clearSelection", "deselectAll", "selectNone"];
            for (var i = 0; i < fns.length; i += 1) {
                var fn = sel[fns[i]];
                if (isFn(fn)) { try { fn.call(sel); return true; } catch (e0) { } }
            }

            var fns2 = ["setSelectedObjects", "selectObjects", "select"];
            for (var j = 0; j < fns2.length; j += 1) {
                var fn2 = sel[fns2[j]];
                if (isFn(fn2)) { try { fn2.call(sel, []); return true; } catch (e1) { } }
            }
        } catch (e2) { }
        return false;
    }

    
    function __LT_enablePanelDrag(panel, handle) { // FIX
        try {
            if (!panel || !handle) return;
            if (panel.__LT_dragEnabled) return;
            panel.__LT_dragEnabled = true;

            var dragging = false;
            var ox = 0;
            var oy = 0;

            function onDown(e) { // FIX
                try {
                    if (!e) return;
                    dragging = true;
                    var r = panel.getBoundingClientRect();
                    ox = (e.clientX || 0) - r.left;
                    oy = (e.clientY || 0) - r.top;
                    try { e.preventDefault(); } catch (e0) { }
                    try { e.stopPropagation(); } catch (e1) { }
                    document.addEventListener("mousemove", onMove, true);
                    document.addEventListener("mouseup", onUp, true);
                } catch (e2) { }
            }

            function onMove(e) { // FIX
                try {
                    if (!dragging) return;
                    var x = (e.clientX || 0) - ox;
                    var y = (e.clientY || 0) - oy;

                    var vw = Math.max(320, window.innerWidth || 0);
                    var vh = Math.max(240, window.innerHeight || 0);
                    var pw = panel.offsetWidth || 340;
                    var ph = panel.offsetHeight || 360;

                    if (x + pw > vw - 8) x = vw - pw - 8;
                    if (y + ph > vh - 8) y = vh - ph - 8;
                    if (x < 8) x = 8;
                    if (y < 8) y = 8;

                    panel.style.position = "fixed"; // FIX
                    panel.style.left = Math.round(x) + "px"; // FIX
                    panel.style.top = Math.round(y) + "px"; // FIX

                    try { localStorage.setItem("LT_GAMESPRITE_PANEL_POS", JSON.stringify({ x: Math.round(x), y: Math.round(y) })); } catch (e0) { }
                } catch (e3) { }
            }

            function onUp(e) { // FIX
                try {
                    dragging = false;
                    document.removeEventListener("mousemove", onMove, true);
                    document.removeEventListener("mouseup", onUp, true);
                } catch (e4) { }
            }

            handle.addEventListener("mousedown", onDown, true); // FIX
        } catch (e) { }
    }

function __LT_createGameSpritePanelIfMissing() { // FIX
        try {
            var existing = document.getElementById(GAMESPRITE_PANEL_ID);
            if (existing) return existing;

            var dock = getDockNode();
            if (!dock) return null;

            var panel = document.createElement("div"); // FIX
            panel.id = GAMESPRITE_PANEL_ID; // FIX
            panel.style.position = "absolute"; // FIX
            panel.style.zIndex = "2001"; // FIX
            panel.style.width = "340px"; // FIX
            panel.style.height = "360px"; // FIX
            panel.style.display = "none"; // FIX
            panel.style.borderRadius = "0px"; // FIX
            panel.style.overflow = "hidden"; // FIX
            panel.style.boxShadow = "0 10px 24px rgba(0,0,0,0.45)"; // FIX
            panel.style.border = "1px solid rgba(255,255,255,0.10)"; // FIX
            panel.style.background = "#111"; // FIX

            
            var header = document.createElement("div"); // FIX
            header.id = GAMESPRITE_PANEL_ID + "_header"; // FIX
            header.style.height = "28px"; // FIX
            header.style.display = "flex"; // FIX
            header.style.alignItems = "center"; // FIX
            header.style.justifyContent = "space-between"; // FIX
            header.style.padding = "0 10px"; // FIX
            header.style.cursor = "move"; // FIX
            header.style.userSelect = "none"; // FIX
            header.style.background = "#1a1a1a"; // FIX
            header.style.borderBottom = "1px solid rgba(255,255,255,0.10)"; // FIX
            header.style.fontFamily = "Arial, Helvetica, sans-serif"; // FIX
            header.style.fontSize = "12px"; // FIX
            header.style.color = "#eee"; // FIX

            var title = document.createElement("div"); // FIX
            title.textContent = "Sprite Settings"; // FIX
            title.style.pointerEvents = "none"; // FIX

            var closeBtn = document.createElement("button"); // FIX
            closeBtn.textContent = "x"; // FIX
            closeBtn.style.width = "26px"; // FIX
            closeBtn.style.height = "22px"; // FIX
            closeBtn.style.border = "1px solid rgba(255,255,255,0.14)"; // FIX
            closeBtn.style.background = "rgba(255,255,255,0.08)"; // FIX
            closeBtn.style.color = "#eee"; // FIX
            closeBtn.style.cursor = "pointer"; // FIX
            closeBtn.style.borderRadius = "0px"; // FIX
            closeBtn.addEventListener("click", function (e) { // FIX
                try { e.preventDefault(); e.stopPropagation(); } catch (e0) { }
                try { closeGameSpritePanel(); } catch (e1) { }
            }); // FIX

            header.appendChild(title); // FIX
            header.appendChild(closeBtn); // FIX
            panel.appendChild(header); // FIX

            // FIX: draggable panel via header (iframe does not pass mouse events)
            __LT_enablePanelDrag(panel, header); // FIX
var iframe = document.createElement("iframe"); // FIX
            iframe.id = GAMESPRITE_PANEL_IFRAME_ID; // FIX
            iframe.style.width = "100%"; // FIX
            iframe.style.height = "calc(100% - 28px)"; // FIX
            iframe.style.border = "0"; // FIX
            iframe.setAttribute("sandbox", "allow-scripts allow-same-origin"); // FIX
            iframe.srcdoc = "<!doctype html><html><head><meta charset=\"utf-8\"><title>Clip Settings<\/title><style>*{box-sizing:border-box;}html,body{margin:0;padding:0;background:#1c1c22;color:#eaeaea;font-family:Arial,sans-serif;height:100%;overflow:hidden;}#app{display:flex;flex-direction:column;height:100%;}.topbar{flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,0.12);background:rgba(15,15,16,0.96);}.title{font-weight:800;font-size:13px;flex:1;}.sel-pill{font-size:11px;padding:2px 8px;border-radius:4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.tabs{flex:0 0 auto;display:flex;gap:0;border-bottom:1px solid rgba(255,255,255,0.12);background:rgba(10,10,12,0.98);overflow-x:auto;}.tab{padding:7px 12px;font-size:11px;font-weight:700;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;color:rgba(255,255,255,0.5);}.tab.active{color:#eaeaea;border-bottom-color:#21b26b;}.body{flex:1 1 auto;overflow-y:auto;overflow-x:hidden;padding:10px;}.pane{display:none;}.pane.active{display:block;}.row{margin-bottom:10px;}.row-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;}.lbl{font-size:12px;font-weight:700;}.badge{font-size:12px;font-weight:700;color:#7dd3a8;min-width:40px;text-align:right;}input[type=range]{width:100%;height:6px;accent-color:#21b26b;cursor:pointer;}select{width:100%;background:#1f1f22;color:#eaeaea;border:1px solid rgba(255,255,255,0.14);border-radius:6px;padding:6px 8px;font-size:12px;}input[type=text]{width:100%;background:#1f1f22;color:#eaeaea;border:1px solid rgba(255,255,255,0.14);border-radius:6px;padding:6px 8px;font-size:12px;}.footer{flex:0 0 auto;display:flex;gap:8px;padding:8px 10px;border-top:1px solid rgba(255,255,255,0.12);}.btn{flex:1;background:#1f1f22;color:#eaeaea;border:1px solid rgba(255,255,255,0.14);border-radius:6px;padding:7px;cursor:pointer;font-size:12px;font-weight:700;}.btn:hover{background:#27272b;}.btn-apply{background:#1a7a4a;border-color:#1a7a4a;}.btn-apply:hover{background:#218f56;}.status{font-size:11px;padding:0 10px 6px;min-height:16px;}.empty{padding:16px 10px;font-size:12px;color:#666;}<\/style><\/head><body><div id=\"app\"><div class=\"topbar\"><div class=\"title\">Clip Settings<\/div><div id=\"sel\" class=\"sel-pill\">No selection<\/div><\/div><div class=\"tabs\" id=\"tabs\"><\/div><div class=\"body\" id=\"body\"><div class=\"empty\" id=\"empty\">Select a clip with a script<\/div><\/div><div class=\"status\" id=\"status\"><\/div><div class=\"footer\"><button class=\"btn\" id=\"btnRefresh\">Refresh<\/button><button class=\"btn btn-apply\" id=\"btnApply\">Apply<\/button><button class=\"btn\" id=\"btnClose\">Close<\/button><\/div><\/div><script>function getB(){try{if(window.top&&window.top.LukeToolsBridge)return window.top.LukeToolsBridge;}catch(e1){}try{if(window.parent&&window.parent.LukeToolsBridge)return window.parent.LukeToolsBridge;}catch(e2){}return null;}function setStatus(m,ok){var s=document.getElementById('status');s.textContent=m||'';s.style.color=ok===false?'#f88':'#aaa';}var allCfgs=[];var activeTab=0;var scriptSrc='';function parseCfgBlocks(src){if(!src)return[];var blocks=[];try{var _ns=src.indexOf('/* LT_NODEPANEL_START */');var _ne=src.indexOf('/* LT_NODEPANEL_END */');while(_ns!==-1&&_ne!==-1){src=src.slice(0,_ns)+src.slice(_ne+22);_ns=src.indexOf('/* LT_NODEPANEL_START */');_ne=src.indexOf('/* LT_NODEPANEL_END */');}}catch(e){};var re=/var\\s+([A-Z_][A-Z0-9_]*(?:_?CFG|_CONFIG|_PARAMS))\\s*=\\s*(\\{[^}]+\\})/g;var m;while((m=re.exec(src))!==null){var varName=m[1];var jsonStr=m[2];var obj=null;try{obj=JSON.parse(jsonStr);}catch(e){try{var r=jsonStr.replace(/([{,]\\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\\s*:)/g,'$1\\\"$2\\\"$3');obj=JSON.parse(r);}catch(e2){}}if(!obj)continue;var tabLabel=varName;if(obj.type){tabLabel=String(obj.type).replace('LT_','').replace(/_/g,' ');}var controls=[];for(var k in obj){if(!obj.hasOwnProperty(k))continue;if(k==='type')continue;var v=obj[k];var t=typeof v;if(t==='number'){var isF=(String(v).indexOf('.')!==-1);var absV=Math.abs(v);var mn=0,mx=absV<=1?2:absV*3,st=isF?0.01:1;if(k==='phase'){mn=-6.28;mx=6.28;st=0.01;}else if(k==='amp'||k==='amplitude'){mx=Math.max(500,absV*3);st=1;}else if(k==='speed'||k==='rate'){mx=Math.max(10,absV*3);st=isF?0.01:1;}else if(k==='opacity'||k==='alpha'){mx=1;st=0.01;}else if(k==='rotation'||k==='angle'){mx=360;st=1;}else if(k==='gravity'){mx=Math.max(5,absV*3);st=0.01;}else if(k==='jump'){mx=Math.max(20,absV*3);st=0.1;}else if(k==='maxFall'||k==='maxfall'){mx=Math.max(30,absV*3);st=0.1;}controls.push({type:'number',key:k,label:k,val:v,min:mn,max:mx,step:st});}else if(t==='boolean'){controls.push({type:'select',key:k,label:k,val:String(v),options:[{v:'true',l:'on'},{v:'false',l:'off'}]});}else if(t==='string'){controls.push({type:'text',key:k,label:k,val:v});}else if(t==='number'&&(v===0||v===1)){controls.push({type:'select',key:k,label:k,val:String(v),options:[{v:'1',l:'on'},{v:'0',l:'off'}]});}}if(controls.length){var fullMatch='var '+varName+' = '+jsonStr+';';if(src.indexOf(fullMatch)===-1)fullMatch='var '+varName+' = '+jsonStr;blocks.push({varName:varName,label:tabLabel,controls:controls,jsonStr:jsonStr,fullMatch:fullMatch});}}return blocks;}function buildTabs(blocks){var tabsEl=document.getElementById('tabs');tabsEl.innerHTML='';blocks.forEach(function(b,i){var tab=document.createElement('div');tab.className='tab'+(i===activeTab?' active':'');tab.textContent=b.label;tab.setAttribute('data-idx',i);tab.onclick=function(){activeTab=Number(this.getAttribute('data-idx'));buildTabs(allCfgs);buildPanes(allCfgs);};tabsEl.appendChild(tab);});}function buildPanes(blocks){var body=document.getElementById('body');body.innerHTML='';if(!blocks||!blocks.length){var empty=document.createElement('div');empty.className='empty';empty.textContent='No CFG blocks found';body.appendChild(empty);return;}blocks.forEach(function(b,bi){var pane=document.createElement('div');pane.className='pane'+(bi===activeTab?' active':'');pane.setAttribute('data-pane',bi);b.controls.forEach(function(c,ci){var row=document.createElement('div');row.className='row';var top=document.createElement('div');top.className='row-top';var lbl=document.createElement('div');lbl.className='lbl';lbl.textContent=c.label;top.appendChild(lbl);if(c.type==='number'){var badge=document.createElement('div');badge.className='badge';var isF=(String(c.step).indexOf('.')!==-1);badge.textContent=isF?Number(c.val).toFixed(2):String(c.val);top.appendChild(badge);row.appendChild(top);var slider=document.createElement('input');slider.type='range';slider.min=String(c.min);slider.max=String(c.max);slider.step=String(c.step);slider.value=String(c.val);slider.onmousedown=function(ev){ev.stopPropagation();};(function(bIdx,cIdx,s,bdg,fl){s.oninput=function(){var v=parseFloat(s.value);if(!isFinite(v))v=0;allCfgs[bIdx].controls[cIdx].val=v;bdg.textContent=fl?v.toFixed(2):String(Math.round(v));};})(bi,ci,slider,badge,isF);row.appendChild(slider);}else if(c.type==='select'){row.appendChild(top);var sel=document.createElement('select');sel.onmousedown=function(ev){ev.stopPropagation();};(c.options||[]).forEach(function(o){var opt=document.createElement('option');opt.value=o.v;opt.textContent=o.l;if(o.v===String(c.val))opt.selected=true;sel.appendChild(opt);});(function(bIdx,cIdx,s){s.onchange=function(){allCfgs[bIdx].controls[cIdx].val=s.value;};})(bi,ci,sel);row.appendChild(sel);}else{row.appendChild(top);var inp=document.createElement('input');inp.type='text';inp.value=String(c.val);inp.onmousedown=function(ev){ev.stopPropagation();};(function(bIdx,cIdx,s){s.oninput=function(){allCfgs[bIdx].controls[cIdx].val=s.value;};})(bi,ci,inp);row.appendChild(inp);}pane.appendChild(row);});body.appendChild(pane);});}function loadData(name,src){document.getElementById('sel').textContent=name||'Unknown';if(!src){setStatus('No update script found',false);return;}scriptSrc=src;allCfgs=parseCfgBlocks(src);activeTab=0;buildTabs(allCfgs);buildPanes(allCfgs);var total=allCfgs.reduce(function(a,b){return a+b.controls.length;},0);setStatus(allCfgs.length?'Found '+allCfgs.length+' block'+(allCfgs.length===1?'':'s')+', '+total+' variables':'No CFG blocks found',allCfgs.length>0);}window.addEventListener('message',function(e){if(e.data&&e.data.type==='LT_CLIP_DATA'){loadData(e.data.name,e.data.script);}});function refresh(){var br=getB();if(!br){setStatus('Bridge not found',false);return;}try{if(br.captureSelectionNow)br.captureSelectionNow();}catch(e){}var name='';try{name=br.getSelectedClipName?br.getSelectedClipName():'';}catch(e){}if(!name){setStatus('No selection - reopen panel',false);return;}document.getElementById('sel').textContent=name;var src='';try{src=br.getUpdateScriptOnSelection?br.getUpdateScriptOnSelection():'';}catch(e){}if(!src){setStatus('No update script',false);return;}scriptSrc=src;allCfgs=parseCfgBlocks(src);activeTab=0;buildTabs(allCfgs);buildPanes(allCfgs);}function applyVars(){var br=getB();if(!br){setStatus('Bridge not found',false);return;}if(!scriptSrc||!allCfgs.length){setStatus('Nothing to apply',false);return;}var updated=scriptSrc;var changed=false;allCfgs.forEach(function(b){var newObj={};try{var orig=JSON.parse(b.jsonStr);if(orig&&orig.type)newObj.type=orig.type;}catch(e){}b.controls.forEach(function(c){var v=c.val;if(c.type==='number')v=parseFloat(v);else if(c.type==='select'){if(v==='true')v=true;else if(v==='false')v=false;else{var n=Number(v);if(!isNaN(n))v=n;}}newObj[c.key]=v;});var newJson=JSON.stringify(newObj);if(b.fullMatch&&updated.indexOf(b.fullMatch)!==-1){var newLine='var '+b.varName+' = '+newJson+';';updated=updated.split(b.fullMatch).join(newLine);changed=true;}});if(!changed){setStatus('No match found - try Refresh',false);return;}try{if(br.setUpdateScriptOnSelection)br.setUpdateScriptOnSelection(updated);scriptSrc=updated;allCfgs=parseCfgBlocks(updated);setStatus('Applied!');}catch(e){setStatus('Failed: '+e.message,false);}}document.getElementById('btnRefresh').addEventListener('click',refresh);document.getElementById('btnApply').addEventListener('click',applyVars);document.getElementById('btnClose').addEventListener('click',function(){try{var br=getB();if(br&&br.closeGameSpritePanel)br.closeGameSpritePanel();}catch(e){};});<\/script><\/body><\/html>"; // FIX
            panel.appendChild(iframe); // FIX

            dock.appendChild(panel); // FIX
            return panel; // FIX
        } catch (e) { }
        return null;
    }

    function __LT_positionGameSpritePanel() { // FIX
        try {
            var panel = document.getElementById(GAMESPRITE_PANEL_ID);
            var btn = document.getElementById(GAMESPRITE_LAUNCHER_ID);
            if (!panel || !btn) return;

            // FIX: restore last position if user dragged it
            try {
                var saved = localStorage.getItem("LT_GAMESPRITE_PANEL_POS") || "";
                if (saved) {
                    var o = JSON.parse(saved);
                    if (o && typeof o.x === "number" && typeof o.y === "number") {
                        panel.style.position = "fixed"; // FIX
                        panel.style.left = Math.round(o.x) + "px"; // FIX
                        panel.style.top = Math.round(o.y) + "px"; // FIX
                        return; // FIX
                    }
                }
            } catch (e0) { }

            var r = btn.getBoundingClientRect();

            // FIX: prefer opening to the LEFT of the toggle so it never sits under the toggles
            var pw = panel.offsetWidth || 340;
            var ph = panel.offsetHeight || 360;

            var left = Math.round(r.left - pw - 10); // FIX
            var top = Math.round(r.top); // FIX

            var vw = Math.max(320, window.innerWidth || 0);
            var vh = Math.max(240, window.innerHeight || 0);

            if (left < 8) left = Math.round(r.left + 44); // FIX fallback to right
            if (left + pw > vw - 8) left = Math.max(8, vw - pw - 8);
            if (top + ph > vh - 8) top = Math.max(8, vh - ph - 8);
            if (left < 8) left = 8;
            if (top < 8) top = 8;

            panel.style.left = left + "px";
            panel.style.top = top + "px";
            panel.style.position = "fixed"; // FIX
        } catch (e) { }
    }

    function openGameSpritePanel() { // FIX
        try {
            var clipName = "";
            var clipScript = "";
            try {
                var ed = getEditor();
                var so = getSelectedObject(ed);
                if (so) {
                    var t = resolveScriptTarget(so);
                    clipScript = t ? s(readUpdateScriptFromTarget(t)) : "";
                    clipName = getObjName(so) || getObjIdentifier(so) || "";
                }
            } catch (e0) { }

            if (!clipScript || !clipScript.trim()) return; // FIX: only open if clip has a script
            if (!/(?:^|\n)\s*var\s+[A-Z_][A-Z0-9_]*(?:_CFG|_CONFIG|_PARAMS)\s*=\s*\{/.test(clipScript)) return; // only open for CFG objects

            var panel = __LT_createGameSpritePanelIfMissing();
            if (!panel) return;
            panel.style.display = "block";
            __LT_positionGameSpritePanel();

            // Always read the CURRENT script fresh from the bridge so applied changes are reflected
            var freshScript = clipScript;
            try {
                var br2 = Bridge;
                if (br2 && br2.getUpdateScriptOnSelection) {
                    var fresh = br2.getUpdateScriptOnSelection();
                    if (fresh && fresh.trim()) freshScript = fresh;
                }
            } catch(eFresh) {}

            // Pass script and clip name directly into iframe via postMessage
            try {
                var iframe = document.getElementById(GAMESPRITE_PANEL_IFRAME_ID);
                if (iframe && iframe.contentWindow) {
                    setTimeout(function() {
                        try {
                            // Re-read fresh script at send time in case it changed
                            var sendScript = freshScript;
                            try {
                                var br3 = Bridge;
                                if (br3 && br3.getUpdateScriptOnSelection) {
                                    var s3 = br3.getUpdateScriptOnSelection();
                                    if (s3 && s3.trim()) sendScript = s3;
                                }
                            } catch(eS3) {}
                            iframe.contentWindow.postMessage({
                                type: "LT_CLIP_DATA",
                                name: clipName,
                                script: sendScript
                            }, "*");
                        } catch(ePM) {}
                    }, 300);
                }
            } catch(eIframe) {}
        } catch (e) { }
    }

    function closeGameSpritePanel() { // FIX
        try {
            var panel = document.getElementById(GAMESPRITE_PANEL_ID);
            if (panel) panel.style.display = "none";
        } catch (e) { }
    }


function removeLauncher() {
        try {
            var old = document.getElementById(LAUNCHER_ID);
            var oldGS = document.getElementById(GAMESPRITE_LAUNCHER_ID); // FIX
            var oldGSP = document.getElementById(GAMESPRITE_PANEL_ID); // FIX
            if (old && old.parentNode) old.parentNode.removeChild(old);
            if (oldGS && oldGS.parentNode) oldGS.parentNode.removeChild(oldGS); // FIX
            if (oldGSP && oldGSP.parentNode) oldGSP.parentNode.removeChild(oldGSP); // FIX
        } catch (e1) { }
    }

    // --- REPLACED: ensureLauncher to apply loaded config on creation ---
    function ensureLauncher(showFn) {
        if (document.getElementById(LAUNCHER_ID)) return;

        var dock = getDockNode();
        if (!dock) return;

        var btn = document.createElement("button");
        btn.id = LAUNCHER_ID;
        btn.setAttribute("data-lt-launcher","1"); // FIX: mark launcher so outliner lookup never returns it
        btn.type = "button";
        btn.title = "Luke Tools";
        btn.className = "wick-button  action-button-tool action-button outliner-expand-button"; // FIX: match Outliner toggle styling
        btn.style.position = "absolute"; // FIX: injected into wick-canvas-container
        btn.style.zIndex = "999998"; // FIX: lower z-index so splash screens can appear above
        btn.style.right = "auto"; // FIX
        btn.style.left = "0px"; // FIX: positioned by sync function
        btn.style.top = "0px"; // FIX: positioned by sync function
        btn.style.transform = "none"; // FIX
        btn.style.transition = "none"; // FIX: prevent animated drift when repositioning
        try {
            var csDock = window.getComputedStyle ? window.getComputedStyle(dock) : null;
            if (csDock && csDock.position === "static") dock.style.position = "relative"; // FIX: anchor absolute positioning inside wick-canvas-container
        } catch (eDockPos) { }

        var ltSvg = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>" +
            "<rect x='2' y='2' width='20' height='20' rx='4' ry='4' fill='none' stroke='white' stroke-width='2'/>" +
            "<path d='M7 7v10h3' fill='none' stroke='white' stroke-width='2' stroke-linecap='round'/>" +
            "<path d='M13 7h4' fill='none' stroke='white' stroke-width='2' stroke-linecap='round'/>" +
            "<path d='M15 7v10' fill='none' stroke='white' stroke-width='2' stroke-linecap='round'/>" +
            "</svg>";
        var img = document.createElement("img");
        img.className = "img-tool-icon action-button-single-icon outliner-toggle-icon"; // FIX
        img.alt = "Luke Tools";
        img.src = "data:image/svg+xml;utf8," + encodeURIComponent(ltSvg); // FIX: inline icon (no external deps)
        btn.appendChild(img);

        btn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            try { showFn(); } catch (e0) { }
        });

        dock.appendChild(btn);

        // FIX: GameSprite toggle under LT toggle
        var btnGS = document.createElement("button"); // FIX
        btnGS.id = GAMESPRITE_LAUNCHER_ID; // FIX
        btnGS.setAttribute("data-lt-launcher","1"); // FIX
        btnGS.type = "button"; // FIX
        btnGS.title = "GameSprite"; // FIX
        btnGS.className = btn.className; // FIX: match LT toggle classes

        // FIX: match LT toggle styling
        btnGS.style.position = "fixed"; // FIX
        btnGS.style.zIndex = btn.style.zIndex; // FIX
        btnGS.style.right = "auto"; // FIX
        btnGS.style.left = "0px"; // FIX: positioned by sync function
        btnGS.style.top = "0px"; // FIX: positioned by sync function

        btnGS.style.margin = "0"; // FIX
        btnGS.style.padding = btn.style.padding; // FIX
        btnGS.style.transform = "none"; // FIX
        btnGS.style.transition = "none"; // FIX
        btnGS.style.display = "none"; // FIX: only show when a game element clip is selected

        // FIX: use the same icon classnames as LT toggle
        var imgGS = document.createElement("img"); // FIX
        imgGS.className = "img-tool-icon action-button-single-icon outliner-toggle-icon"; // FIX
        imgGS.alt = "GameSprite"; // FIX

        // FIX: load svg from your public/scripts path (with a fallback if absolute path fails)
        imgGS.src = LT_GITHUB_RAW_BASE + "scripts/Panel_SVG/GameCharacter.svg"; // FIX
        imgGS.onerror = function () { // FIX
            try { imgGS.onerror = null; } catch (e0) { }
            try { imgGS.src = "scripts/Panel_SVG/GameCharacter.svg"; } catch (e1) { } // FIX
        }; // FIX

        btnGS.appendChild(imgGS); // FIX

        btnGS.addEventListener("click", function (e) { // FIX
            e.preventDefault();
            e.stopPropagation();
            try {
                var pnl = document.getElementById(GAMESPRITE_PANEL_ID);
                if (pnl && pnl.style && pnl.style.display === "block") {
                    closeGameSpritePanel(); // FIX
                } else {
                    openGameSpritePanel(); // FIX
                }
            } catch (e1) { }
        }); // FIX

        dock.appendChild(btnGS); // FIX

        // Load layout from json (localStorage override -> file) and apply
        loadLauncherLayoutConfig().then(function (cfg) {
            try { applyLauncherLayout(btn, cfg); } catch (e) { }
        }).catch(function () { /* ignore */ });

        __LT_syncLauncherPosition(btn); // initial placement
        __LT_syncGameSpriteLauncherPosition(btnGS); // FIX
        __LT_updateGameSpriteToggleVisibility(); // FIX
        if (!window.__LT_launcherPosBound) { // FIX
            window.__LT_launcherPosBound = true; // FIX
            window.addEventListener("resize", function () { // FIX
                var b = document.getElementById(LAUNCHER_ID);
                if (b) __LT_syncLauncherPosition(b);
                __LT_updateGameSpriteToggleVisibility(); // FIX
                __LT_positionGameSpritePanel(); // FIX
            });
            setInterval(function () { // FIX: keep aligned even when layout changes
                var b2 = document.getElementById(LAUNCHER_ID);
                if (b2) __LT_syncLauncherPosition(b2);
                __LT_updateGameSpriteToggleVisibility(); // FIX
                __LT_positionGameSpritePanel(); // FIX
            }, 250);
        }
    }


    function ensureOverlay() { // FIX
        var existing = document.getElementById(OVERLAY_ID);
        if (existing) return existing;

        var overlay = document.createElement("div");
        overlay.id = OVERLAY_ID;
        overlay.style.position = "fixed";
        overlay.style.left = "0";
        overlay.style.top = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.zIndex = "9999999";
        overlay.style.background = "rgba(0,0,0,0.35)";
        overlay.style.display = "none";

        var bar = document.createElement("div"); // FIX: fullscreen toolbar
        bar.style.position = "absolute";
        bar.style.left = "0";
        bar.style.top = "0";
        bar.style.width = "100%";
        bar.style.height = "48px";
        bar.style.display = "flex";
        bar.style.alignItems = "center";
        bar.style.justifyContent = "space-between";
        bar.style.padding = "8px 10px";
        bar.style.boxSizing = "border-box";
        bar.style.background = "rgba(0,0,0,0.65)";
        bar.style.display = "none"; // FIX: hide fullscreen toolbar (no top back or close)

        var barLeft = document.createElement("div"); // FIX
        barLeft.style.display = "flex";
        barLeft.style.gap = "8px";
        barLeft.style.alignItems = "center";

        var backBtn = document.createElement("button"); // FIX
        backBtn.type = "button";
        backBtn.textContent = "Back";
        backBtn.style.padding = "8px 12px";
        backBtn.style.border = "0";
        backBtn.style.borderRadius = "10px";
        backBtn.style.cursor = "pointer";
        backBtn.style.fontFamily = "Arial, sans-serif";
        backBtn.style.fontSize = "14px";
        backBtn.style.background = "rgba(255,255,255,0.12)";
        backBtn.style.color = "white";

        var barRight = document.createElement("div"); // FIX
        barRight.style.display = "flex";
        barRight.style.gap = "8px";
        barRight.style.alignItems = "center";

        var closeBtn = document.createElement("button"); // FIX: avoid using global name close
        closeBtn.type = "button";
        closeBtn.textContent = "Close";
        closeBtn.style.padding = "8px 12px";
        closeBtn.style.border = "0";
        closeBtn.style.borderRadius = "10px";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.fontFamily = "Arial, sans-serif";
        closeBtn.style.fontSize = "14px";
        closeBtn.style.background = "rgba(255,255,255,0.18)";
        closeBtn.style.color = "white";

        var frame = document.createElement("iframe");
        frame.id = OVERLAY_IFRAME_ID;
        frame.style.position = "absolute";
        frame.style.left = "0";
        frame.style.top = "0"; // FIX: fullscreen iframe starts at top (toolbar hidden)
        frame.style.width = "100%";
        frame.style.height = "100%"; // FIX: fullscreen iframe uses full height (toolbar hidden)
        frame.style.border = "0";
        frame.style.backgroundColor = "white";

        backBtn.addEventListener("click", function (e) { // FIX
            e.preventDefault();
            e.stopPropagation();
            try { closeFullscreen(); } catch (e0) { }
            try { showPanel(); } catch (e1) { }
            try { if (window.__LT_showIconPanelNow) window.__LT_showIconPanelNow(); } catch (e2) { }
        });

        closeBtn.addEventListener("click", function (e) { // FIX
            e.preventDefault();
            e.stopPropagation();
            try { closeFullscreen(); } catch (e0) { }
        });

        barLeft.appendChild(backBtn);
        barRight.appendChild(closeBtn);
        bar.appendChild(barLeft);
        bar.appendChild(barRight);

        overlay.appendChild(bar); // FIX
        overlay.appendChild(frame);

        // FIX: close button bottom right for fullscreen tools
        var closeBR = document.createElement("button");
        closeBR.type = "button";
        closeBR.textContent = "Close"; // FIX: bottom close button label
        closeBR.title = "Close";
        closeBR.style.position = "absolute";
        closeBR.style.left = "50%"; // FIX: center bottom close button
        closeBR.style.transform = "translateX(-50%)"; // FIX: center bottom close button
        closeBR.style.bottom = "18px";
        closeBR.style.width = "88px"; // FIX: fit Close label
        closeBR.style.height = "42px";
        closeBR.style.borderRadius = "14px";
        closeBR.style.border = "1px solid rgba(255,255,255,0.18)";
        closeBR.style.background = "rgba(0,0,0,0.35)";
        closeBR.style.color = "white";
        closeBR.style.cursor = "pointer";
        closeBR.style.fontSize = "14px";
        closeBR.style.fontWeight = "700";
        closeBR.style.zIndex = "1000001";

        closeBR.addEventListener("pointerdown", function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        closeBR.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            try { closeFullscreen(); } catch (e0) { }
            try { showPanel(); } catch (e1) { }
            try { if (window.__LT_showIconPanelNow) window.__LT_showIconPanelNow(); } catch (e2) { }
        });

        overlay.appendChild(closeBR); // FIX

        document.body.appendChild(overlay);
        return overlay;
    }


    function openFullscreen(htmlDoc) {
        var overlay = ensureOverlay();
        var frame = document.getElementById(OVERLAY_IFRAME_ID);
        if (!overlay || !frame) return;
        try { frame.srcdoc = htmlDoc; } catch (e1) { frame.srcdoc = ""; }
        overlay.style.display = "block";
    }

    function closeFullscreen() {
        var overlay = document.getElementById(OVERLAY_ID);
        var frame = document.getElementById(OVERLAY_IFRAME_ID);
        if (frame) {
            try { frame.srcdoc = ""; } catch (e1) { }
        }
        if (overlay) {
            overlay.style.display = "none";
        }
    }

    function fetchText(url) {
        var u = s(url);
        if (!u) return Promise.reject(new Error("missing url"));

        // FIX: Do not append cache bust to blob or data URLs
        if (u.indexOf("blob:") === 0 || u.indexOf("data:") === 0) {
            if (window.fetch) {
                return fetch(u, { cache: "no-store" }).then(function (r) { return r.text(); });
            }
            return new Promise(function (resolve, reject) {
                try {
                    var xhrb = new XMLHttpRequest();
                    xhrb.open("GET", u, true);
                    xhrb.onreadystatechange = function () {
                        if (xhrb.readyState !== 4) return;
                        if (xhrb.status >= 200 && xhrb.status < 300) resolve(xhrb.responseText || "");
                        else reject(new Error("http " + String(xhrb.status)));
                    };
                    xhrb.send();
                } catch (eb) {
                    reject(eb);
                }
            });
        }
        var sep = (u.indexOf("?") === -1) ? "?" : "&";
        u = u + sep + "t=" + String(nowMs());

        if (window.fetch) {
            return fetch(u, { cache: "no-store" }).then(function (r) { return r.text(); });
        }

        return new Promise(function (resolve, reject) {
            try {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", u, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState !== 4) return;
                    if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText || "");
                    else reject(new Error("http " + String(xhr.status)));
                };
                xhr.send();
            } catch (e) {
                reject(e);
            }
        });
    }

    function setPanelToolHtml(htmlDoc) {
        showPanel();
        var fr = document.getElementById(PANEL_IFRAME_ID);
        if (!fr) return { ok: false, reason: "panel iframe missing" };
        try { fr.srcdoc = htmlDoc; } catch (e) { fr.srcdoc = ""; }
        return { ok: true };
    }

    function openToolFromUrl(url, opts) {
        if (isKilled()) return Promise.resolve({ ok: false, reason: "killed" });

        var o = opts || {};
        var target = s(o.target || "panel").toLowerCase();

        return fetchText(url).then(function (raw) {
            var htmlDoc = ensureHtmlDocument(raw);
            try { lastLoaded.name = s(url); } catch (e1) { }
            try { lastLoaded.htmlDoc = htmlDoc; } catch (e2) { }

            if (target === "fullscreen") {
                openFullscreen(htmlDoc);
                return { ok: true, target: "fullscreen" };
            }

            return setPanelToolHtml(htmlDoc);
        }).catch(function (e) {
            return { ok: false, reason: "fetch failed", error: s(e && e.message ? e.message : e) };
        });
    }

    var panel = null;
    var lastLoaded = { name: "", htmlDoc: "" };

    function setPanelPos(x, y) {
        if (!panel) return;
        panel.style.left = x + "px";
        panel.style.top = y + "px";
        try { localStorage.setItem(STORAGE_X, String(x)); } catch (e1) { }
        try { localStorage.setItem(STORAGE_Y, String(y)); } catch (e2) { }
    }

    function clampPanelToView() {
        if (!panel) return;

        var w = panel.offsetWidth || 560;
        var h = panel.offsetHeight || 420;

        var x = 10;
        var y = 90;

        try {
            var sx = localStorage.getItem(STORAGE_X);
            var sy = localStorage.getItem(STORAGE_Y);
            if (sx !== null && sx !== "") x = parseInt(sx, 10);
            if (sy !== null && sy !== "") y = parseInt(sy, 10);
        } catch (e) { }

        if (isNaN(x)) x = 10;
        if (isNaN(y)) y = 90;

        var maxX = Math.max(0, window.innerWidth - w);
        var maxY = Math.max(0, window.innerHeight - h);

        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > maxX) x = maxX;
        if (y > maxY) y = maxY;

        setPanelPos(x, y);
    }

    function hidePanel() {
        if (!panel) return;
        panel.style.display = "none";
        try { var lb2 = document.getElementById(LAUNCHER_ID); if (lb2) lb2.style.display = "block"; } catch (e0) { } // FIX: show launcher when panel is hidden
        ensureLauncher(showPanel);
    }

    function showPanel() {
        var p = ensurePanel(); // FIX: use returned panel reference
        p.style.display = "block";
        ensureLauncher(showPanel);

        try { var lb = document.getElementById(LAUNCHER_ID); if (lb) lb.style.display = "none"; } catch (e0) { } // FIX: hide launcher while panel is open
        try { if (window.__LT_showIconPanelNow) window.__LT_showIconPanelNow(); } catch (e1) { } // FIX: always show icon panel on open
        try { setTimeout(function () { try { if (window.__LT_showIconPanelNow) window.__LT_showIconPanelNow(); } catch (e2) { } }, 50); } catch (e3) { } // FIX: retry after config auto load

        // FIX: first open should position the panel next to the Outliner toggle
        try {
            var hasX = window.localStorage.getItem(STORAGE_X);
            var hasY = window.localStorage.getItem(STORAGE_Y);
            if (!hasX && !hasY) {
                var ob = __LT_getOutlinerToggleButton();
                if (ob) {
                    var r = ob.getBoundingClientRect();
                    var x = Math.max(8, Math.round(r.left - p.offsetWidth - 10));
                    var y = Math.max(8, Math.round(r.top));
                    p.style.left = x + "px";
                    p.style.top = y + "px";
                }
            }
        } catch (e) { }

        clampPanelToView();
    }

    function ensurePanel() {
        if (panel) return panel; // FIX

        var existing = document.getElementById(PANEL_ID);
        if (existing) {
            panel = existing;
            return panel; // FIX
        }

        panel = document.createElement("div");
        panel.id = PANEL_ID;
        panel.style.position = "fixed";
        panel.style.zIndex = "999999";
        panel.style.width = "300px"; // FIX: requested floating panel width
        panel.style.height = "600px"; // FIX: requested floating panel height
        panel.style.maxHeight = "600px"; // FIX
        panel.style.overflow = "hidden";
        panel.style.borderRadius = "0px"; // FIX
        panel.style.border = "2px solid rgba(255,255,255,0.12)";
        panel.style.boxShadow = "0 10px 30px rgba(0,0,0,0.65)";
        panel.style.background = "rgba(18,18,18,0.98)";
        panel.style.color = "white";
        panel.style.fontFamily = "Arial, sans-serif"; // FIX
        panel.style.display = "block";

        var header = document.createElement("div");
        header.style.display = "flex";
        header.style.alignItems = "center";
        header.style.justifyContent = "space-between";
        header.style.padding = "10px 10px";
        header.style.borderBottom = "1px solid rgba(255,255,255,0.08)";
        header.style.userSelect = "none";
        header.style.cursor = "grab";

        var left = document.createElement("div");
        left.style.display = "flex";
        left.style.alignItems = "center";
        left.style.gap = "10px";

        var brandImg = document.createElement("img");
        brandImg.src = BRAND_ICON_URL;
        brandImg.alt = "Luke Tools";
        brandImg.style.width = "26px";
        brandImg.style.height = "26px";
        brandImg.style.borderRadius = "0px";
        brandImg.style.objectFit = "cover";

        var title = document.createElement("div");
        title.textContent = "Luke Tools";
        title.style.fontWeight = "700";
        title.style.fontSize = "14px";

        left.appendChild(brandImg);
        left.appendChild(title);

        var closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.textContent = "X";
        closeBtn.title = "Close";
        closeBtn.style.width = "34px";
        closeBtn.style.height = "34px";
        closeBtn.style.borderRadius = "10px";
        closeBtn.style.border = "1px solid rgba(255,255,255,0.12)";
        closeBtn.style.background = "rgba(255,255,255,0.08)";
        closeBtn.style.color = "white";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.fontSize = "13px";
        closeBtn.style.fontWeight = "700";

        closeBtn.addEventListener("pointerdown", function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        closeBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            hidePanel();
        });

        header.appendChild(left);
        header.appendChild(closeBtn);

        var body = document.createElement("div");
        body.style.padding = "0"; // FIX: launcher panel uses iframe layout
        body.style.overflow = "hidden"; // FIX: hide legacy picker UI container
        body.style.maxHeight = "calc(90vh - 54px)";

        var topBox = document.createElement("div");
        topBox.style.display = "flex";
        topBox.style.flexDirection = "column";
        topBox.style.gap = "8px";
        topBox.style.padding = "10px";
        topBox.style.borderRadius = "10px";
        topBox.style.border = "1px solid rgba(255,255,255,0.08)";
        topBox.style.background = "rgba(255,255,255,0.03)";

        if (ICON_PANEL_ONLY) { topBox.style.display = "none"; } // FIX

        var fileRow = document.createElement("div");
        fileRow.style.display = "flex";
        fileRow.style.alignItems = "center";
        fileRow.style.gap = "10px";

        var fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".html,.txt";
        fileInput.style.flex = "1";
        fileInput.style.fontSize = "12px";
        fileInput.style.color = "#ccc";

        var reloadBtn = document.createElement("button");
        reloadBtn.type = "button";
        reloadBtn.textContent = "Reload";
        reloadBtn.style.padding = "10px";
        reloadBtn.style.borderRadius = "10px";
        reloadBtn.style.border = "0";
        reloadBtn.style.background = "rgba(255,255,255,0.12)";
        reloadBtn.style.color = "white";
        reloadBtn.style.cursor = "pointer";
        reloadBtn.style.fontSize = "13px";
        reloadBtn.style.fontWeight = "700";

        fileRow.appendChild(fileInput);
        fileRow.appendChild(reloadBtn);


        // --- Folder Picker + Dropdown (loads .txt/.html tools into panel) ---
        var folderRow = document.createElement("div");
        folderRow.style.display = "flex";
        folderRow.style.alignItems = "center";
        folderRow.style.gap = "10px";

        // Hidden native directory input (browser button label cannot be changed)
        var folderInput = document.createElement("input");
        folderInput.type = "file";
        folderInput.accept = ".html,.htm,.txt";
        folderInput.multiple = true;
        folderInput.style.display = "none";
        folderInput.title = "Choose a folder to list tools (.txt/.html)";

        try { folderInput.setAttribute("webkitdirectory", ""); } catch (e0) { }
        try { folderInput.setAttribute("directory", ""); } catch (e1) { }

        // Visible button: "Choose folder"
        var folderBtn = document.createElement("button");
        folderBtn.type = "button";
        folderBtn.textContent = "Choose folder";
        folderBtn.style.padding = "10px";
        folderBtn.style.borderRadius = "10px";
        folderBtn.style.border = "1px solid rgba(255,255,255,0.12)";
        folderBtn.style.background = "rgba(255,255,255,0.06)";
        folderBtn.style.color = "white";
        folderBtn.style.fontWeight = "bold";
        folderBtn.style.cursor = "pointer";

        var folderMeta = document.createElement("div");
        folderMeta.style.fontSize = "12px";
        folderMeta.style.color = "#bbb";
        folderMeta.style.minWidth = "120px";
        folderMeta.textContent = "No folder chosen";

        var folderSelect = document.createElement("select");
        folderSelect.style.flex = "1";
        folderSelect.style.fontSize = "12px";
        folderSelect.style.padding = "10px";
        folderSelect.style.borderRadius = "10px";
        folderSelect.style.border = "1px solid rgba(255,255,255,0.12)";
        folderSelect.style.background = "rgba(255,255,255,0.06)";
        folderSelect.style.color = "white";

        // Force dark select styling (Wick CSS may set select background white !important)
        try {
            folderSelect.style.setProperty("background", "#111", "important");
            folderSelect.style.setProperty("color", "#eaeaea", "important");
            folderSelect.style.setProperty("border", "1px solid rgba(255,255,255,0.18)", "important");
        } catch (e) { }


        var folderFiles = [];

        function clearSelectOptions(sel) {
            while (sel.firstChild) sel.removeChild(sel.firstChild);
        }

        function stripExt(name) {
            var n = s(name || "");
            var dot = n.lastIndexOf(".");
            return (dot > 0) ? n.slice(0, dot) : n;
        }

        function rebuildFolderDropdown() {
            try {
                // Clear
                while (folderSelect.firstChild) folderSelect.removeChild(folderSelect.firstChild);

                // Placeholder
                var ph = document.createElement("option");
                ph.value = "";
                ph.textContent = "Choose a script";
                ph.selected = true;
                folderSelect.appendChild(ph);

                // Populate
                for (var i = 0; i < folderFiles.length; i++) {
                    var f = folderFiles[i];
                    if (!f) continue;

                    var nm = (f.name || ("Script_" + i));
                    // show just base name without extension
                    nm = nm.replace(/\.[^/.]+$/, "");

                    var opt = document.createElement("option");
                    opt.value = String(i);
                    opt.textContent = nm;
                    folderSelect.appendChild(opt);
                }

                // Force empty selection visible
                folderSelect.value = "";
            } catch (err) { }
        }

        folderRow.appendChild(folderInput);
        folderRow.appendChild(folderBtn);
        folderRow.appendChild(folderMeta);
        folderRow.appendChild(folderSelect);

        // --- /Folder Picker + Dropdown ---

        var loadedLabel = document.createElement("div");
        loadedLabel.textContent = "";
        loadedLabel.style.fontSize = "12px";
        loadedLabel.style.color = "#bbb";

        // FIX: JSON driven icon and script loader
        var configBox = document.createElement("div");
        configBox.style.display = "flex";
        configBox.style.flexDirection = "column";
        configBox.style.gap = "8px";

        var jsonControls = document.createElement("div");
        jsonControls.style.display = "flex";
        jsonControls.style.flexDirection = "column";
        jsonControls.style.gap = "6px";

        var jsonRow1 = document.createElement("div");
        jsonRow1.style.display = "flex";
        jsonRow1.style.alignItems = "center";
        jsonRow1.style.gap = "8px";

        var jsonFileInput = document.createElement("input");
        jsonFileInput.type = "file";
        jsonFileInput.accept = ".json,application/json";
        jsonFileInput.style.display = "none";

        var jsonChooseBtn = document.createElement("button");
        jsonChooseBtn.type = "button";
        jsonChooseBtn.textContent = "Load json";
        jsonChooseBtn.style.padding = "8px 10px";
        jsonChooseBtn.style.borderRadius = "10px";
        jsonChooseBtn.style.border = "1px solid rgba(255,255,255,0.12)";
        jsonChooseBtn.style.background = "rgba(255,255,255,0.06)";
        jsonChooseBtn.style.color = "white";
        jsonChooseBtn.style.fontWeight = "700";
        jsonChooseBtn.style.cursor = "pointer";

        var jsonUrlInput = document.createElement("input");
        jsonUrlInput.type = "text";
        jsonUrlInput.placeholder = "json url";
        jsonUrlInput.style.flex = "1";
        jsonUrlInput.style.padding = "8px 10px";
        jsonUrlInput.style.borderRadius = "10px";
        jsonUrlInput.style.border = "1px solid rgba(255,255,255,0.12)";
        jsonUrlInput.style.background = "rgba(0,0,0,0.25)";
        jsonUrlInput.style.color = "white";

        var jsonLoadUrlBtn = document.createElement("button");
        jsonLoadUrlBtn.type = "button";
        jsonLoadUrlBtn.textContent = "Load";
        jsonLoadUrlBtn.style.padding = "8px 10px";
        jsonLoadUrlBtn.style.borderRadius = "10px";
        jsonLoadUrlBtn.style.border = "0";
        jsonLoadUrlBtn.style.background = "#21b26b";
        jsonLoadUrlBtn.style.color = "white";
        jsonLoadUrlBtn.style.cursor = "pointer";
        jsonLoadUrlBtn.style.fontSize = "12px";
        jsonLoadUrlBtn.style.fontWeight = "800";

        var jsonClearBtn = document.createElement("button");
        jsonClearBtn.type = "button";
        jsonClearBtn.textContent = "Clear";
        jsonClearBtn.style.padding = "8px 10px";
        jsonClearBtn.style.borderRadius = "10px";
        jsonClearBtn.style.border = "1px solid rgba(255,255,255,0.12)";
        jsonClearBtn.style.background = "rgba(255,255,255,0.06)";
        jsonClearBtn.style.color = "white";
        jsonClearBtn.style.fontWeight = "700";
        jsonClearBtn.style.cursor = "pointer";

        // FIX: Show the JSON icon panel again
        var jsonShowPanelBtn = document.createElement("button");
        jsonShowPanelBtn.type = "button";
        jsonShowPanelBtn.textContent = "Panel";
        jsonShowPanelBtn.style.padding = "8px 10px";
        jsonShowPanelBtn.style.borderRadius = "10px";
        jsonShowPanelBtn.style.border = "1px solid rgba(255,255,255,0.12)";
        jsonShowPanelBtn.style.background = "rgba(255,255,255,0.06)";
        jsonShowPanelBtn.style.color = "white";
        jsonShowPanelBtn.style.fontWeight = "700";
        jsonShowPanelBtn.style.cursor = "pointer";

        jsonRow1.appendChild(jsonChooseBtn);
        jsonRow1.appendChild(jsonUrlInput);
        jsonRow1.appendChild(jsonLoadUrlBtn);
        jsonRow1.appendChild(jsonShowPanelBtn); // FIX
        jsonRow1.appendChild(jsonClearBtn);
        jsonControls.appendChild(jsonRow1);

        var jsonHint = document.createElement("div");
        jsonHint.textContent = "Json can build icon buttons that open tools or set scripts";
        jsonHint.style.fontSize = "11px";
        jsonHint.style.color = "#9aa";
        jsonControls.appendChild(jsonHint);

        var iconsHost = document.createElement("div");
        iconsHost.style.display = "flex";
        iconsHost.style.flexDirection = "column";
        iconsHost.style.gap = "10px";
        iconsHost.style.paddingTop = "6px";

        configBox.appendChild(jsonFileInput);
        configBox.appendChild(jsonControls);
        configBox.appendChild(iconsHost);

        function getStoredPanelConfigText() { // FIX
            try { return localStorage.getItem(STORAGE_PANEL_JSON) || ""; } catch (e) { return ""; }
        }

        function setStoredPanelConfigText(txt) { // FIX
            try { localStorage.setItem(STORAGE_PANEL_JSON, s(txt || "")); } catch (e) { }
        }

        function clearStoredPanelConfig() { // FIX
            try { localStorage.removeItem(STORAGE_PANEL_JSON); } catch (e) { }
        }

        function parsePanelConfig(txt) { // FIX
            var raw = s(txt || "");
            if (!raw.trim()) return null;
            var cfg = null;
            try { cfg = JSON.parse(raw); } catch (e1) { throw new Error("Bad json"); }
            if (!cfg || typeof cfg !== "object") throw new Error("Bad json");
            // FIX: Accept { tabs: [tab objects] } and convert to groups for the icon panel
            if (!cfg.groups && cfg.tabs && Array.isArray(cfg.tabs)) {
                cfg.groups = [];
                for (var ti = 0; ti < cfg.tabs.length; ti += 1) {
                    var t = cfg.tabs[ti] || {};
                    cfg.groups.push({
                        id: (typeof t.id === "string" ? t.id : ""),
                        name: (typeof t.label === "string" ? t.label : (typeof t.name === "string" ? t.name : "")),
                        label: (typeof t.label === "string" ? t.label : (typeof t.name === "string" ? t.name : ("Tab " + (ti + 1)))),
                        tabIcon: (typeof t.tabIcon === "string" ? t.tabIcon : ""),
                        items: (t.items && Array.isArray(t.items)) ? t.items : []
                    });
                }
            }

            // Accept either { groups: [items] } or { items: [items] }
            if (!cfg.groups && cfg.items && Array.isArray(cfg.items)) {
                cfg.groups = [{ name: "Tools", items: cfg.items }];
            }
            if (!cfg.groups || !Array.isArray(cfg.groups)) throw new Error("Missing groups");
            return cfg;
        }

        function clearIconsHost() { // FIX
            while (iconsHost.firstChild) iconsHost.removeChild(iconsHost.firstChild);
        }

        function makeIconEl(item) { // FIX
            var wrap = document.createElement("div");
            wrap.style.width = "28px";
            wrap.style.height = "28px";
            wrap.style.display = "flex";
            wrap.style.alignItems = "center";
            wrap.style.justifyContent = "center";
            wrap.style.borderRadius = "8px";
            wrap.style.overflow = "hidden";

            var svg = item && item.iconSvg ? s(item.iconSvg) : "";
            var url = item && item.iconUrl ? s(item.iconUrl) : "";

            if (svg) {
                try {
                    wrap.innerHTML = svg;
                    var s0 = wrap.querySelector("svg");
                    if (s0) {
                        s0.setAttribute("width", "22");
                        s0.setAttribute("height", "22");
                        s0.style.display = "block";
                    }
                } catch (e1) { wrap.textContent = "•"; }
                return wrap;
            }

            if (url) {
                var img = document.createElement("img");
                img.src = url;
                img.alt = s(item && item.label ? item.label : "");
                img.style.width = "22px";
                img.style.height = "22px";
                img.style.objectFit = "contain";
                wrap.appendChild(img);
                return wrap;
            }

            wrap.textContent = "•";
            return wrap;
        }

        function resolveActionTarget(action) { // FIX
            var t = s(action && action.target ? action.target : "");
            if (t === "panel" || t === "fullscreen") return t;
            return fullscreenCheck && fullscreenCheck.checked ? "fullscreen" : "panel";
        }

        function runPanelConfigAction(item) { // FIX
            var action = item && item.action ? item.action : null;
            if (!action || typeof action !== "object") return;

            var type = s(action.type || "");

            if (type === "openUrl") {
                var url = s(action.url || item.url || "");
                if (!url) return;
                openToolFromUrl(url, { target: resolveActionTarget(action) });
                return;
            }

            if (type === "setDefaultScriptOnSelection") {
                var src = s(action.source || "");
                var srcUrl = s(action.sourceUrl || "");
                if (srcUrl) {
                    fetchText(srcUrl).then(function (t) {
                        Bridge.setDefaultScriptOnSelection(s(t));
                        alert("Script set on selection");
                    }).catch(function (e) {
                        alert("Script load failed\n" + s(e && e.message ? e.message : e));
                    });
                    return;
                }
                Bridge.setDefaultScriptOnSelection(src);
                alert("Script set on selection");
                return;
            }

            if (type === "appendDefaultScriptOnSelection") {
                var add = s(action.source || "");
                var addUrl = s(action.sourceUrl || "");
                function doAppend(t) {
                    var cur = "";
                    try { cur = s(Bridge.getDefaultScriptOnSelection()); } catch (e1) { cur = ""; }
                    var next = cur ? (cur + "\n\n" + s(t)) : s(t);
                    Bridge.setDefaultScriptOnSelection(next);
                    alert("Script updated on selection");
                }
                if (addUrl) {
                    fetchText(addUrl).then(doAppend).catch(function (e) { alert("Script load failed\n" + s(e && e.message ? e.message : e)); });
                    return;
                }
                doAppend(add);
                return;
            }

            if (type === "callBridge") {
                var fn = s(action.fn || "");
                if (!fn || !Bridge || !isFn(Bridge[fn])) {
                    alert("Bridge fn missing");
                    return;
                }
                var args = action.args;
                if (!Array.isArray(args)) args = [];
                try {
                    var r = Bridge[fn].apply(Bridge, args);
                    if (r && typeof r.then === "function") {
                        r.then(function (x) { console.log("[LukeTools] callBridge result", x); });
                    } else {
                        console.log("[LukeTools] callBridge result", r);
                    }
                } catch (e2) {
                    alert("Bridge call failed\n" + s(e2 && e2.message ? e2.message : e2));
                }
                return;
            }

            if (type === "alert") {
                alert(s(action.message || ""));
                return;
            }

            alert("Unknown action");
        }

        function buildJsonIconPanelHtml(cfg) { // FIX
            // Build the Luke Tools icon panel inside the iframe, driven by JSON config
            var safeCfg = cfg || {};
            var title = s(safeCfg.title || "Luke Tools");
            var groups = (safeCfg.groups && safeCfg.groups.length) ? safeCfg.groups : [];

            function escHtml(str) {
                str = s(str);
                return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
            }

            function normUrl(u) {
                u = s(u || "");
                if (!u) return "";
                // If relative, keep as is. If starts with // or http(s) or data, keep. If starts with / keep.
                return u;
            }
            // FIX: Added pick helper used by icon panel renderer
            function pick(obj, keys, fallback) {
                obj = obj || {};
                keys = keys || [];
                for (var i = 0; i < keys.length; i++) {
                    var k = keys[i];
                    if (k && Object.prototype.hasOwnProperty.call(obj, k)) {
                        var v = obj[k];
                        if (v !== undefined && v !== null && String(v) !== "") return v;
                    }
                }
                return fallback;
            }
            // FIX: no placeholder tiles, only render real tools found in JSON

            function makeToolButton(it) {
                it = it || {};
                var idHint = pick(it, ["id"], ""); // FIX: id hover hint
                var toolUrl = pick(it, ["toolUrl", "url", "scriptUrl", "path"], "");
                var name = pick(it, ["label", "name", "id"], "");
                var icon = pick(it, ["iconUrl", "icon", "iconPath"], "");
                var fs = (it && (it.F_Screen === 0 || it.F_Screen === 1)) ? String(it.F_Screen) : "";
                var pw = (it && it.panelWidth !== undefined && it.panelWidth !== null) ? String(it.panelWidth) : "";
                var ph = (it && it.panelHeight !== undefined && it.panelHeight !== null) ? String(it.panelHeight) : "";
                var css = pick(it, ["cssUrl"], "");

                var btn =
                    "<button class=\"tool-btn\" type=\"button\"" +
                    " title=\"" + escHtml(idHint || name) + "\"" + // FIX: show id on hover
                    " data-url=\"" + escHtml(toolUrl) + "\"" +
                    " data-name=\"" + escHtml(name) + "\"" +
                    " data-id=\"" + escHtml(idHint || "") + "\"" + // FIX: store id

                    " data-fs=\"" + escHtml(fs) + "\"" +
                    " data-pw=\"" + escHtml(pw) + "\"" +
                    " data-ph=\"" + escHtml(ph) + "\"" +
                    " data-css=\"" + escHtml(css) + "\"" +
                    ">";
                if (icon) {
                    btn += "<img class=\"tool-icon\" alt=\"" + escHtml(name) + "\" src=\"" + escHtml(normUrl(icon)) + "\">";
                }
                btn += "</button>";
                return btn;
            }

            function makeTabButton(g, idx, active) {
                var label = s(g && (g.label || g.name || g.id) ? (g.label || g.name || g.id) : ("Tab " + (idx + 1)));
                var icon = s(g && (g.tabIcon || g.iconUrl || g.icon) ? (g.tabIcon || g.iconUrl || g.icon) : "");
                return (
                    "<button class=\"tab-btn" + (active ? " active" : "") + "\" type=\"button\" data-tab=\"" + idx + "\" title=\"" + escHtml(label) + "\">" +
                    (icon ? ("<img class=\"tab-icon\" alt=\"" + escHtml(label) + "\" src=\"" + escHtml(normUrl(icon)) + "\">") : "") +
                    "</button>"
                );
            }

            function makePane(g, idx, active) {
                var items = (g && g.items && g.items.length) ? g.items : [];
                var html = "<div class=\"pane" + (active ? " active" : "") + "\" data-tab=\"" + idx + "\">";
                if (items.length) {
                    html += "<div class=\"grid\">";
                    for (var i = 0; i < items.length; i += 1) {
                        html += makeToolButton(items[i]);
                    }
                    html += "</div>";
                } else {
                    html += "<div class=\"empty\">No tools</div>"; // FIX: hide unused slots when tab has no items
                }
                html += "</div>";
                return html;
            }

            var firstLabel = groups.length ? s(groups[0].label || groups[0].name || groups[0].id || "") : "";
            var groupMetaJson = "[]"; // FIX: sandbox import button group metadata
            try {
                groupMetaJson = JSON.stringify(groups.map(function (g) {
                    return { id: s(g && g.id ? g.id : ""), label: s(g && (g.label || g.name) ? (g.label || g.name) : "") };
                }));
            } catch (e) { groupMetaJson = "[]"; }

            var tabsHtml = "";
            var panesHtml = "";

            for (var gi = 0; gi < groups.length; gi += 1) {
                tabsHtml += makeTabButton(groups[gi], gi, gi === 0);
                panesHtml += makePane(groups[gi], gi, gi === 0);
            }
            // FIX: If no groups, show no unused slots

            var html =
                "<!doctype html>" +
                "<html>" +
                "<head>" +
                "<meta charset=\"utf-8\">" +
                "<style>" +
                "html,body{margin:0;padding:0;background:transparent;color:#eaeaea;font-family:Arial, sans-serif;overflow-x:hidden;}body{overflow-y:auto;}" + // FIX: prevent horizontal overflow in icon panel iframe
                
                ".wrap{padding:10px 10px 12px 10px;}" +
                ".topbar{display:flex;flex-direction:column;align-items:stretch;justify-content:flex-start;gap:8px;background:rgba(0,0,0,0.18);border-radius:0;padding:8px 10px 8px 10px;}" + // FIX: group name above tabs
                ".labelrow{display:flex;align-items:center;justify-content:flex-start;}" + // FIX
                ".tabsrow{display:flex;align-items:center;justify-content:center;}"+ // FIX: center tabs row

                ".label{font-size:14px;font-weight:700;opacity:0.95;}" +
                ".tabs{display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:nowrap;padding:0 12px;}"+ // FIX: centered tabs with side padding

                ".right{display:flex;gap:10px;align-items:center;}" + // FIX: sandbox import button container
                ".sandboxbar{display:none;align-items:center;gap:10px;margin-top:8px;}" + // FIX: sandbox import row
                ".import-btn{height:28px;border:0;background:rgba(255,255,255,0.08);border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0 10px;font-size:12px;color:#eaeaea;}" + // FIX: sandbox import button
                ".import-btn:hover{background:rgba(255,255,255,0.16);}" + // FIX
                ".import-icon{width:18px;height:18px;display:block;}" + // FIX
                ".tab-btn{width:35px;height:35px;border:0;background:rgba(255,255,255,0.08);border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;}" + // FIX: smaller tab buttons
                ".tab-btn.active{background:rgba(255,255,255,0.16);}" +
                ".tab-icon{width:19px;height:19px;display:block;filter:brightness(2);}"+ // FIX: smaller tab icons

                ".panes{margin-top:10px;}" +
                ".pane{display:none;}" +
                ".pane.active{display:block;}" +
                ".grid{display:grid;grid-template-columns:repeat(auto-fill, 42px);column-gap:8px;row-gap:8px;justify-content:center;align-content:start;grid-auto-flow:row;padding:2px 6px 0 6px;box-sizing:border-box;}"+ // FIX: tighter centered tool grid no horizontal scroll

                ".empty{opacity:0.6;font-size:12px;padding:10px;}" + // FIX: empty tab message

                ".tool-btn,.tool-tile{width:100%;aspect-ratio:1/1;border-radius:8px;border:2px solid rgba(255,255,255,0.20);background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;}"+ // FIX: slightly smaller rounding for smaller tiles

                ".tool-btn{cursor:pointer;}" +
                ".tool-btn:hover{background:rgba(255,255,255,0.08);}" +
                ".tool-icon{width:22px;height:22px;display:block;filter:brightness(2);}"+ // FIX: smaller tool icons

                ".placeholder{opacity:0.55;cursor:default;}" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class=\"wrap\">" +
                "<div class=\"topbar\">" +
                "<div class=\"labelrow\"><div id=\"lt_label\" class=\"label\">" + escHtml(firstLabel) + "</div></div>" + // FIX: group name above tabs
                "<div class=\"tabsrow\"><div class=\"tabs\">" + tabsHtml + "</div></div>" + // FIX
                "</div>" +
                "<div id=\"lt_sandboxbar\" class=\"sandboxbar\">" + // FIX: sandbox import row
                "<button id=\"lt_import\" class=\"import-btn\" type=\"button\" title=\"Import\">Import</button>" + // FIX: sandbox import button
                "<input id=\"lt_file\" type=\"file\" multiple style=\"display:none\" accept=\".js,.html,.htm,.txt\">" + // FIX: hidden file input
                "</div>" +
                "</div>" +
                "<div class=\"panes\">" + panesHtml + "</div>" +
                "</div>" +
                "<script>" +
                "(function(){" +
                "function qsa(s,p){return Array.prototype.slice.call((p||document).querySelectorAll(s));}" +
                "var labelEl=document.getElementById('lt_label');" +
                "var tabs=qsa('.tab-btn');" +
                "var panes=qsa('.pane');" +
                "var sandboxBar=document.getElementById('lt_sandboxbar');" + // FIX: sandbox import row
                "var importBtn=document.getElementById('lt_import');" + // FIX: sandbox import button
                "var fileInput=document.getElementById('lt_file');" + // FIX
                "var groupMeta=" + groupMetaJson + ";" + // FIX: group metadata for sandbox detection
                "function setActive(i){" +
                "  for(var t=0;t<tabs.length;t++){tabs[t].classList.toggle('active', String(tabs[t].getAttribute('data-tab'))===String(i));}" +
                "  for(var p=0;p<panes.length;p++){panes[p].classList.toggle('active', String(panes[p].getAttribute('data-tab'))===String(i));}" +
                "  try{var a=tabs.filter(function(b){return String(b.getAttribute('data-tab'))===String(i);})[0]; if(a && a.title){labelEl.textContent=a.title;}}" +
                "  catch(e){}" +
                "  try{var meta=groupMeta&&groupMeta[Number(i)]?groupMeta[Number(i)]:null;var id=(meta&&meta.id?String(meta.id):'').toLowerCase();var lab=(meta&&meta.label?String(meta.label):'').toLowerCase();var isSb=(id==='sandbox'||lab==='sandbox');if(importBtn) importBtn.style.display=isSb?'flex':'none';if(sandboxBar) sandboxBar.style.display=isSb?'flex':'none';}catch(e1){}" + // FIX: show import only on Sandbox tab

                "}" +
                "tabs.forEach(function(tb){tb.addEventListener('click', function(e){e.preventDefault();e.stopPropagation();setActive(tb.getAttribute('data-tab'));});});" +
                "try{setActive(0);}catch(einit){}" + // FIX: init active tab state
                "if(importBtn && fileInput){importBtn.addEventListener('click', function(e){e.preventDefault();e.stopPropagation();try{fileInput.value='';fileInput.click();}catch(e0){}});fileInput.addEventListener('change', function(e){try{var f=(fileInput.files&&fileInput.files.length)?fileInput.files[0]:null;if(!f) return;var r=new FileReader();r.onload=function(){try{var txt=String(r.result||'');var lower=String(f.name||'').toLowerCase();var t0=txt.trim();var isHtml=lower.endsWith('.html')||lower.endsWith('.htm')||t0.indexOf('<!doctype')===0||t0.indexOf('<html')===0;var payload={type:'LukeToolsRunJsonToolText',url:'',text:txt,isJs:(!isHtml),name:String(f.name||'Imported'),id:String(f.name||'Imported'),fs:'0',F_Screen:'0',panelWidth:'',panelHeight:'',cssUrl:''};try{parent.postMessage(payload,'*');}catch(ep){}}catch(e1){}};r.readAsText(f);}catch(e2){}});}" +"qsa('.tool-btn').forEach(function(btn){" +
                "  btn.addEventListener('click', function(e){" +
                "    e.preventDefault();e.stopPropagation();" +
                "    var payload={type:'LukeToolsRunJsonTool'," +
                "      url:btn.getAttribute('data-url')||''," +
                "      name:btn.getAttribute('data-name')||''," +
                "      id:btn.getAttribute('data-id')||''," + // FIX: send id
                "      fs:btn.getAttribute('data-fs')||''," + // FIX: normalized field for parent
                "      F_Screen:btn.getAttribute('data-fs')||''," + // FIX: keep legacy field
                "      panelWidth:btn.getAttribute('data-pw')||''," +
                "      panelHeight:btn.getAttribute('data-ph')||''," +
                "      cssUrl:btn.getAttribute('data-css')||''};" +

                "    try{parent.postMessage(payload,'*');}catch(e0){}" +
                "  });" +
                "});" +
                "})();" +
                "</script>" +
                "</body>" +
                "</html>";

            return html;
        }

        function showJsonIconPanel(cfg) { // FIX
            try {
                var htmlDoc = buildJsonIconPanelHtml(cfg || null);
                runToolInPanel(htmlDoc);
                try { setPanelToolCloseVisible(false); } catch (e1) { } // FIX
            } catch (e) { }
        }

        function setPanelToolCloseVisible(v) { // FIX
            try {
                var panel = document.getElementById(PANEL_ID);
                if (!panel) return;
                var b = panel.__LT_toolCloseBR;
                if (b) b.style.display = v ? "block" : "none";
            } catch (e) { }
        }


        function renderPanelConfig(cfg) { // FIX
            // Keep the parsed config available and show the icon panel in the iframe
            try { window.__LT_panelCfg = cfg; } catch (e0) { } // FIX: expose loaded panel config
            try { showJsonIconPanel(cfg); } catch (e) { }
            try {
                if (!window.__LT_showIconPanelNow) {
                    window.__LT_showIconPanelNow = function () { // FIX: allow showPanel to force icon panel
                        try {
                            var c = window.__LT_panelCfg || null;
                            if (c) showJsonIconPanel(c);
                            else autoLoadPanelConfig();
                        } catch (e1) { }
                    };
                }
            } catch (e2) { }
        }

        function applyPanelConfigText(txt) { // FIX
            var cfg = null;
            try { cfg = parsePanelConfig(txt); } catch (e1) { alert("Bad json\n" + s(e1 && e1.message ? e1.message : e1)); cfg = null; }
            if (cfg) renderPanelConfig(cfg);
            return cfg;
        }

        function loadStoredPanelConfig() { // FIX
            var t = getStoredPanelConfigText();
            if (!t) return;
            applyPanelConfigText(t);
        }

        function getDefaultPanelConfigUrlCandidates() { // FIX: allow config.json name and local dev paths
            var out = [];
            try {
                var u = window.LukeToolsPanelConfigUrl ? s(window.LukeToolsPanelConfigUrl) : "";
                if (u && u.trim()) out.push(u.trim());
            } catch (e0) { }

            try {
                var u2 = localStorage.getItem("LukeToolsPanelConfigUrl") || "";
                if (u2 && String(u2).trim()) out.push(String(u2).trim());
            } catch (e1) { }

            // Same folder as this BridgeTool script
            try {
                var same = computePanelConfigUrlSameFolder(); // FIX
                if (same && String(same).trim()) out.push(String(same).trim()); // FIX
            } catch (e0) { }

            // Common local dev locations (served from public)
            out.push("/LukeToolsPanelConfig.json"); // FIX
            out.push("/LukeTools/config.json"); // FIX
            out.push("/config.json"); // FIX
            out.push(LT_GITHUB_RAW_BASE + "scripts/config.json"); // FIX: public scripts folder
            out.push(LT_GITHUB_RAW_BASE + "scripts/tools.json"); // FIX: alternate config name

            // Fallback to the built in default
            if (DEFAULT_PANEL_JSON_URL) out.push(String(DEFAULT_PANEL_JSON_URL).trim()); // FIX

            // De dupe while preserving order
            var seen = {};
            var uniq = [];
            for (var i = 0; i < out.length; i += 1) {
                var k = s(out[i]).trim();
                if (!k) continue;
                if (seen[k]) continue;
                seen[k] = true;
                uniq.push(k);
            }
            return uniq;
        }

        function autoLoadPanelConfig() { // FIX: try stored JSON, else try multiple candidate URLs
            var existing = "";
            try { existing = getStoredPanelConfigText(); } catch (e0) { existing = ""; }

            if (existing && String(existing).trim()) {
                try { applyPanelConfigText(String(existing)); } catch (e1) { }
                return;
            }

            var candidates = [];
            try { candidates = getDefaultPanelConfigUrlCandidates(); } catch (e2) { candidates = []; }

            if (!candidates || !candidates.length) return;

            var i = 0;

            function tryNext() {
                if (i >= candidates.length) {
                    return;
                }

                var u = String(candidates[i] || "").trim();
                i += 1;

                if (!u) return tryNext();

                fetchText(u).then(function (t) {
                    // Validate JSON before storing
                    try {
                        applyPanelConfigText(String(t));
                        setStoredPanelConfigText(String(t));
                        try { localStorage.setItem("LukeToolsPanelConfigUrl", u); } catch (e3) { }
                    } catch (e4) {
                        // Bad json, continue to next candidate
                        tryNext();
                    }
                }).catch(function () {
                    // Not found, continue to next candidate
                    tryNext();
                });
            }

            tryNext();
        }

        jsonChooseBtn.addEventListener("click", function (e) { // FIX
            e.preventDefault();
            e.stopPropagation();
            try { jsonFileInput.click(); } catch (e1) { }
        });

        jsonFileInput.addEventListener("change", function () { // FIX
            var f = jsonFileInput.files && jsonFileInput.files[0] ? jsonFileInput.files[0] : null;
            if (!f) return;
            var reader = new FileReader();
            reader.onload = function () {
                var txt = s(reader.result || "");
                setStoredPanelConfigText(txt);
                applyPanelConfigText(txt);
                try { loadedLabel.textContent = "Loaded json: " + s(f.name || ""); } catch (e2) { }
            };
            reader.readAsText(f);
        });

        jsonLoadUrlBtn.addEventListener("click", function (e) { // FIX
            e.preventDefault();
            e.stopPropagation();
            var u = s(jsonUrlInput.value || "").trim();
            if (!u) return;
            fetchText(u).then(function (t) {
                setStoredPanelConfigText(s(t));
                applyPanelConfigText(s(t));
                try { loadedLabel.textContent = "Loaded json url"; } catch (e2) { }
            }).catch(function (err) {
                alert("Json load failed\n" + s(err && err.message ? err.message : err));
            });

            jsonShowPanelBtn.addEventListener("click", function (e) { // FIX
                e.preventDefault();
                e.stopPropagation();
                try { loadStoredPanelConfig(); } catch (e1) { }
            });
        });

        jsonClearBtn.addEventListener("click", function (e) { // FIX
            e.preventDefault();
            e.stopPropagation();
            clearStoredPanelConfig();
            clearIconsHost();
            try { clearPanelTool(); } catch (e3) { } // FIX
            try { loadedLabel.textContent = ""; } catch (e2) { }
        });

        // Load any saved config on startup
        try { loadStoredPanelConfig(); } catch (e) { }
        try { autoLoadPanelConfig(); } catch (e2) { } // FIX

        var optionsRow = document.createElement("div");
        optionsRow.style.display = "flex";
        optionsRow.style.alignItems = "center";
        optionsRow.style.justifyContent = "space-between";
        optionsRow.style.gap = "10px";

        var fullscreenWrap = document.createElement("label");
        fullscreenWrap.style.display = "flex";
        fullscreenWrap.style.alignItems = "center";
        fullscreenWrap.style.gap = "8px";
        fullscreenWrap.style.fontSize = "12px";
        fullscreenWrap.style.color = "#bbb";

        var fullscreenCheck = document.createElement("input");
        fullscreenCheck.type = "checkbox";
        fullscreenCheck.checked = false;

        var fsTxt = document.createElement("span");
        fsTxt.textContent = "Fullscreen";

        fullscreenWrap.appendChild(fullscreenCheck);
        fullscreenWrap.appendChild(fsTxt);

        var openFsBtn = document.createElement("button");
        openFsBtn.type = "button";
        openFsBtn.textContent = "Open fullscreen";
        openFsBtn.style.padding = "10px";
        openFsBtn.style.borderRadius = "10px";
        openFsBtn.style.border = "0";
        openFsBtn.style.background = "#21b26b";
        openFsBtn.style.color = "white";
        openFsBtn.style.cursor = "pointer";
        openFsBtn.style.fontSize = "13px";
        openFsBtn.style.fontWeight = "700";

        optionsRow.appendChild(fullscreenWrap);
        optionsRow.appendChild(openFsBtn);

        var repairBtn = document.createElement("button");
        repairBtn.textContent = "Repair scripts";
        repairBtn.style.padding = "10px 14px";
        repairBtn.style.borderRadius = "10px";
        repairBtn.style.border = "1px solid #333";
        repairBtn.style.background = "#2a2a2a";
        repairBtn.style.color = "#eee";
        repairBtn.style.cursor = "pointer";
        repairBtn.style.fontWeight = "700";

        repairBtn.addEventListener("click", function () {
            try {
                var res = Bridge.repairProjectDefaultScripts({
                    onlyDefault: true,
                    clearBroken: true,
                    reportOnly: false,
                    backup: true
                });

                var msg = "Repair complete\n" +
                    "Owners scanned: " + String(res.owners) + "\n" +
                    "Scripts checked: " + String(res.scriptsChecked) + "\n" +
                    "Bad scripts found: " + String(res.badScripts) + "\n" +
                    "Cleared: " + String(res.cleared) + "\n" +
                    "Backed up: " + String(res.backedUp) + "\n\n" +
                    "Backups are stored in localStorage keys starting with " + "LukeToolsBrokenScriptBackup";

                console.log("[LukeTools] Repair result", res);
                alert(msg);
            } catch (e) {
                console.error("[LukeTools] Repair failed", e);
                alert("Repair failed\n" + (e && e.message ? e.message : String(e)));
            }
        });

        optionsRow.appendChild(repairBtn);

        topBox.appendChild(fileRow);
        topBox.appendChild(folderRow);
        topBox.appendChild(loadedLabel);
        topBox.appendChild(configBox); // FIX: JSON config UI
        topBox.appendChild(optionsRow);

        var toolFrame = document.createElement("iframe");
        toolFrame.id = PANEL_IFRAME_ID;
        toolFrame.style.width = "100%";
        toolFrame.style.border = "0";
        toolFrame.style.background = "transparent";
        toolFrame.style.display = "block";
        toolFrame.style.height = "540px"; // FIX: fill panel with icon launcher

        body.appendChild(topBox);
        body.appendChild(toolFrame);

        // FIX: close button bottom right for panel tools
        var toolCloseBR = document.createElement("button");
        toolCloseBR.type = "button";
        toolCloseBR.textContent = "Close"; // FIX: label should read Close
        toolCloseBR.title = "Close"; // FIX: match label
        toolCloseBR.style.position = "absolute";
        toolCloseBR.style.left = "50%"; // FIX: center bottom close button
        toolCloseBR.style.transform = "translateX(-50%)"; // FIX: center bottom close button // FIX: move in from edge so it is never cut off
        toolCloseBR.style.bottom = "18px"; // FIX: move in from edge so it is never cut off
        toolCloseBR.style.width = "88px"; // FIX: fit Close label
        toolCloseBR.style.height = "42px"; // FIX: larger tap target
        toolCloseBR.style.borderRadius = "14px"; // FIX: match other rounded buttons
        toolCloseBR.style.border = "1px solid rgba(255,255,255,0.12)";
        toolCloseBR.style.background = "rgba(255,255,255,0.08)";
        toolCloseBR.style.color = "white";
        toolCloseBR.style.cursor = "pointer";
        toolCloseBR.style.fontSize = "14px"; // FIX
        toolCloseBR.style.fontWeight = "700";
        toolCloseBR.style.zIndex = "999999"; // FIX: keep above iframe scrollbars
        toolCloseBR.style.display = "none";

        toolCloseBR.addEventListener("pointerdown", function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        toolCloseBR.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            try { resetPanelSizeToDefault(); } catch (e0) { }
            try { showJsonIconPanel(window.__LT_panelCfg || null); } catch (e1) { }
            try { setPanelToolCloseVisible(false); } catch (e2) { }
        });

        panel.__LT_toolCloseBR = toolCloseBR; // FIX: store reference
        panel.appendChild(toolCloseBR); // FIX

        panel.appendChild(header);
        panel.appendChild(body);
        document.body.appendChild(panel);

        function setPanelToolHeight(h) {
            var fr = document.getElementById(PANEL_IFRAME_ID);
            if (!fr) return;

            var minH = 140;
            var maxH = Math.max(180, Math.floor(window.innerHeight * 0.78));
            var v = parseInt(h, 10);
            if (isNaN(v)) v = 220;
            if (v < minH) v = minH;
            if (v > maxH) v = maxH;

            fr.style.height = v + "px";
            clampPanelToView();
        }

        window.addEventListener("message", function (evt) {
            var fr = document.getElementById(PANEL_IFRAME_ID);
            if (!fr || !fr.contentWindow) return;
            if (evt.source !== fr.contentWindow) return;

            var data = evt.data;
            if (!data || typeof data !== "object") return;

            if (data.type === "LukeToolsToolHeight") {
                setPanelToolHeight(data.h);
                return;
            }

            // FIX: Run tool selected from JSON icon panel
            
            // FIX: Run tool imported from Sandbox as raw text (no blob URLs from srcdoc origin)
            if (data.type === "LukeToolsRunJsonToolText") { // FIX
                try {
                    var t0 = s(data.text || "");
                    if (!t0) return;

                    // FIX: if raw JS, wrap it in an HTML document so it executes
                    if (data && data.isJs) { // FIX
                        t0 = __LT_wrapJsToolAsHtml(t0); // FIX
                    }

                    var runFullscreen = true; // FIX: keep launcher visible, open tools fullscreen
                    t0 = stripFScreenDirectives(t0);

                    lastLoaded.name = s(data.name || "Sandbox Import");
                    lastLoaded.htmlDoc = ensureHtmlDocument(t0);

                    // FIX: inject cssUrl from JSON into the tool document
                    try {
                        var __cssUrlT = s(data && (data.cssUrl || data.css || data.css_url) ? (data.cssUrl || data.css || data.css_url) : "");
                        if (!__cssUrlT) __cssUrlT = s(data && data.cssUrl !== undefined ? data.cssUrl : "");
                        if (__cssUrlT) {
                            var __uT = __cssUrlT;
                            try { __uT = new URL(__cssUrlT, window.location.href).href; } catch (eUT0) { }
                            lastLoaded.htmlDoc = lastLoaded.htmlDoc.replace("</head>", "<link rel=\"stylesheet\" href=\"" + escapeAttr(__uT) + "\"></head>");
                        }
                    } catch (eCT0) { }

                    loadedLabel.textContent = ""; // FIX

                    // FIX: honor F_Screen from message and allow in-file override
                    var __fsRawT = (data && (data.fs !== undefined && data.fs !== null)) ? data.fs : (data ? data.F_Screen : undefined); // FIX
                    var __fsFromItemT = (__fsRawT !== undefined && __fsRawT !== null && String(__fsRawT).trim() !== "") ? parseInt(String(__fsRawT), 10) : NaN; // FIX
                    var __fsInFileT = detectFScreenFlag(t0); // FIX
                    var __finalFsT = (!isNaN(__fsFromItemT)) ? __fsFromItemT : 1; // FIX
                    if (__fsInFileT === 0 || __fsInFileT === 1) __finalFsT = __fsInFileT; // FIX
                    if (__finalFsT === 1) {
                        try { resetPanelSizeToDefault(); } catch (eRT0) { } // FIX
                        openFullscreen(lastLoaded.htmlDoc);
                        try { setPanelToolCloseVisible(false); } catch (eVT1) { } // FIX
                    } else {
                        try { applyPanelSizeFromMessage(data); } catch (eRT1) { } // FIX
                        runToolInPanel(lastLoaded.htmlDoc);
                        try { setPanelToolCloseVisible(true); } catch (eVT0) { } // FIX
                    }

                    log("[LukeTools] loaded from sandbox text", lastLoaded.name, "fullscreen", runFullscreen); // FIX
                } catch (e) {
                    alert("Sandbox import failed\n" + s(e && e.message ? e.message : e));
                }
                return;
            }

if (data.type === "LukeToolsRunJsonTool") {
                var u = s(data.url || "").trim();
                if (!u) return;

                fetchText(u).then(function (raw) {
                    var t = s(raw || "");
                    var runFullscreen = true; // FIX: keep launcher visible, open tools fullscreen
                    t = stripFScreenDirectives(t);

                    lastLoaded.name = s(data.name || u);
                    lastLoaded.htmlDoc = ensureHtmlDocument(t);


                    // FIX: inject cssUrl from JSON into the tool document
                    try {
                        var __cssUrl = s(data && (data.cssUrl || data.css || data.css_url) ? (data.cssUrl || data.css || data.css_url) : "");
                        if (!__cssUrl) __cssUrl = s(data && data.cssUrl !== undefined ? data.cssUrl : "");
                        if (__cssUrl) {
                            var __u = __cssUrl;
                            try { __u = new URL(__cssUrl, window.location.href).href; } catch (eU0) { }
                            lastLoaded.htmlDoc = lastLoaded.htmlDoc.replace("</head>", "<link rel=\"stylesheet\" href=\"" + escapeAttr(__u) + "\"></head>");
                        }
                    } catch (eC0) { }


                    loadedLabel.textContent = ""; // FIX

                    // FIX: honor F_Screen from JSON and allow in-file override
                    var __fsRaw = (data && (data.fs !== undefined && data.fs !== null)) ? data.fs : (data ? data.F_Screen : undefined); // FIX: accept fs or F_Screen
                    var __fsFromItem = (__fsRaw !== undefined && __fsRaw !== null && String(__fsRaw).trim() !== "") ? parseInt(String(__fsRaw), 10) : NaN; // FIX
                    var __fsInFile = detectFScreenFlag(t); // FIX
                    var __finalFs = (!isNaN(__fsFromItem)) ? __fsFromItem : 1; // FIX
                    if (__fsInFile === 0 || __fsInFile === 1) __finalFs = __fsInFile; // FIX
                    if (__finalFs === 1) {
                        try { resetPanelSizeToDefault(); } catch (eR0) { } // FIX
                        openFullscreen(lastLoaded.htmlDoc);
                        try { setPanelToolCloseVisible(false); } catch (eV1) { } // FIX
                    } else {
                        try { applyPanelSizeFromMessage(data); } catch (eR1) { } // FIX
                        runToolInPanel(lastLoaded.htmlDoc);
                        try { setPanelToolCloseVisible(true); } catch (eV0) { } // FIX
                    }

                    log("[LukeTools] loaded from json", lastLoaded.name, "fullscreen", runFullscreen); // FIX
                }).catch(function (err) {
                    alert("Tool load failed\n" + s(err && err.message ? err.message : err));
                });

                return;
            }
        });

        function runToolInPanel(htmlDoc) {
            var fr = document.getElementById(PANEL_IFRAME_ID);
            if (!fr) return;
            try { fr.srcdoc = htmlDoc; } catch (e1) { fr.srcdoc = ""; }
        }

        function clearPanelTool() {
            var fr = document.getElementById(PANEL_IFRAME_ID);
            if (!fr) return;
            try {
                fr.srcdoc =
                    "<!doctype html><html><head><meta charset=\"utf-8\"><style>html,body{margin:0;background:transparent;font-family:Arial, sans serif;color:#eaeaea}body{padding:10px}</style></head><body>No tool loaded</body></html>";
            } catch (e) { }
        }


        function detectFScreenFlag(rawText) {
            try {
                var t = s(rawText || "");
                // Prefer explicit variable declaration: var/let/const F_Screen = 1;
                var m = t.match(/(?:^|\n|\r)\s*(?:var|let|const)\s+F_Screen\s*=\s*([01])\s*;?/);
                if (m && m[1] !== undefined) return parseInt(m[1], 10);

                // Allow HTML meta: <meta name="F_Screen" content="1">
                var mm = t.match(/<meta\s+[^>]*name\s*=\s*["']F_Screen["'][^>]*content\s*=\s*["']([01])["'][^>]*>/i);
                if (mm && mm[1] !== undefined) return parseInt(mm[1], 10);

                // Allow data attribute: data-f_screen="1" or data-f-screen="1"
                var md = t.match(/data-f[_-]screen\s*=\s*["']([01])["']/i);
                if (md && md[1] !== undefined) return parseInt(md[1], 10);
            } catch (e) { }
            return null;
        }


        // F_Screen is a one-shot directive for THIS run only.
        // It must NOT permanently toggle the fullscreen checkbox.
        // We also strip the directive from the tool text before running.
        function stripFScreenDirectives(rawText) {
            var t = s(rawText || "");
            try {
                // Remove lines like: var/let/const F_Screen = 1;
                t = t.replace(/(^|\r?\n)\s*(?:var|let|const)\s+F_Screen\s*=\s*[01]\s*;?\s*(?=\r?\n|$)/g, "$1");

                // Remove meta directive: <meta name="F_Screen" content="1">
                t = t.replace(/<meta\s+[^>]*name\s*=\s*["']F_Screen["'][^>]*>\s*/ig, "");
            } catch (e) { }
            return t;
        }

        function decideFullscreenForRun(rawText) {
            try {
                var v = detectFScreenFlag(rawText);
                if (v === 1) return true;
                if (v === 0) return false;
            } catch (e) { }
            return !!fullscreenCheck.checked;
        }

        function loadFile(file) {
            if (!file) return;

            var reader = new FileReader();
            reader.onload = function (e) {
                var raw = s(e.target.result || "");
                var runFullscreen = decideFullscreenForRun(raw);
                raw = stripFScreenDirectives(raw);
                lastLoaded.name = s(file.name || "");
                lastLoaded.htmlDoc = ensureHtmlDocument(raw);

                loadedLabel.textContent = "";

                if (runFullscreen) {
                    openFullscreen(lastLoaded.htmlDoc);
                        try { setPanelToolCloseVisible(false); } catch (eV1) { } // FIX
                    clearPanelTool();
                } else {
                    runToolInPanel(lastLoaded.htmlDoc);
                        try { setPanelToolCloseVisible(true); } catch (eV0) { } // FIX
                }

                log("[LukeTools] loaded", lastLoaded.name, "fullscreen", runFullscreen);
            };
            reader.readAsText(file);
        }

        fileInput.addEventListener("change", function () {
            var f = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
            loadFile(f);
        });

        reloadBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            var f = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
            if (f) loadFile(f);
        });


        // Folder picker: build dropdown from a chosen folder
        folderInput.addEventListener("change", function () {
            try {
                var all = folderInput.files ? Array.prototype.slice.call(folderInput.files) : [];
                // Keep only .txt/.html/.htm
                folderFiles = (all || []).filter(function (f) {
                    var nm = s(f && f.name ? f.name : "").toLowerCase();
                    if (nm.indexOf(".user.") !== -1) return false;
                    return (nm.slice(-4) === ".txt" || nm.slice(-5) === ".html" || nm.slice(-4) === ".htm");
                });

                folderFiles.sort(function (a, b) {
                    var ap = s(a && (a.webkitRelativePath || a.name) ? (a.webkitRelativePath || a.name) : "");
                    var bp = s(b && (b.webkitRelativePath || b.name) ? (b.webkitRelativePath || b.name) : "");
                    return ap.localeCompare(bp, undefined, { numeric: true, sensitivity: "base" });
                });

                rebuildFolderDropdown();

                // Do NOT auto-load. User must choose from dropdown.
                folderMeta.textContent = folderFiles.length ? (folderFiles.length + " files") : "No .txt/.html files";
                folderSelect.value = "";

                log("[LukeTools] folder loaded", folderFiles.length, "files");
            } catch (err) {
                log("[LukeTools] folder load error", err && err.message ? err.message : String(err));
            }
        });

        // Dropdown selection: load tool into panel/fullscreen like normal
        folderSelect.addEventListener("change", function () {
            try {
                if (!folderSelect.value) return;
                var idx = parseInt(folderSelect.value, 10);
                if (isNaN(idx) || !folderFiles[idx]) return;
                loadFile(folderFiles[idx]);
            } catch (err) {
                log("[LukeTools] dropdown load error", err && err.message ? err.message : String(err));
            }
        });


        // Folder button -> open directory picker
        folderBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            try { folderInput.click(); } catch (err) { }
        });

        openFsBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (!lastLoaded || !lastLoaded.htmlDoc) return;
            openFullscreen(lastLoaded.htmlDoc);
                        try { setPanelToolCloseVisible(false); } catch (eV1) { } // FIX
        });

        var dragging = false;
        var startX = 0;
        var startY = 0;
        var startLeft = 0;
        var startTop = 0;

        function isInteractiveTarget(t) {
            if (!t) return false;
            var tag = (t.tagName || "").toLowerCase();
            if (tag === "button" || tag === "input" || tag === "select" || tag === "textarea" || tag === "a") return true;
            return false;
        }

        header.addEventListener("pointerdown", function (e) {
            if (isInteractiveTarget(e.target)) return;

            dragging = true;
            startX = e.clientX;
            startY = e.clientY;

            startLeft = parseInt(panel.style.left || "10", 10);
            startTop = parseInt(panel.style.top || "90", 10);
            if (isNaN(startLeft)) startLeft = 10;
            if (isNaN(startTop)) startTop = 90;

            header.style.cursor = "grabbing";
            try { header.setPointerCapture(e.pointerId); } catch (e0) { }

            e.preventDefault();
            e.stopPropagation();
        });

        header.addEventListener("pointermove", function (e) {
            if (!dragging) return;

            var dx = e.clientX - startX;
            var dy = e.clientY - startY;

            var nx = startLeft + dx;
            var ny = startTop + dy;

            var w = panel.offsetWidth || 620;
            var h = panel.offsetHeight || 420;

            var maxX = Math.max(0, window.innerWidth - w);
            var maxY = Math.max(0, window.innerHeight - h);

            if (nx < 0) nx = 0;
            if (ny < 0) ny = 0;
            if (nx > maxX) nx = maxX;
            if (ny > maxY) ny = maxY;

            setPanelPos(nx, ny);
        });

        function endDrag(e) {
            if (!dragging) return;
            dragging = false;
            header.style.cursor = "grab";
            try { header.releasePointerCapture(e.pointerId); } catch (e0) { }
        }

        header.addEventListener("pointerup", endDrag);
        header.addEventListener("pointercancel", endDrag);

        clearPanelTool();
        clampPanelToView();

        window.addEventListener("resize", function () {
            clampPanelToView();
        });
        return panel; // FIX
    }

    function mountLauncherOrObserve() {
        if (getDockNode()) {
            ensureLauncher(showPanel);
            return;
        }

        var obs = new MutationObserver(function () {
            if (getDockNode()) {
                ensureLauncher(showPanel);
                try { obs.disconnect(); } catch (e) { }
            }
        });

        try { obs.observe(document.documentElement, { childList: true, subtree: true }); } catch (e2) { }
    }

    setTimeout(function () {
        ensurePanel();
        hidePanel();
        mountLauncherOrObserve();
        ensureOverlay();
    }, 1200);

})();
